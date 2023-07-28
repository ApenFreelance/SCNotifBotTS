
const { updateGoogleSheet } = require("../components/functions/googleApi");

const { completeSubmissionEmbed } = require("../components/modals.js");




module.exports = {
    name: 'completeReview',
    once: false,
    async execute(interaction) { 
      let channel = null
        let submissionNumber
        try {
          submissionNumber = interaction.channel.name.replace("closed-", "").replace("review-", "")
        } catch(err) {
          console.log(err)
          
        }
        try {
         channel = interaction.guild.channels.cache.find(channel => channel.name == `review-${submissionNumber}`);

        } catch(err) {
          console.log(err, "failed on review portion")
          try {
            channel = interaction.guild.channels.cache.find(channel => channel.name == `closed-${submissionNumber}`);
  
          } catch(err) {
            console.log(err, "failed. crit")
          }
        }

        const reviewInDB = await ReviewHistory.findOne({
            where:{
                id:submissionNumber
            },
            order: [['CreatedAt', 'DESC']]})

        if(reviewInDB.dataValues.reviewLink == null) {
          await completeSubmissionEmbed(interaction, reviewInDB.dataValues.id)
          return
        }


        await reviewInDB.update({
            status:"Completed",
            completedBy:interaction.user.id,
            completedAt: Date.now()
        })
        let submissionPos = reviewInDB.dataValues.id
        const forSpread = [
          {
            "range": `O${submissionPos}`, // Status
            "values": [
              [
                reviewInDB.dataValues.status
              ]
            ]
          },
          {
            "range": `S${submissionPos}`,
            "values": [
              [
                reviewInDB.dataValues.completedAt //completed at
              ]
            ]
          },
          {
            "range": `T${submissionPos}`,
            "values": [
              [
                reviewInDB.dataValues.reviewLink // Review Link
              ]
            ]
          }
        ]
        await main(forSpread)
        
        await interaction.reply({content:"Good job", ephemeral:true})
        await interaction.channel.delete()

    },
};
