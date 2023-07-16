
const { SlashCommandBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ModalBuilder,Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder } = require('discord.js');

const axios = require('axios');
const Sequelize = require('sequelize');
const SCverifiedAccountDB = require('../models/SCverifiedAccountDB');
const SCverifV2 = require('../models/SCVerifV2');
const bot = require('../src/botMain');
//const { main } = require('../components/functions/googleApi');
const ReviewHistory = require('../models/ReviewHistory');
const ValReviewHistory = require('../models/ValReviewHistory');
const { cLog } = require('../components/functions/cLog');
require("dotenv").config({path: '../.env'});


const cm = new ModalBuilder()
  .setCustomId('completesubmission')
  .setTitle('Close submission');
    const closeInput = new TextInputBuilder()
    .setCustomId('reviewlink')
    .setLabel("REVIEW LINK:")
    .setStyle(TextInputStyle.Short);
    const closeRow = new ActionRowBuilder().addComponents(closeInput);

cm.addComponents(closeRow);

const submissionModal = new ModalBuilder()
  .setCustomId('submissionmodal')
  .setTitle('Submission Modal');
    const ytInput = new TextInputBuilder()
    .setCustomId('ytlink')
    .setLabel("UNLISTED YOUTUBE LINK:")
    .setStyle(TextInputStyle.Short);
    const armoryInput = new TextInputBuilder()
      .setCustomId('armory')    
      .setLabel("ARMORY LINK:") 
      .setPlaceholder('https://worldofwarcraft.blizzard.com/en-gb/character/eu/ravencrest/mýstíc')
      .setStyle(TextInputStyle.Short);
    const emailInput = new TextInputBuilder()
      .setCustomId('email')
      .setLabel("SKILL-CAPPED EMAIL:")
      .setStyle(TextInputStyle.Short);
    const improvementInput = new TextInputBuilder()
      .setCustomId('improvementinput')
      .setLabel("What are you looking to focus on and improve?")
      .setStyle(TextInputStyle.Paragraph);
    
  const ytRow = new ActionRowBuilder().addComponents(ytInput);
  const submissionRow = new ActionRowBuilder().addComponents(armoryInput);
  const emailRow = new ActionRowBuilder().addComponents(emailInput);
  const improvementRow = new ActionRowBuilder().addComponents(improvementInput);

  submissionModal.addComponents(ytRow, submissionRow, emailRow, improvementRow);

const valSubmissionModal =new ModalBuilder()
.setCustomId('submissionmodal')
.setTitle('Submission Modal');
const trackerInput = new TextInputBuilder()
      .setCustomId('tracker')    
      .setLabel("TRACKER.GG LINK:") 
      .setPlaceholder('https://tracker.gg/valorant/profile/riot/ApenJulius1%23EUW/overview')
      .setStyle(TextInputStyle.Short);
      const trackerRow = new ActionRowBuilder().addComponents(trackerInput);
valSubmissionModal.addComponents(ytRow, trackerRow, emailRow, improvementRow)

  async function verifyEmailExists(email, pass) {
  console.log(email, pass)
  let verifStatus = "Nothing changed"
  console.log("Verifying Email")
  const response = await axios.post('https://www.skill-capped.com/lol/api/new/loginv2', { email:email, password: pass})
  console.log(response.data.data.fsData.user)
  if (response.data.success == false) { 
    return(false, "Wrong email or password")
  }

  switch(response.data.data.fsData.user.role) {
    case "SC_ROLE_PAID_USER":
      verifStatus = (true, "User has active account")
      break;
    case "SC_ROLE_FREE_USER":
      verifStatus =(false, "User has free account")
      break;
    case "SC_ROLE_STAFF":
      verifStatus =(true, "This user is staff")
      break;

    case "SC_ROLE_ADMIN":
      verifStatus =(true, "This user is admin")
      break;
    default:
      console.log("Honestly dont even know how we got here")
      break;
  }
  return verifStatus
}

async function addToSCDB(userID, email, tag, interaction) {
  try {

  
  const [account, created ] = await SCverifV2.findOrCreate({ where:{  userEmail: email },
    userID: userID,
    userEmail: email,
    userTag: tag}).catch(err=>{
      switch(err.errors[0].message) {
        case "userID must be unique":
          interaction.reply({content:"This account is already in use!", ephemeral:true})
          break;
        case "userEmail must be unique":
          interaction.reply({content:"This account is already in use!", ephemeral:true})
          break;
        default:
          interaction.reply({content:"You have not been verified due to technical reasons. Contact staff", ephemeral:true})
         break;
      }})



      console.log(created, account)
      if(created) {
        giveRoleToUser(interaction)
        interaction.reply({content:"Your account has been verified!", ephemeral:true})
      }
      else if (account.userID == interaction.user.id && email == account.userEmail) {
        giveRoleToUser(interaction)
        interaction.reply({content: "You have been verified to an existing account", ephemeral:true})
        return
      }
      else {
        interaction.reply({content: "This account is already in use!", ephemeral:true})
      }
    
    
  } catch (err) {
    console.log(err)
    await interaction.reply({content:"something failed, contact staff", ephemeral:true})
  }
  
}

async function giveRoleToUser(interaction) {
    if (interaction.guildId == "294958471953252353") { //WoW
        await interaction.member.roles.add(await interaction.guild.roles.cache.find(role => role.name == '🧨 Skill Capped Member'))
    }
    else {
        await interaction.member.roles.add(await interaction.guild.roles.cache.find(role => role.name == '💎・Infinity+'))
}
}


