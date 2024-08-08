import dotenv from 'dotenv'
import fs from 'fs';
import { mainBuildHandler } from './components/functions/buildHandler';
import { Collection, Client, GatewayIntentBits } from 'discord.js';
import { db } from "./db";
import { cLog } from './components/functions/cLog';
import WoWCharacters from './models/WoWCharacters';
import ValReviewHistory from './models/ValReviewHistory';
import DevValReviewHistory from './models/DevValReviewHistory';
import DevWoWReviewHistory from './models/DevWoWReviewHistory';
import WoWReviewHistory from './models/WoWReviewHistory';
import ReviewTimerOverwrite from './models/ReviewTimerOverwrite';
import DevPVEWoWReviewHistory from './models/DevPVEWoWReviewHistory';
import PVEWoWReviewHistory from './models/PVEWoWReviewHistory';
import VerificationLogs from './models/VerificationLogs';
import VerifiedUsers from './models/VerifiedUsers';

dotenv.config();
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
bot.commands = new Collection();
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
    //logChannelServer.send()
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception : ", error);
});

const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
const eventFiles = fs
    .readdirSync("./events")
    .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module

    bot.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args));
    } else {
        bot.on(event.name, (...args) => event.execute(...args));
    }
}

//bot.rest.on("restDebug", console.log)

bot.rest.on("rateLimited", (data) => {
    console.log(`[ RATE LIMIT ]`);
});

const models = [WoWReviewHistory, ReviewTimerOverwrite, PVEWoWReviewHistory, WoWCharacters, VerificationLogs, VerifiedUsers];

bot.on("ready", async () => {
    cLog([`${bot.user.username} has logged in`], { subProcess: "Start-up" });
    models.forEach((model) => {
        model.init(db);
        model.sync();
    });

    cLog(["Starting up buildHandler"], { subProcess: "Start-up" });
    try {
        mainBuildHandler();
        setInterval(mainBuildHandler, 24 * 60 * 60 * 1000);
    } catch (err) {
        cLog(["Error in buildHandler : ", err], { subProcess: "Interval" });
    }

});

async function start(): Promise<void> {

}


bot.login(process.env.BOT_TOKEN);

