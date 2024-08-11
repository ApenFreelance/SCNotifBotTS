import { SlashCommandBuilder } from 'discord.js'
import { verificationButton } from '../components/buttons'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('verify-button')
        .setDescription('Generates a verification button'),
    
    async execute(interaction) {
        try {
            await interaction.reply({ 
                content: 'Click button to verify!', 
                components: [verificationButton('verify')] 
            })
        } catch (error) {
            console.error('Error executing verify-button command:', error)
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
    },
}

export default command