const regexTemplateFullLink = /(https):\/\/((worldofwarcraft\.blizzard\.com||worldofwarcraft\.com)\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/.+)/
const regexValFullLink = /(https):\/\/(tracker\.gg\/valorant\/profile\/riot)\/.+/
module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
      
      


      try {

      
      if (interaction.isCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (command) {
            try {
                await command.execute(interaction);
               return
                
            }
            catch (error) {
                console.error(error);
                await interaction.reply({ content: `${error}`, ephemeral: true });
                return
            }
        }
    }

    if(interaction.guildId == process.env.valServerId) {// VAL SERVER ID 
      if(interaction.customId == "submitreview") {
        if (!interaction.member.roles.cache.some(role => role.name === '💎・Infinity+'|| role.name === '🌸・Server Booster')) {
          await interaction.reply({content:"You need to be 💎・Infinity+ or 🌸・Server Booster", ephemeral:true})
          return
        }
        await interaction.showModal(valSubmissionModal);
      }

      if(interaction.customId == "submissionmodal") {
        await interaction.reply({content:"Processing...", ephemeral:true})
        
        const email = interaction.fields.getTextInputValue("email")
        const track = interaction.fields.getTextInputValue("tracker")
        if(regexValFullLink.test(track)) {
          bot.emit("submitValReview", interaction)
          
        }
        else {
          await interaction.editReply({content:"This link is not valid.\n\nThink this is a mistake? Let us know", ephemeral:true})
        }
      }
      if(interaction.customId == "claimsubmission") {
        bot.emit("claimValReview", interaction)
      }
      if(interaction.customId == "rejectsubmission") {
        bot.emit("rejectValReview", interaction)
      }
      if(interaction.customId.startsWith("closesubmission-")) {
        bot.emit("closeSubmission", interaction)
      }
      if(interaction.customId.startsWith("delete-")) {
        bot.emit("completeValReview", interaction)
      }
      if(interaction.customId.startsWith("completesubmission")) {
          
        let reviewlink = interaction.fields.getTextInputValue("reviewlink")
        cLog(["Review nr: ",interaction.customId.replace("completesubmission-", "")], {guild:interaction.guild, subProcess:"setReviewLink"})
        const h = await ValReviewHistory.findOne({
          where: {
            id:interaction.customId.replace("completesubmission-", "")
          }
        })
        await h.update({
          reviewLink:reviewlink
        })
        await interaction.reply({content:"Updated the review link to "+ reviewlink, ephemeral:true})
      }
      return
    }
    if(/^valrating\d-\d+/.test(interaction.customId) ) {
      bot.emit("rateValReview", interaction, "button")
      return
    }
    if(interaction.customId.startsWith("valreviewratingmodal")) {
      bot.emit("rateValReview", interaction, "modal")
      return
    }





    // WOW server stuff
        if(interaction.customId == "submissionmodal") {
        await interaction.reply({content:"Processing...", ephemeral:true})
        const email = interaction.fields.getTextInputValue("email")
        const arm = interaction.fields.getTextInputValue("armory")
        
        console.log(interaction.fields.fields.get("armory").value, email, regexTemplateFullLink.test(arm))
        if(regexTemplateFullLink.test(arm)) {
          bot.emit("submitReview", interaction)
          
        }
        else {
          await interaction.editReply({content:"This link is not valid.\n\nThink this is a mistake? Let us know", ephemeral:true})
        }
      }


      try {
        if(interaction.customId == "submitreview") {
          await interaction.showModal(submissionModal);
        }
        if(interaction.customId == "claimsubmission") {
          bot.emit("claimReview", interaction)
        }
        if(interaction.customId == "rejectsubmission") {
          bot.emit("rejectReview", interaction)
        }
         if(interaction.customId.startsWith("completesubmission")) {
          
          let reviewlink = interaction.fields.getTextInputValue("reviewlink")
          console.log(reviewlink, interaction.customId.replace("completesubmission-", ""))

          const h = await ReviewHistory.findOne({
            where: {
              id:interaction.customId.replace("completesubmission-", "")
            }
          })
          await h.update({
            reviewLink:reviewlink
          })
          const forSpread = [
            {
            "range": `T${interaction.customId.replace("completesubmission-", "")}`, //Review link
            "values": [
                [
                reviewlink
                ]
            ]
            }
        ]

          await main(forSpread)
          await interaction.reply({content:"Updated the review link", ephemeral:true})
        }
        if(/^rating\d-\d+/.test(interaction.customId)) {
          bot.emit("rateReview", interaction, "button")
        }
        if(interaction.customId.startsWith("delete-")) {
          bot.emit("completeReview", interaction)
        }
        if(interaction.customId.startsWith("closesubmission-")) {
          bot.emit("closeSubmission", interaction)
        }
        if(interaction.customId.startsWith("open-")) {
          bot.emit("openReview", interaction)
        }
        if(interaction.customId.startsWith("reviewratingmodal")) {
          bot.emit("rateReview", interaction, "modal")
        }
        if(interaction.customId.startsWith("clip-")) {
          bot.emit("mediaCollection", interaction)
        }
      

      } catch (err) {
        if(err.toString().startsWith("TypeError: Cannot read properties of undefined (reading 'startsWith')")) {
          console.log("Not review related")
        } else {
          await interaction.editReply({content:"Something went wrong, please contact staff", ephemeral:true})
          console.log(err) }
      }
    

        
    } catch (err) {
      console.log("Failed somewhere during interaction : ", err, interaction.user.tag)
      await interaction.editReply({content:"Something went wrong, please contact staff", ephemeral:true})
    }} }
    
    
