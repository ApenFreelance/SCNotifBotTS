import axios from 'axios'
import { BotEvent, CustomEvents, EventType } from '../types'
import VerifiedUsers from '../models/VerifiedUsers'
import { cLog } from '../components/functions/cLog'

const event: BotEvent = {
    name: CustomEvents.InitVerifyUser,
    type: EventType.ON,
    async execute(interaction, server) { 
        /*
        * Regarding the server param:
        * Do i actually care if they are connected to something???? 
        * Yeah seems useful in selecting if its pve or pvp
        * But at the same time, maybe allow user to select that after connecting. So verify, then allow selecting roles.
        */                              
        // Check if user in db 
        const [_, created] = await checkIfAccountAlreadyLinked(interaction.user.id)
        if (created) {
            // Respond with already linked
            // For now lets just give them the role and whatnot. Already linked anyway right?
            await giveUserPremium(interaction, server, '')
            return
        }
        // Respond with relink
        await interaction.reply({ content: `[Log in to connect your account](${requestUserVerification()})`, ephemeral: true })
        // Rest handles on server (?)

    }
}
export default event

/**
 * Function that checks if the discord user is already linked to another account. 
 * There will be another check after getting a response from SC saying if the SC account is already linked as well.
 * How will we handle failed links?... Who knows
 * 
 */
async function checkIfAccountAlreadyLinked(userId) {
    return VerifiedUsers.findOrCreate({
        where: {
            userId, 
        }
    })
}

function generateRandomString(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) 
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    
    return result
}

function requestUserVerification() {
    const linkId = generateRandomString(10)
    const SCEndpoint = `https://skill-capped.com/api/discord-verify/${linkId}`

    return SCEndpoint
    const response = axios.post(SCEndpoint)
    console.log(response)

}


async function giveUserPremium(interaction, server, serverPart) {
    // Get the role from either config or server object TBD
    const role = await interaction.guild.roles.fetch(server.premiumRoleId || server[serverPart].premiumRoleId)
    cLog(['Found role  : ', role.name], { guild: interaction.guild, subProcess: 'VerifyUser' })
    
    await interaction.member.roles.add(role)
    await interaction.reply({ content:'Your account has been succesfully linked!', ephemeral: true })
        .catch(ignoreIfAlreadyReplied)
    cLog(['User granted premium  : ', interaction.user.username], { guild: interaction.guild, subProcess: 'VerifyUser' })
}

function ignoreIfAlreadyReplied(err) {
    if (err.message === 'The reply to this interaction has already been sent or deferred.') 
        return true
    
    throw err
}
