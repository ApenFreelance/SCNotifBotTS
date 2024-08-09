import dotenv from 'dotenv'
import { readdirSync } from 'fs'
import { mainBuildHandler } from './components/functions/buildHandler'
import { Collection, Client, GatewayIntentBits } from 'discord.js'
import { db } from './db'
import { cLog } from './components/functions/cLog'
import WoWCharacters from './models/WoWCharacters'
import WoWReviewHistory from './models/WoWReviewHistory'
import ReviewTimerOverwrite from './models/ReviewTimerOverwrite'
import PVEWoWReviewHistory from './models/PVEWoWReviewHistory'
import VerificationLogs from './models/VerificationLogs'
import VerifiedUsers from './models/VerifiedUsers'
import { join } from 'path'
import BotConfig from '../config/Bot.config.json'
dotenv.config()

function validateEnvVariables() {
    const missingVariables = []
    for (const variable in BotConfig.envvariables.required) {
        if (!process.env[variable]) 
            missingVariables.push(variable)
    }
    if (missingVariables.length > 0) 
        throw new Error(`${missingVariables} is not set in environment variables`)
}

function initializeBotClient(): Client {
    return new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
        ],
        presence: { activities: [{ name: 'Ranking up' }], status: 'online' },
    })
}

async function loadHandlers(bot: Client): Promise<void> {
    const handlersDir = join(__dirname, './handlers')
    const handlerFiles = readdirSync(handlersDir).filter(file => file.endsWith('.js'))
    for (const file of handlerFiles) {
        const { default: handler } = await import(`${handlersDir}/${file}`)
        handler.default(bot)
    }
}

function initializeModels(): void {
    const models = [WoWReviewHistory, ReviewTimerOverwrite, PVEWoWReviewHistory, WoWCharacters, VerificationLogs, VerifiedUsers]
    models.forEach((model) => {
        model.initModel(db)
        model.sync()
    })
}

function setupEventListeners(bot: Client): void {
    bot.on('ready', async () => {
        cLog([`${bot.user.username} has logged in`], { subProcess: 'Start-up' })
        initializeModels()

        cLog(['Starting up buildHandler'], { subProcess: 'Start-up' })
        try {
            mainBuildHandler()
            setInterval(mainBuildHandler, 24 * 60 * 60 * 1000)
        } catch (err) {
            cLog(['Error in buildHandler : ', err], { subProcess: 'Interval' })
        }
    })

    bot.rest.on('rateLimited', () => {
        console.log('[ RATE LIMIT ]')
    })

    process.on('unhandledRejection', (error) => {
        console.error('Unhandled promise rejection:', error)
    })
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception : ', error)
    })
}

async function start(): Promise<void> {
    validateEnvVariables()

    const bot = initializeBotClient()
    bot.slashCommands = new Collection()

    await loadHandlers(bot)
    setupEventListeners(bot)

    try {
        await bot.login(process.env.BOT_TOKEN)
        console.log('Bot started')
    } catch (err) {
        console.error('Error starting bot : ', err)
    }
}

start().catch((err) => {
    console.error('Error in start function : ', err)
})
