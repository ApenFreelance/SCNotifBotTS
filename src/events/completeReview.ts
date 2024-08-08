
const { cLog } = require("../components/functions/cLog");
const { updateGoogleSheet, createSheetBody } = require("../components/functions/googleApi");
const { createTranscript, createHTMLfile, sendTranscript, addTranscriptToDB } = require("../components/functions/transcript");
const fs = require("fs")
const { completeSubmissionEmbed } = require("../components/modals.js");
const { getCorrectTable } = require("../src/db");




module.exports = {
    name: 'completeReview',
    once: false,
    async execute(interaction, server, mode= null) { 
      let channel = null
      let submissionNumber
      try {
        submissionNumber = interaction.channel.name.split("-")[1]
      } catch(err) {
        cLog([err, "END OF ERR"], {guild:interaction.guildId, subProcess:`CompleteReview-${submissionNumber}`})
      }
      channel = interaction.guild.channels.cache.find(channel => channel.name == `review-${submissionNumber}` && channel.parentId == server[mode].reviewCategoryId);
      if(typeof channel === "undefined") {
          channel = interaction.guild.channels.cache.find(channel => channel.name == `closed-${submissionNumber}` && channel.parentId == server[mode].reviewCategoryId);
      }
        const reviewHistory = await getCorrectTable(interaction.guild.id, "reviewHistory", mode).then((table) => {
          return table.findOne({
            where:{
                id:submissionNumber
            },
            order: [['CreatedAt', 'DESC']]})
          })
        if(reviewHistory.reviewLink == null) {
          await completeSubmissionEmbed(interaction, reviewHistory.id, mode)
          return
        }
        await reviewHistory.update({
            status:"Completed",
            completedByID:interaction.user.id,
            completedByTag:interaction.user.username,
            completedAt: Date.now()
        })
        if(server.serverName == "WoW") {
          await updateGoogleSheet(createSheetBody(mode, submissionNumber, {status:reviewHistory.status, completedAt:reviewHistory.completedAt, reviewLink:reviewHistory.reviewLink}))
        }
        try {
          await createTranscript(channel, reviewHistory)
          .then(transcript => {
            addTranscriptToDB(reviewHistory, transcript)
            createHTMLfile(reviewHistory, transcript)
            .then(filePath => {
              sendTranscript(filePath, server[mode].transcriptChannelId, interaction.client).then(filePath=> {
                fs.unlink(filePath, (err => {
                  if (err) console.log(err);
                  else{
                    cLog(["Succesfully deleted: "+ filePath], {guild:interaction.guild, subProcess:"Transcript"})
                  }
                }))
            })
            }
            )
          })
        }catch(err) {
            await interaction.reply({content:"Failed to create transcript: `"+ err+"`", ephemeral:true})
            cLog(["Failed at creating transcript for review: "+submissionNumber, err], {guild:interaction.guild, subProcess:"Transcript", oneLine:false})
            return
          }
        await interaction.reply({content:"Good job", ephemeral:true})
        await interaction.channel.delete()
        cLog(["Deleted channel for review: "+submissionNumber], {guild:interaction.guild, subProcess:"CompleteReview"})
    },
};
