import axios from 'axios'
import { cLog } from '../components/functions/cLog'
//import { updateGoogleSheet, createVerifSheetBody } from '../components/functions/googleApi'
// import VerificationLogs from '../models/VerificationLogs'
import VerifiedUsers from '../models/VerifiedUsers'
import { BotEvent, CustomEvents, EventType, GuildIds } from '../types'
import { selectServer } from '../components/functions/selectServer'
import { Client } from 'discord.js'
const event: BotEvent = {
    name: CustomEvents.VerifyUser,
    type: EventType.ON,
    async execute(bot: Client, userId:string, mode:string) {
        let discordServerId: GuildIds
        switch (mode) {
            case 'wowpvp':
            case 'wowpve':
                discordServerId = GuildIds.SKILLCAPPED_WOW
                break
            case 'valorant':
                break
            case 'dev':
                discordServerId = GuildIds.DEV
                break
            default:
                
        }
        if (!discordServerId) return
        const discordServer = await bot.guilds.fetch(discordServerId)
        const discordUser = await discordServer.members.fetch(userId)
        if (!discordUser) return
        const serverConfig = selectServer(discordServerId)
        const premiumRoleId = serverConfig?.[mode]?.premiumRoleId || serverConfig?.premiumRoleId
        try {
            discordUser.roles.add(premiumRoleId)
        } catch (err) {
            console.error('Error adding role to user', err, premiumRoleId)
        }
    },
}
export default event

async function checkIfAccountAlreadyLinked(interaction) {
    const linkedAccounts = await VerifiedUsers.findOne({
        where: {
            userId: interaction.user.id 
        }
    })
    if (!linkedAccounts) return [false, true]

    return [true, false]
}

function ignoreIfAlreadyReplied(err) {
    if (err.message === 'The reply to this interaction has already been sent or deferred.') 
        return true
    
    throw err
}

/* {
    "success": true,
    "data": {
        "emailExistsFirebase": true,
        "emailExistsMongo": false,
        "userImported": false
    },
    "errorMsgUser": null
} */

async function verifyUserOnWebsite(email) {
    const response = await axios.post('https://www.skill-capped.com/api/user/importaccount', {
        email
    }, {
        headers: { 'Content-Type': 'application/json' },
        
    })
    console.log('response : ', response.data)
    if (response.data.success !== 'success') { // This is if website handled request. Returns success even if no user found
        return [null, true]
    }
    if (response.data.data.emailExistsFirebase) return [true, null]
    return [false, null]
    
}

async function grantUserPremium(interaction, server, serverPart) {
    const role = await interaction.guild.roles.fetch(server.premiumRoleId || server[serverPart].premiumRoleId)
    cLog(['Found role  : ', role.name], { guild: interaction.guild, subProcess: 'VerifyUser' })
    
    await interaction.member.roles.add(role)
    await interaction.reply({ content:'Your account has been succesfully linked!', ephemeral: true })
        .catch(ignoreIfAlreadyReplied)
    cLog(['User granted premium  : ', interaction.user.username], { guild: interaction.guild, subProcess: 'VerifyUser' })
}



