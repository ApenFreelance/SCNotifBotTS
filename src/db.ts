
import { Sequelize } from 'sequelize';
import serverInfoJSON from '../serverInfo.json';
import DevValReviewHistory from './models/DevValReviewHistory';
import DevWoWReviewHistory from './models/DevWoWReviewHistory';
import DevPVEWoWReviewHistory from './models/DevPVEWoWReviewHistory';

import ValReviewHistory from './models/ValReviewHistory';
import WoWReviewHistory from './models/WoWReviewHistory';
import WoWCharacters from './models/WoWCharacters';
import PVEWoWReviewHistory from './models/PVEWoWReviewHistory';

const db = new Sequelize(
    process.env.dbName,
    process.env.dbName,
    process.env.dbPass,
    {
        host: process.env.dbHost,
        dialect: "mariadb",
        logging: false,
    }
);

const tableMapping = {
    reviewHistory: {
        [serverInfoJSON["Valorant"].serverId]: ValReviewHistory,
        [serverInfoJSON["WoW"].serverId]: {
            wowpve: PVEWoWReviewHistory,
            wowpvp: WoWReviewHistory,
        },
        [serverInfoJSON["Dev"].serverId]: {
            Valorant: DevValReviewHistory,
            WoW: DevWoWReviewHistory,
        },
    },
    WoWCharacter: {
        [serverInfoJSON["WoW"].serverId]: WoWCharacters,
    }
};

async function getCorrectTable(guildId, tableGroup, mode = null) {
    try {
        const table = tableMapping[tableGroup][guildId];
        if (typeof table === "object") {
            return mode ? table[mode] : null;
        }
        return table;
    } catch (err) {
        cLog(["ERROR ", err], { guild: guildId,subProcess: "getCorrectTable" });
    }
}

module.exports = { db, getCorrectTable };
