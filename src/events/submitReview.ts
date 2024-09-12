import { wow } from 'blizzard.js'
import classes from '../../config/classes.json'
import { createWaitingForReviewMessage } from '../components/actionRowComponents/createWaitingForReview'
import { cLog } from '../components/functions/cLog'
import { reduceTimeBetweenUses, getOverwrites, getShortestOverwrite } from '../components/functions/timerOverwrite'
import { BotEvent, CharacterData, CustomEvents, EventType } from '../types'
import WoWReviewHistory from '../models/WoWReviewHistory'
import WoWCharacters from '../models/WoWCharacters'

const event: BotEvent = {
    name: CustomEvents.SubmitReview,
    type: EventType.ON,
    async execute(interaction, server, mode = null) {
        try {
            await interaction.reply({ content: 'Attempting to submit review...', ephemeral: true })

            const { improvement, consentInput, linkToUserPage, accountName, accountRegion, accountSlug, wowClient, characterData } = await handleWoWServer(interaction, server)

            if (!characterData) {
                await interaction.editReply({ content: 'Failed to get character data. Please check your input.', ephemeral: true })
                return
            }

            const [lastReview, created] = await findOrCreateLastReview(interaction)
            console.log(mode)
            if (created) {
                await handleNewUser(interaction, characterData, lastReview, improvement, consentInput, linkToUserPage, accountName, server, mode)
                return
            }

            const shortest = await getShortestOverwriteForUser(interaction, server)

            if (Date.now() - shortest.timeBetween * 1000 <= lastReview.createdAt.getTime()) {
                await interaction.editReply({ content: `You can send a new submission in <t:${lastReview.createdAt.getTime() / 1000 + parseInt(shortest.timeBetween)}:R> ( <t:${lastReview.createdAt.getTime() / 1000 + parseInt(shortest.timeBetween)}> )`, ephemeral: true })
                return
            }

            if (shortest.uses !== 'unlimited') 
                await reduceTimeBetweenUses(shortest.userId, interaction.guildId)
            

            await createNewReviewEntry(interaction, characterData, lastReview, improvement, consentInput, linkToUserPage, accountName, server, mode)
        } catch (e) {
            console.error(e)
            await interaction.editReply({ content: 'Something went wrong when submitting. Please contact staff', ephemeral: true })
        }
    }
}

export default event

async function handleWoWServer(interaction, server) {
    let linkToUserPage = null
    let wowClient = null
    let accountName = null
    let accountRegion = null
    let accountSlug = null
    let characterData: CharacterData | null = null

    if (server.serverName === 'WoW') {
        linkToUserPage = interaction.fields.getTextInputValue('armory');
        [accountRegion, accountSlug, accountName] = decodeURI(linkToUserPage)
            .toLowerCase()
            .replace('https://worldofwarcraft.com/', '')
            .replace('https://worldofwarcraft.blizzard.com/', '')
            .replace('/character/', '/')
            .split('/')
            .slice(1)

        wowClient = await connectToWoW(interaction, accountRegion)
        if (!wowClient) {
            await interaction.editReply({ content: 'Failed to connect to Blizzard API.', ephemeral: true })
            return { improvement: null, consentInput: null, linkToUserPage, accountName, accountRegion, accountSlug, wowClient, characterData }
        }
        try {
            characterData = await getCharacterInfo(accountRegion, accountSlug, accountName, wowClient, linkToUserPage, interaction.guildId)
        } catch (err) {
            console.error('Failed to get character data:', err)
            characterData = null
        }
    } else 
        await interaction.editReply({ content: 'This server is unknown', ephemeral: true })
    

    return { improvement: interaction.fields.getTextInputValue('improvementinput'), consentInput: interaction.fields.getTextInputValue('consentinput'), linkToUserPage, accountName, accountRegion, accountSlug, wowClient, characterData }
}

async function findOrCreateLastReview(interaction) {
    return await WoWReviewHistory.findOrCreate({
        where: { userID: interaction.user.id },
        defaults: {
            status: 'Available',
            userEmail: interaction.fields.getTextInputValue('email'),
            userTag: interaction.user.username,
            clipLink: interaction.fields.getTextInputValue('ytlink'),
        },
        order: [['created_at', 'DESC']],
    })
}

async function handleNewUser(interaction, characterData, verifiedAccount, improvement, consentInput, linkToUserPage, accountName, server, mode) {
    try {
        await createWaitingForReviewMessage(interaction, characterData, verifiedAccount, improvement, consentInput, linkToUserPage, accountName, server, mode)
    } catch (err) {
        console.error('Failed to create message for new user:', err)
        await interaction.editReply({ content: 'Something went wrong registering new user.', ephemeral: true })
    }

    await interaction.editReply({
        content: 'Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.',
        ephemeral: true,
    })
}

async function getShortestOverwriteForUser(interaction, server) {
    const { userTimeBetween, timeBetweenRoles } = await getOverwrites(interaction.user.id, interaction.member.roles.cache, server)
    return await getShortestOverwrite(userTimeBetween, timeBetweenRoles, interaction.guildId)
}

