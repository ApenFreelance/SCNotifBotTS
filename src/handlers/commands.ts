import { Client, SlashCommandBuilder, REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { DiscordAPIErrorEnum, GuildIds, SlashCommand } from '../types'
import { cLog } from '../components/functions/cLog'

export default async (client : Client) => {
    
    const loadedCommands = await loadCommands(client)
    for (const [guild, slashCommands] of loadedCommands.entries()) {
        console.log(`Registering commands for ${guild}`)
        try {
            await registerSlashCommands(slashCommands, guild as GuildIds | 'Global')
            console.log(`Successfully registered commands for ${guild}`)
        } catch (e) {
            console.log('Error registering commands')
            if (e.code === DiscordAPIErrorEnum.MISSING_ACCESS) 
                console.error('Missing access to register commands. Set the correct CLIENT_ID in the .env file')
            else 
                console.error(`Failed to register commands for ${guild}\n${e}`)
            
        }
    }
}


const loadCommands = async (client: Client): Promise<Map<string, SlashCommandBuilder[]>> => {
    const slashCommands = new Map<string, SlashCommandBuilder[]>()
    const slashCommandsDir = join(__dirname, '../commands')
    const slashCommandFiles = readdirSync(slashCommandsDir).filter(file => file.endsWith('.js') || file.endsWith('.ts'))
    console.log('Loading commands into bot')
    for (const file of slashCommandFiles) {
        if (!(file.endsWith('.js') || file.endsWith('.ts'))) return
         
        const { default: command }: { default: SlashCommand } = await import(`${slashCommandsDir}/${file}`)
        const key: 'Global' | GuildIds | GuildIds[] = command.validFor === undefined ? 'Global' : command.validFor

        if (typeof key === 'string') {
            if (!slashCommands.has(key)) slashCommands.set(key, [])
            slashCommands.get(key).push(command.command)
        } else {
            for (const guild of key) {
                if (!slashCommands.has(guild)) slashCommands.set(guild, [])
                slashCommands.get(guild).push(command.command)
            }
        }
        client.slashCommands.set(command.command.name, command)
        cLog([`Successfully loaded command: ${command.command.name}`])
    }
    return slashCommands
}

const registerSlashCommands = async (slashCommands: SlashCommandBuilder[], guild: GuildIds | 'Global') => {
    const registrationType = guild === 'Global' ? Routes.applicationCommands : Routes.applicationGuildCommands
    // Dont forget global can take a while to update. Could hours
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN)

    await rest.put(registrationType(process.env.CLIENT_ID, guild), {
        body: slashCommands.map(command => command.toJSON())
    })
}
