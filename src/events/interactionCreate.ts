
import { cLog } from '../components/functions/cLog'
import { createSubmissionModal, createUserVerificationModal } from '../components/modals'
//import dbInstance from '../db'
import { selectServer } from '../components/functions/selectServer'
import { BotEvent, CustomEvents, EventType, ServerInfo } from '../types'
//import { createSheetBody, updateGoogleSheet } from '../components/functions/googleApi'
import { ButtonInteraction, Client, Events, Interaction } from 'discord.js'

const regexWoWLink = /(https):\/\/((worldofwarcraft\.blizzard\.com||worldofwarcraft\.com)\/[\w_-]+\/character\/(us|eu|kr|tw|cn|)\/[\w_-]+\/.+)/
const regexValLink = /(https):\/\/(tracker\.gg\/valorant\/profile\/riot)\/.+/
const event: BotEvent = {
    name: Events.InteractionCreate,
    type: EventType.ON,
    async execute(interaction: Interaction) {
        try {
            if (interaction.isCommand()) {
                await slashCommandHandler(interaction)
                return
            }
            // End of slash command handler
            //await interaction.reply({content:"Processing...", ephemeral:true}) // This is to show something is happening and to prevent timeout. EDIT IT ALONG THE WAY
            // Line above causes issues with modals
            const server = selectServer(interaction.guildId) //
            
            
            if (interaction.isButton()) 
                await handleButtonInteraction(interaction, server)
            else if (interaction.isModalSubmit()) 
                await handleModalSubmitInteraction(interaction, server)
            
            
            

            



            





            /*             if (interaction.customId.split('-')[0] === 'completesubmission') {
                // Triggers BEFORE deleting channel if missing reviewLink
                const reviewlink = interaction.fields.getTextInputValue('reviewlink')
                cLog(['Review nr: ', interaction.customId.split('-')[1],], { guild: interaction.guild, subProcess: 'reviewLinkEmpty' })

                const reviewHistory = await dbInstance.getTable(
                    server.serverId,
                    'reviewHistory',
                    interaction.customId.split('-')[2] || null
                ).then((table) => {
                    return table.findOne({
                        // Gets the correct table for server
                        where: {
                            id: interaction.customId.split('-')[1]
                        },
                    })
                })
                await reviewHistory.update({
                    reviewLink: reviewlink,
                })
                // WoW logs to sheet as well
                if (server.serverName === 'WoW') {
                    await updateGoogleSheet(
                        createSheetBody(
                            interaction.customId.split('-')[2],
                            interaction.customId.split('-')[1], { reviewLink: reviewlink })
                    )
                }
                await interaction.reply({
                    content: 'Updated the review link to ' + reviewlink,
                    ephemeral: true,
                })
            } */

        } catch (err) {
            console.log(
                'Failed somewhere during interaction : ',
                err,
                interaction.user.username
            )
            /*  await interaction.reply({
                content: 'Something went wrong, please contact staff',
                ephemeral: true,
            }) */
        }
    },
}
export default event

async function slashCommandHandler(interaction) {
    const command = (interaction.client as Client).slashCommands.get(interaction.commandName)
    if (command) {
        try {
            await command.execute(interaction)
            return
        } catch (error) {
            console.error(error)
            await interaction.reply({ content: `${error}`, ephemeral: true })
            return
        }
    }
}


enum ButtonAction {
    VERIFY = 'verify',
    DELETE = 'delete',
    DELETE_MESSAGE = 'deletemessage',
    SUBMIT_REVIEW = 'submitreview',
    CLAIM = 'claim',
    REJECT = 'reject',
    CLOSE_SUBMISSION = 'closesubmission',
    COMPLETE_SUBMISSION = 'completesubmission',
    RATE_REVIEW = 'ratereview'
}