async function createNewReviewEntry(interaction, characterData, lastReview, improvement, consentInput, linkToUserPage, accountName, server, mode) {
    lastReview = await WoWReviewHistory.create({
        userEmail: interaction.fields.getTextInputValue('email'),
        userID: interaction.user.id,
        status: 'Available',
        userTag: interaction.user.username,
        clipLink: interaction.fields.getTextInputValue('ytlink'),
    })

    await createWaitingForReviewMessage(interaction, characterData, lastReview, improvement, consentInput, linkToUserPage, accountName, server, mode)

    await interaction.editReply({
        content: 'Thank you for requesting a free Skill Capped VoD Review.\n\nIf your submission is accepted, you will be tagged in a private channel where your review will be uploaded.\n\n**Videos above 15 minutes from unverified YouTube accounts will be removed by YouTube. Verify here:** https://www.youtube.com/verify',
        ephemeral: true,
    })
}

async function connectToWoW(interaction, accountRegion) {
    try {
        return await wow.createInstance({
            key: process.env.BCID,
            secret: process.env.BCS,
            origin: accountRegion,
            token: '',
        })
    } catch (err) {
        cLog([err], { guild: interaction.guild, subProcess: 'CreateWoWInstance' })
        return null
    }
}

async function getCharacterInfo(region, slug, characterName, wowClient, armoryLink, guildId) {
    const Cprofile = await getCharacterProfile(slug, characterName, wowClient, guildId)
    const pvpData = await getPVPData(slug, characterName, Cprofile.character_class.name, wowClient, guildId)
    const mythicPlusScore = await getMythicPlusScore(slug, characterName, wowClient, guildId)

    const characterData = await WoWCharacters.create({
        armoryLink,
        characterName: Cprofile.name,
        characterRegion: region,
        slug,
        armorLevel: Cprofile.equipped_item_level,
        characterClass: Cprofile.character_class.name,
        ...pvpData,
        specialization: Cprofile.active_spec.name,
        mythicPlusScore,
    })
    return characterData
}

async function getMythicPlusScore(realm, name, wowClient, guildId) {
    const mythicScore = await wowClient.characterMythicKeystone({ realm, name })
    cLog([`Mythic+: ${mythicScore.status}. [ ${mythicScore.statusText} ]`], { guild: guildId, subProcess: 'getMythic+' })
    return Math.floor(mythicScore?.data?.current_mythic_rating?.rating) || null
}

async function findRatings(realm, name, brackets, characterClass, wowClient) {
    const ratings = {
        twoVtwoRating: null,
        threeVthreeRating: null,
        soloShuffleSpec1Rating: null,
        soloShuffleSpec2Rating: null,
        soloShuffleSpec3Rating: null,
        soloShuffleSpec4Rating: null,
    }

    for (const bracket of brackets) {
        try {
            const bracketType = getBracketType(bracket.href, characterClass)
            if (bracketType) {
                const bracketInfo = await wowClient.characterPVP({ realm, name, bracket: bracketType })
                cLog([`getBracketData: ${bracketInfo.status}. [ ${bracketInfo.statusText} ]`], { subProcess: 'findRatings' })
                updateRatings(ratings, bracketType, bracketInfo.data.rating, characterClass)
            }
        } catch (err) {
            if (!err.toString().includes('TypeError: Cannot read properties of undefined (reading \'toLowerCase\')')) 
                console.error('Error when checking characterClasses:', err)
            
        }
    }

    return ratings
}

function getBracketType(href, characterClass) {
    const classSlug = characterClass.toLowerCase().replace(' ', '')
    const specs = classes[characterClass].map(spec => spec.toLowerCase().replace(' ', ''))
    if (href.includes('2v2')) return '2v2'
    if (href.includes('3v3')) return '3v3'
    for (let i = 0; i < specs.length; i++) 
        if (href.includes(`shuffle-${classSlug}-${specs[i]}`)) return `shuffle-${classSlug}-${specs[i]}`
    
    return null
}

function updateRatings(ratings, bracketType, rating, characterClass) {
    const specs = classes[characterClass].map(spec => spec.toLowerCase().replace(' ', ''))
    if (bracketType === '2v2') ratings.twoVtwoRating = rating
    else if (bracketType === '3v3') ratings.threeVthreeRating = rating
    else if (bracketType.includes('shuffle')) {
        for (let i = 0; i < specs.length; i++) {
            if (bracketType.endsWith(specs[i])) {
                ratings[`soloShuffleSpec${i + 1}Rating`] = rating
                break
            }
        }
    }
}

async function getPVPData(realm, name, characterClass, wowClient, guildId) {
    const Cpvp = await wowClient.characterPVP({ realm, name })
    cLog([`pvpSummary: ${Cpvp.status}. [ ${Cpvp.statusText} ]`], { guild: guildId, subProcess: 'getPVPData' })
    try {
        if (Cpvp.data.brackets) 
            return await findRatings(realm, name, Cpvp.data.brackets, characterClass, wowClient)
        
    } catch (e) {
        console.error('User most likely has no rank history:', e)
    }
    return {}
}

async function getCharacterProfile(realm, name, wowClient, guildId) {
    console.log(realm, name)
    console.log(wowClient)
    const Cprofile = await wowClient.characterProfile({ realm, name })
    cLog([`Cprofile: ${Cprofile.status}. [ ${Cprofile.statusText} ]`], { guild: guildId, subProcess: 'characterData' })
    return Cprofile.data
}

