import { SlashCommandBuilder } from 'discord.js';
import { verificationButton } from '../components/buttons';

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify-button")
    .setDescription("Generates a verification button"),
    
  async execute(interaction) {
        await interaction.reply({content:"Click button to verify!", components:[verificationButton(interaction.guildId)]})    
    },
};
