import { Client } from 'discord.js'
import { readdirSync } from 'fs'
import { join } from 'path'
import { BotEvent, EventType } from '../types'

export default async (client: Client) => {
    const eventsDir = join(__dirname, '../events')
    const eventFiles = readdirSync(eventsDir).filter(file => file.endsWith('.js'))
    for (const file of eventFiles) {
        const { default: event }: { default: BotEvent } = await import(`${eventsDir}/${file}`)
        
        if (event.type === EventType.ONCE) 
            client.once(event.name, (...args) => event.execute(...args))
        else if (event.type === EventType.ON) 
            client.on(event.name, (...args) => event.execute(...args))
        else if (event.type === EventType.REST_ON) {
            // TODO: Make this work with rate limit
            // eslint-disable-next-line
            // @ts-ignore
            client.rest.on(event.name, consola.log)
        } else 
            console.error(`${event.name} doesn't have a correct type from the enum 'EventType', but has ${event.type}`)
        
        console.log(`Successfully registered event: ${event.name}`)
    }
}
