//import { updateGoogleSheet, createVerifSheetBody } from '../components/functions/googleApi'
// import VerificationLogs from '../models/VerificationLogs'
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





