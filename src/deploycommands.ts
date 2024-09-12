//require("dotenv").config({path: '../.env'})
require('dotenv').config()
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'
import fs from 'fs'

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

// Place your client and guild ids here
const clientId = process.env.clientId
const guildId = process.env.guildID
const  token = process.env.BOT_TOKEN
for (const file of commandFiles) {
    const command = require(`../commands/${file}`)
    commands.push(command.data.toJSON())
}

const rest = new REST({ version: '10' }).setToken(token)
async function deployCommands() {
    try {
        console.log('Started refreshing application (/) commands.')

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        )

        console.log('Successfully reloaded application (/) commands.')
    } catch (error) {
        console.error(error)
    }
};

export default { deployCommands }
