import { updateGoogleSheet, createSheetBody } from '../components/functions/googleApi'
import dbInstance from '../db'
import { cLog } from '../components/functions/cLog'
import { BotEvent, CustomEvents, EventType } from '../types'

const event: BotEvent = {
    name: CustomEvents.RejectReview,
    type: EventType.ON,
    async execute(interaction, server, mode = null) {    
        const embedAuthor = interaction.message.embeds[0].author.name.match(/\d{18}/)
        const user = await interaction.guild.members.fetch(embedAuthor[0])
        const submissionNumber = interaction.message.embeds[0].title.replace('Submission ', '')
        await user.send('Unfortunatly your submission has been rejected.').catch(err => {
            if (err.rawError.message === 'Cannot send messages to this user') 
                interaction.channel.send(`${interaction.message.embeds[0].author.name} most likely has their DM's off and could not be reached.`)
            
            else 
                interaction.channel.send(`Unknown error when rejecting ${interaction.message.embeds[0].author.name}`)
            
        })
        const reviewInDB = await dbInstance.getTable(interaction.guildId, 'reviewHistory', mode).then((table) => {
            return table.findOne({
                where:{
                    id:submissionNumber
                } })
        })
        await reviewInDB.update({
            status:'Rejected',
            completedByID:interaction.user.id,
            completedByTag:interaction.user.username,
            completedAt: Date.now()
        })
        if (server.serverName === 'WoW') 
            await updateGoogleSheet(createSheetBody(mode, submissionNumber, { status:reviewInDB.status, completedAt:reviewInDB.completedAt }))
        
        await interaction.message.delete()
        cLog(['Successfully deleted submission'], { guild:interaction.guildId, subProcess:'Reject Submission' })
    },
}
export default event
