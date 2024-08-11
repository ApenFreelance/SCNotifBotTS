import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js'
import { createReviewButtons } from '../components/buttons'
import { cLog } from '../components/functions/cLog'
import dbInstance from '../db'
import { BotEvent, EventType } from '../types'

const event: BotEvent = {
    name: 'closeSubmission',
    type: EventType.ON,
    async execute(interaction, server, mode) {
        const submissionNr = interaction.customId.split('-')[1]
        const lastRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`delete-${submissionNr}${mode === null ? '' : '-' + mode}`)
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
        )
        let reviewInDB = await dbInstance.getTable(
            interaction.guildId,
            'reviewHistory',
            mode
        )
        reviewInDB = await reviewInDB.findOne({
            where: {
                id: submissionNr,
            },
            order: [['CreatedAt', 'DESC']],
        })

        await interaction.channel.permissionOverwrites.delete(reviewInDB.userID)
            .catch((e) => {
                cLog([`ERROR(${submissionNr}): `, e], {
                    guild: interaction.guild.id,
                    subProcess: 'Remove User',
                })
            })
        await interaction.reply({
            content: 'Review closed!',
            components: [lastRow],
        })
        await interaction.channel.edit({ name: `closed-${submissionNr}` })
        cLog(['Channel updated'], {
            guild: interaction.guild.id,
            subProcess: 'Close Submission',
        })
        const user = await interaction.guild.members.fetch(
            reviewInDB.userID
        )
        // TODO: Add actual error handling

        await user.send({ content:'Your review has been completed.\n\n\nHow would you rate this review?', components: createReviewButtons(submissionNr, server.serverName.toLowerCase(), mode) })
            .catch((err) => {
                if (err.rawError.message === 'Cannot send messages to this user') {
                    interaction.channel.send(
                        `${interaction.message.embeds[0].author.name} ( review-${submissionNr} ) most likely has their DM's off and could not be reached. Therefor channel has not been deleted.`
                    )
                    cLog(
                        [
                            `${interaction.message.embeds[0].author.name} ( review-${submissionNr} ) most likely has their DM's off and could not be reached`,
                        ],
                        { guild: interaction.guild.id, subProcess: 'Send Rating Request' }
                    )
                    return
                } else {
                    interaction.channel.send(
                        `Unknown error when rejecting ${interaction.message.embeds[0].author.name} ( review-${submissionNr} ), therefor channel has not been deleted.`
                    )
                    cLog([`Unknown error when rejecting ${interaction.message.embeds[0].author.name} ( review-${submissionNr} )`],
                        { guild: interaction.guild.id, subProcess: 'Send Rating Request' })
                    return
                }
            })
        await reviewInDB.update({
            status: 'Closed',
            closedByTag: interaction.user.username,
        })
        cLog(['Closing: ', submissionNr], { guild: interaction.guildId, subProcess: 'Updated DB' })
        cLog(['Success'], {
            guild: interaction.guild.id,
            subProcess: 'Send Rating Request',
        })
    },
}

export default event
