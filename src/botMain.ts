import { Collection, Client, GatewayIntentBits } from 'discord.js'
//import { BuildHandler } from './classes/BuildHandler'
import { readdirSync } from 'fs'
import { cLog } from './components/functions/cLog'
import { join } from 'path'
import BotConfig from '../config/bot.config.json'
import dotenv from 'dotenv'
import { SlashCommand } from './types'
import ExpressServer from './services/ExpressServer'
import dbInstance from './db'
dotenv.config()

/**
 * Validates that all required environment variables are set.
 * @throws {Error} If any required environment variables are missing.
 */
function validateEnvVariables() {
    const missingVariables = []
    for (const variable of BotConfig.envvariables.required) {
        if (!process.env[variable]) 
            missingVariables.push(variable)
    }
    if (missingVariables.length > 0) 
        throw new Error(`${missingVariables} is not set in environment variables`)
}

/**
 * Initializes and returns a new Discord bot client.
 * @returns {Client} The initialized Discord bot client.
 */
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

/**
 * Loads and initializes all handler files for the bot.
 * @param {Client} bot - The Discord bot client.
 * @returns {Promise<void>} A promise that resolves when all handlers are loaded.
 */
async function loadHandlers(bot: Client): Promise<void> {
    const handlersDir = join(__dirname, './handlers')
    const handlerFiles = readdirSync(handlersDir).filter(file => file.endsWith('.js') || file.endsWith('.ts'))
    
    for (const file of handlerFiles) {
        console.log(`Loading handler: ${file}`)
        try {
            const { default: handler } = await import(`${handlersDir}/${file}`)
            await handler(bot)
            console.log(`Successfully loaded handler: ${file}`)
        } catch (err) {
            console.error(`Error loading handler: ${file}`, err)
        }
    }
}


/**
 * Sets up event listeners for the bot client.
 * @param {Client} bot - The Discord bot client.
 */
function setupEventListeners(bot: Client): void {
    bot.on('ready', async () => {
        cLog([`${bot.user.username} has logged in`], { subProcess: 'Start-up' })

        cLog(['Starting up buildHandler'], { subProcess: 'Start-up' })
        cLog(['BUILD HANDLER CURRENTLY INACTIVE'], { subProcess: 'Start-up' })

        /* try {
            const buildHandler = new BuildHandler()
            buildHandler.run()
            setInterval(mainBuildHandler, 24 * 60 * 60 * 1000)
        } catch (err) {
            cLog(['Error in buildHandler : ', err], { subProcess: 'Interval' })
        } */
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


/**
 * Starts the bot by validating environment variables, initializing the bot client,
 * loading handlers, setting up event listeners, and logging in to Discord.
 * @returns {Promise<void>} A promise that resolves when the bot has started.
 */
async function start(): Promise<void> {
    validateEnvVariables()

    try {
        await dbInstance.testConnection()
    } catch (err) {
        console.error('Error initializing database : ', err)
    }

    const bot = initializeBotClient()
    bot.slashCommands = new Collection<string, SlashCommand>()

    await loadHandlers(bot)
    setupEventListeners(bot)
    try {
        await bot.login(process.env.BOT_TOKEN)
    } catch (err) {
        console.error('Error starting bot : ', err)
    }
    try {
        const expressServer = new ExpressServer()
        expressServer.start(bot)
    } catch (err) {
        console.error('Error starting express server : ', err)
    }
}

start().catch((err) => {
    console.error('Error in start function : ', err)
})
