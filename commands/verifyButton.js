const { SlashCommandBuilder } = require("discord.js");
const { verificationButton } = require("../components/buttons");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify-button")
    .setDescription("Generates a verification button"),
    
  async execute(interaction) {
        await interaction.reply({content:"Click button to verify!", components:[verificationButton()]})    
    },
};
