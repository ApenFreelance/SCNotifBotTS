import botConfig from '../../../config/bot.config.json'
const serverInfoJSON = botConfig.serverInfo
function selectServer(serverId: string) {
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
