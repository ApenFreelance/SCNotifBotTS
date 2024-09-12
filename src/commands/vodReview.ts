import { SlashCommandBuilder } from 'discord.js'
import { submitReviewButton } from '../components/buttons'
import { GuildIds, SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('vodreview')
        .setDescription('Creates button to submit a vod review')
        .addStringOption((option) =>
            option
                .setName('mode')
                .setDescription('Choose between wowpvp or wowpve')
                .addChoices(
                    { name: 'WoWPVP', value: 'wowpvp' },
                    { name: 'WoWPVE', value: 'wowpve' }
                )
                .setRequired(true)
        ),

    async execute(interaction) {
        const mode = interaction.options.getString('mode')
        await interaction.reply({
            content: 'Click button to submit',
            components: [submitReviewButton(mode)]
        })
    },
    validFor: [GuildIds.SKILLCAPPED_WOW],
}
export default command
