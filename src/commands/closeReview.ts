import { SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('close')
        .setDescription('close the review'),

    async execute(interaction) {
        if (!interaction.channel.name.startsWith('review-')) {
            await interaction.reply({
                content: 'This command is only allowed in tickets',
                ephemeral: true,
            })
            return
        }

        interaction.client.emit('completeReview', interaction)
    },
}
export default command
