import { Client, SlashCommandBuilder, REST, Routes } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { GuildIds, SlashCommand } from '../types'

export default async (client : Client) => {
    
    const loadedCommands = await loadCommands(client)
    loadedCommands.forEach((slashCommands, guild: GuildIds | 'Global') => {
        
        //consola.info(`Registering commands for ${guild}`)
        try {
            registerSlashCommands(slashCommands, guild)
        } catch (e) {
            
            //consola.error(`Failed to register commands for ${guild}`)
            return
        }
        //consola.success(`Registered commands for ${guild}\n`)
    })
}


const loadCommands = async (client: Client): Promise<Map<string, SlashCommandBuilder[]>> => {
    const slashCommands = new Map<string, SlashCommandBuilder[]>()
    const slashCommandsDir = join(__dirname, '../commands')
    const slashCommandFiles = readdirSync(slashCommandsDir).filter(file => file.endsWith('.js'))
    //consola.info('Loading commands into bot')
    for (const file of slashCommandFiles) {
        if (!file.endsWith('.js')) return
         
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
        //consola.success(`Successfully loaded command: ${command.command.name}`)
    }
    return slashCommands
}

const registerSlashCommands = async (slashCommands: SlashCommandBuilder[], guild: GuildIds | 'Global') => {
    const registrationType = guild === 'Global' ? Routes.applicationCommands : Routes.applicationGuildCommands
    // Dont forget global can take a while to update. Could hours
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN)
    rest.put(registrationType(process.env.APPLICATION_ID, guild), {
        body: slashCommands.map(command => command.toJSON())
    })
}
