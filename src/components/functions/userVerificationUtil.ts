import { Client, GuildMember } from 'discord.js'
import { GuildIds } from '../../types'
import { selectServer } from './selectServer'
import { serverInfo } from '../../../config/bot.config.json'

/**
 * Grants a user premium access by adding a premium role to their Discord account.
 * 
 * @param {Object} params - The parameters for granting premium access.
 * @param {Client} params.bot - The Discord bot client.
 * @param {string} [params.userId] - The ID of the user to grant premium access to. Either `userId` or `member` must be provided.
 * @param {string} [params.mode] - The mode or category for which the premium access is being granted. Either `mode` or `discordServerId` must be provided.
 * @param {string} [params.discordServerId] - The ID of the Discord server. Either `mode` or `discordServerId` must be provided.
 * @param {GuildMember} [params.member] - The Discord guild member object. Either `userId` or `member` must be provided.
 * 
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 * 
 * @throws {Error} - Throws an error if neither `mode` nor `discordServerId` is provided, or if neither `userId` nor `member` is provided.
 */
async function grantUserPremium({ bot, userId, mode, discordServerId, member  }: { bot: Client, userId?: string, mode?: string, discordServerId?: string, member?: GuildMember }) {
    if (!mode && !discordServerId) 
        throw new Error('Either mode or discordServerId must be provided.')
    if (!userId && !member) 
        throw new Error('Either userId or member must be provided.')
    
    if (!discordServerId) { // If no server ID is provided, we need to determine it based on the mode
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
    }
    if (!discordServerId) return // If we still don't have a server ID, we can't proceed
    
    // Fetch tries doing cache.get first
    const discordServer = await bot.guilds.fetch(discordServerId)
    const discordUser = member || await discordServer.members.fetch(userId)
    if (!discordUser) return // If we can't find the user, we can't proceed
    const serverConfig = selectServer(discordServerId)
    const premiumRoleId = serverConfig?.[mode]?.premiumRoleId || serverConfig?.premiumRoleId
    try {
        discordUser.roles.add(premiumRoleId)
    } catch (err) {
        console.error('Error adding role to user', err, premiumRoleId)
    }
}

async function removeAllAccess({ bot, userId }) {
    /**
     * TODO : Implement the logic to remove all access from a user
     * Couple requirements:
     * 1. Parse all servers we support
     * 2. Parse the roles all servers have ( that are premium )
     * 3. Remove those roles from the user
     */

    for (const serverName in serverInfo) {
        const serverConfig = serverInfo[serverName]
        let userInServer
        let discordServer
        try {
            discordServer = await bot.guilds.fetch(serverConfig.serverId)

        } catch ( err ) {
            console.log(`Server not found ${serverName}`, err)
            continue
        }
        try {
            userInServer = await discordServer.members.fetch(userId)
        } catch (err) {
            console.log(`User not found in server ${serverName}`, err)
            continue
        }
        // Temp        
        if (serverName !== 'WoW') {
            userInServer.roles.remove(serverConfig['premiumRoleId'])
            continue
        }
        const premiumRoleId = [serverConfig['wowpve'].premiumRoleId, serverConfig['wowpvp'].premiumRoleId]
        for (const roleId of premiumRoleId) {
            try {
                userInServer.roles.remove(roleId)
            } catch (err) {
                console.error(`Error removing role ${roleId} from user ${userId} in server ${serverName}`, err)
            }
        }

    }
    return
}






export { grantUserPremium, removeAllAccess }
