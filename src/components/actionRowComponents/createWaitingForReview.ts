import classes from '../../../config/classes.json'
import { cLog } from '../functions/cLog'
import { waitingForReviewRow } from '../buttons'
import { createWaitingForReviewEmbed } from '../embeds'
const noBreakSpace = '\u00A0'

async function createWaitingForReviewMessage(interaction, charInfo,
    reviewHistory,
    improvementInput,
    consentInput,
    linkToUserPage,
    inputName,
    server,
    mode = null
) {
    const member = await interaction.guild.members.fetch(interaction.user.id)
    const submissionChannel = await interaction.client.channels.fetch(server[mode]?.submissionChannelId || server.submissionChannelId)
    let description = null
    if (server.serverName === 'WoW') {
        if (charInfo === null) 
            description = `E-mail:\u00A0\u00A0\u00A0\u00A0\u00A0**${reviewHistory.userEmail}**\nArmory:\u00A0\u00A0\u00A0\u00A0**[${inputName}](${linkToUserPage})**\n\n**Failed to get data from Blizzard**`
        else {
            description = `E-mail:\u00A0\u00A0\u00A0\u00A0\u00A0**${reviewHistory.userEmail}**\nArmory:\u00A0\u00A0\u00A0\u00A0**[${charInfo.characterName}](${linkToUserPage})**\nItem level:\u00A0**${charInfo.armorLevel}**\nClass:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0**${charInfo.characterClass}**\nRegion:\u00A0\u00A0\u00A0\u00A0**${charInfo.characterRegion}**`
            if (mode === 'wowpvp') 
                description = addWoWPVPRoleStats(charInfo, description)
            else if (mode === 'wowpve') {
                description += `\nSpecialization:${noBreakSpace.repeat(5)}**${charInfo.specialization}**`
                description += `\nMythic+ Score:${noBreakSpace.repeat(5)}**${charInfo.mythicPlusScore}**`
            }
        }
        description += `\n\nI consent to my review being used by Skill-Capped: **${consentInput}**  `
    }

    description += `\n\nClip to review: **${reviewHistory.clipLink}**`
    description += `\nWhat they want to improve on: **${improvementInput}**`
    await submissionChannel.send({ embeds: [await createWaitingForReviewEmbed(interaction, reviewHistory, member, description)], components:[waitingForReviewRow(mode)] })
    cLog(['Successfully sent submission'], {
        guild: interaction.guildId,
        subProcess: 'CreateWaitingForReview',
    })
}



function addWoWPVPRoleStats(charInfo, description) {
    const maxLengt = 60

    const addRating = (rating, label) => {
        if (rating !== null && rating !== undefined) {
            const n = `\n\n__${label}:**${rating}**__`.length
            description += `\n\n__${label}:${noBreakSpace.repeat(maxLengt - n)}**${rating}**__`
        }
    }

    addRating(charInfo.twoVtwoRating, '2v2')
    addRating(charInfo.threeVthreeRating, '3v3')

    for (let i = 0; i < 4; i++) {
        const rating = charInfo[`soloShuffleSpec${i + 1}Rating`]
        const label = `Shuffle ${classes[charInfo.characterClass][i]}`
        addRating(rating, label)
    }

    return description
}

export { createWaitingForReviewMessage }
