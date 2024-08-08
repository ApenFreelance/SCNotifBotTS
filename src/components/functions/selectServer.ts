import serverInfoJSON from '../../../config/serverInfo.json';

function selectServer(serverId) {
    for (let key in serverInfoJSON) {
        if (serverInfoJSON[key].serverId === serverId) {
            if (key == "Dev") {
                // THIS IS SET IN SERVERJSON
                return serverInfoJSON[key];
            }
            serverInfoJSON[key].serverName = key;
            return serverInfoJSON[key];
        }
    }
    return null;
}

export { selectServer };
