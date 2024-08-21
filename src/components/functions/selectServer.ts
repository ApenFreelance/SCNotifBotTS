import botConfig from '../../../config/bot.config.json'
import { ServerInfo } from '../../types'
const serverInfoJSON = botConfig.serverInfo

/**
 * Selects the server information based on the provided server ID.
 * 
 * @param {string} serverId - The ID of the server to select.
 * @returns {ServerInfo|null} The server information if found, otherwise null.
 */
function selectServer(serverId: string): ServerInfo | null {
    for (const key in serverInfoJSON) {
        if (serverInfoJSON[key].serverId === serverId) {
            if (key === 'Dev') {
                // THIS IS SET IN SERVERJSON
                return serverInfoJSON[key]
            }
            serverInfoJSON[key].serverName = key
            return serverInfoJSON[key]
        }
    }
    return null
}

export { selectServer }