async function handleButtonInteraction(interaction: ButtonInteraction, server: ServerInfo) {
    const action = interaction.customId.split('-')[0] as ButtonAction
    const bot: Client = interaction.client
    switch (action) {
        case ButtonAction.VERIFY:
            cLog(['User clicked verify-user : ', interaction.user.username], { guild: interaction.guild, subProcess: 'buttonClick' })
            bot.emit(CustomEvents.InitVerifyUser, interaction, server)
            break
        case ButtonAction.DELETE:
            cLog(['User clicked delete : ', interaction.user.username], { guild: interaction.guild, subProcess: 'buttonClick' })
            await interaction.showModal(createUserVerificationModal())
            break
        case ButtonAction.DELETE_MESSAGE:
            await interaction.message.delete()
            cLog(['Deleted refund message'], { guild: server.serverId, subProcess: 'Refund Message' })
            break
        case ButtonAction.SUBMIT_REVIEW:
            if (await blockIfLacksRole(interaction, server.serverName)) 
                return
                
            await createSubmissionModal( interaction, server, interaction.customId.split('-')[1] )
            break
        case ButtonAction.CLAIM:
            // Begin claim handling
            cLog(['Claiming review nr: ', interaction.customId.split('-')[1],], { guild: interaction.guild, subProcess: 'buttonClick' })
            bot.emit('claimReview', interaction, server, interaction.customId.split('-')[1])
            break

        case ButtonAction.REJECT:
            // Begin rejection handling
            bot.emit('rejectReview', interaction, server, interaction.customId.split('-')[1])
            break
        case ButtonAction.CLOSE_SUBMISSION:
            // Close. NOT FINAL STEP. THIS IS WHEN REVIEW STATUS IS SET TO CLOSED. COMPLETE IS LAST
            bot.emit('closeSubmission', interaction, server, interaction.customId.split('-')[2] || null)
            break

        case ButtonAction.COMPLETE_SUBMISSION:
            // THIS IS WHAT DELETES CHANNEL AND SO ON
            bot.emit('completeReview', interaction, server, interaction.customId.split('-')[2] || null)
            break

        case ButtonAction.RATE_REVIEW:
            bot.emit('rateReview', interaction)
            break
        default:
    }
}

enum ModalActions {
    VERIFY_USER = 'verify',
    SUBMISSION = 'submission',
    RATE_REVIEW = 'ratereview'
}

async function handleModalSubmitInteraction(interaction, server) {
    const bot: Client = interaction.client
    const action = interaction.customId.split('-')[0] as ModalActions

    switch (action) {
        case ModalActions.VERIFY_USER:
            cLog(['User clicked verify-user : ', interaction.user.username], { guild: interaction.guild, subProcess: 'ModalSub' })
            bot.emit('verifyUser', interaction, server)
            break
        case ModalActions.SUBMISSION:
            // Handles response from the submitted submission through modal
            if (validLink(interaction, server.serverName)) {
                // Begin submission creation handling
                bot.emit('submitReview', interaction, server, interaction.customId.split('-')[1])
            } else 
                await interaction.reply({ content:'This link is not valid.\n\nThink this is a mistake? Let us know', ephemeral: true })
            break
        case ModalActions.RATE_REVIEW:
            bot.emit('rateReview', interaction)
            break
        default:
    }
}

async function blockIfLacksRole(interaction, game) {
    if (game === 'WoW') {
        if (
            !interaction.member.roles.cache.some(
                (role) =>
                    role.name === '🧨 Infinity Member' ||
                    role.name === '💙Premium Member' ||
                    role.name === '🧨Mythic Member'
            )
        ) {
            await interaction.reply({
                content:
                    'You need to be 🧨 Infinity Member or 💙Premium Member',
                ephemeral: true,
            })
            return true
        }
    }
    if (game === 'Valorant') {
        if (
            !interaction.member.roles.cache.some(
                (role) =>
                    role.name === '💎・Infinity+' ||
                    role.name === '🌸・Server Booster'
            )
        ) {
            await interaction.reply({
                content: 'You need to be 💎・Infinity+ or 🌸・Server Booster',
                ephemeral: true,
            })
            return true
        }
        if (game === 'Dev') 
            return false
        
    }
}

function validLink(interaction, game) {
    if (game === 'WoW') {
        return regexWoWLink.test(
            interaction.fields.getTextInputValue('armory')
        )
    } else if (game === 'Valorant') {
        return regexValLink.test(
            interaction.fields.getTextInputValue('tracker')
        )
    } else {
        cLog(['Unknown server for regexCheck'], {
            guild: interaction.guildId,
            subProcess: 'RegexCheck',
        })
        return true
    }
}



