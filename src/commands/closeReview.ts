import { SlashCommandBuilder } from 'discord.js'

export default {
    data: new SlashCommandBuilder()
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
