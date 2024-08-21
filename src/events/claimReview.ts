import { ButtonBuilder, PermissionsBitField, ActionRowBuilder, ButtonStyle, TextChannel, OverwriteResolvable } from 'discord.js'
import { updateGoogleSheet, createSheetBody } from '../components/functions/googleApi'
import dbInstance from '../db'
import { cLog } from '../components/functions/cLog'
import { BotEvent, EventType, ServerInfo } from '../types'
import { CustomEvents } from '../types'


interface ReviewHistory {
    id: string;
    status: string;
    claimedByID: string;
    claimedByTag: string;
    claimedAt: number;
    userID: string;
    dataValues: {
        id: string;
    };
    update: (data: Partial<ReviewHistory>) => Promise<void>;
}

const event: BotEvent = {
    name: CustomEvents.ClaimReview,
    type: EventType.ON,
    async execute(interaction, server:ServerInfo, mode: string | null = null) {
        try {
            const submissionNumber = interaction.message?.embeds[0]?.title?.replace('Submission ', '')
            if (!submissionNumber) throw new Error('Submission number not found')
            const reviewHistory = await getReviewHistory(interaction.guildId, submissionNumber, mode)
            if (!reviewHistory) throw new Error('Review history not found')
        
            await reviewHistory.update({
                status: 'Claimed',
                claimedByID: interaction.user.id,
                claimedByTag: interaction.user.username,
                claimedAt: Date.now()
            })
            const lockRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Close')
                        .setEmoji('🔒')
                        .setStyle(ButtonStyle.Success)
                        .setCustomId(`closesubmission-${submissionNumber}${mode ? '-' + mode : ''}`)
                )

            const submissionPos = reviewHistory.dataValues.id
            if (server.serverName === 'WoW') { // update google sheet
                await updateGoogleSheet(createSheetBody(mode, submissionPos, { 
                    status:reviewHistory.status, 
                    claimedDate:reviewHistory.claimedAt, 
                    claimedByID:reviewHistory.claimedByID, 
                    claimedByUsername:reviewHistory.claimedByTag 
                }))
            }

            const parentCategory = server[mode]?.reviewCategoryId
            const newChannel = await createChannel(interaction, parentCategory, `review-${submissionNumber}`, [
                {
                    id: interaction.guild.id, // everyone in server (not admin)
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: reviewHistory.userID, // Ticket owner
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.client.user.id, // Bot
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
                },
                {
                    id: interaction.user.id, // One that claimed
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels],
                },
            ])
            await interaction.reply({ content:'Submission Claimed', ephemeral:true }).catch(err => {
                cLog(['FAILED REPLYING AFTER CHANNEL CREATION\n' + err.name + ' ' + err.message], { subProcess:'ClaimReview', guild:interaction.guild })
            })
            cLog([`Submission ${submissionNumber} claimed`], { subProcess:'ClaimReview', guild:interaction.guild })
        
        
            const presetMessage = getPresetMessage(server.serverName, interaction.user.id, reviewHistory.userID)
        
            await newChannel.send({ content:presetMessage, embeds:[interaction.message.embeds[0]], components:[lockRow] })
            await interaction.message.delete()
        } catch (err) {
            cLog([err.name + ' ' + err.message], { subProcess: 'ClaimReview', guild: interaction.guild })
            await interaction.reply({ content: 'An error occurred while claiming the submission.', ephemeral: true })
        }
    },
}
export default event
async function getReviewHistory(guildId: string, submissionNumber: string, mode: string | null): Promise<ReviewHistory | null> {
    try {
        const table = await dbInstance.getTable(guildId, 'reviewHistory', mode)
        return await table.findOne({ where: { id: submissionNumber } })
    } catch (err) {
        console.log(err)
        return null
    }
}

async function createChannel(interaction, parentCategory: string, name: string, permissionOverwrites: OverwriteResolvable[]): Promise<TextChannel> {
    try {
        return await interaction.guild.channels.create({
            parent: parentCategory,
            name,
            permissionOverwrites,
        })
    } catch (err) {
        cLog([err.name + ' ' + err.message], { subProcess: 'CreateChannel', guild: interaction.guild })
        throw err
    }
}
function getPresetMessage(serverName: string, userId: string, reviewUserId: string): string {
    switch (serverName) {
        case 'WoW':
            return `<@${userId}>\u00A0<@${reviewUserId}> Welcome to your VoD review channel.\nYour <@&970784560914788352> will respond with your uploaded review ASAP.\n\nTo close this ticket, react with 🔒`
        case 'Valorant':
            return `<@${userId}>\u00A0<@${reviewUserId}> Welcome to your VoD review channel.\nYour <@&932795289943826483> will respond with your uploaded review ASAP.\n\nTo close this ticket, react with 🔒`
        default:
            return 'UNKNOWN SERVER'
    }
}
