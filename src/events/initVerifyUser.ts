import axios from 'axios'
import { AccessLevel, BotEvent, CustomEvents, EventType, GuildIds, MillieTimeEnum } from '../types'
import VerifiedUsers from '../models/VerifiedUsers'
import { cLog } from '../components/functions/cLog'
import { envvariables } from '../../config/bot.config.json'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { grantUserPremium } from '../components/functions/userVerificationUtil'


const event: BotEvent = {
    name: CustomEvents.InitVerifyUser,
    type: EventType.ON,
    async execute(interaction, server, serverPart = '') { 
        /*
        * Regarding the server param:
        * Do i actually care if they are connected to something???? 
        * Yeah seems useful in selecting if its pve or pvp
        * But at the same time, maybe allow user to select that after connecting. So verify, then allow selecting roles.
        */                              
        // Check if user in db 
        const [userAccount, _] = await checkIfAccountAlreadyLinked(interaction.user.id, interaction.user.username, server.serverId)
        /**
             * cant think so i write.
             * 
             * OKOKOKOKOKOKOK
             * Still cant think
             * if account is created then its new. Check if the linkid exists?  
             * IF account is not created then its because it already exists.  
             * This can easily happen if you get verified for 2 parts. 
             * If found check if the discord id is unique. Set unique in db??  
             * Ok but what if not? This is just init. So an account *shouldnt* exist right?  
             * Since it doesnt exist simply make an entry and handle it on the other end after getting the update from SC.
             * Easy right?
             * 
             * Changed my mind. Lets ignore the created part. Lets just check the accessLevel right away. Set default to no access
             * 
             * 
             */

        // Respond with already linked
        // For now lets just give them the role and whatnot. Already linked anyway right?

        if (userAccount.accessLevel !== AccessLevel.NO_ACCESS) {
            // Sorta temporary. 
            grantUserPremium({ bot: interaction.client, userId: interaction.user.id, mode: serverPart, member: interaction.member, discordServerId: interaction.guild.id })
            return
        }

        
        if (userAccount.linkExpirationTime < new Date()) {
            cLog(['Link expired  : ', userAccount.linkId], { guild: interaction.guild, subProcess: 'VerifyUser' })
            userAccount.linkId = generateRandomString()
            userAccount.linkExpirationTime = new Date(Date.now() + (envvariables.validLinkTimeInMinutes * MillieTimeEnum.ONE_MINUTE))
            try {
                await userAccount.save()
            } catch (err) {
                console.log('Could not save user', err)
                await interaction.reply({ content: 'Something went wrong try again later', ephemeral: true })
                return
            }
        }

        // Respond with relink
        const verificationEndpoint = `http://localhost:3000/test/verify-user/${userAccount.linkId}`
        
        const response = await requestUserVerification(verificationEndpoint).catch((err) => {
            console.log('Could not reach server', err)
            return err.response
        })
        if (response?.status == 200) {
            console.log(response)
            await interaction.reply({ content: 'Something went wrong try again later', ephemeral: true })
            return
        }
        await interaction.reply({ content: 'Log in and then click this verification button again', components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Log in')
                .setURL(verificationEndpoint)
                .setStyle(ButtonStyle.Link)
        )], ephemeral: true })
        // Rest handles on server (?)
    }
}
export default event

/**
 * Function that checks if the discord user is already linked to another account.  
 * There will be another check after getting a response from SC saying if the SC account is already linked as well.  
 * How will we handle failed links?... Who knows
 */
async function checkIfAccountAlreadyLinked(userId: string, username: string, server: GuildIds) {
    return VerifiedUsers.findOrCreate({
        where: {
            userId, 
        },
        defaults: {
            username,
            server,
            linkId: generateRandomString(),
            linkExpirationTime: new Date(Date.now() + (envvariables.validLinkTimeInMinutes * MillieTimeEnum.ONE_MINUTE)),
            accessLevel: AccessLevel.NO_ACCESS
        }
    })
}

function generateRandomString(length: number = 10): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) 
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    
    return result
}

async function requestUserVerification(SCEndpoint: string) {
    return await axios.post(SCEndpoint)
}

