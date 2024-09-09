import {
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
} from 'discord.js'
import { cLog } from './functions/cLog'

async function completeSubmissionEmbed(interaction, submissionModal, mode = null) {
    const modal = new ModalBuilder()
        .setCustomId(`completesubmission-${submissionModal}${mode === null ? '' : '-' + mode}`)
        .setTitle('Close submission')
    const closeInput = new TextInputBuilder()
        .setCustomId('reviewlink')
        .setLabel('REVIEW LINK:')
        .setStyle(TextInputStyle.Short)
    const closeRow = new ActionRowBuilder<TextInputBuilder>().addComponents(closeInput)

    modal.addComponents(closeRow)
    await interaction.showModal(modal)
}

async function createSubmissionModal(interaction, game, mode = '') {
    if (game === null) {
        cLog(['This server was NULL!'], {
            guild: interaction.guildId,
            subProcess: 'CreateSubmissionModal',
        })
        return
    }
    // The modal
    const modal = new ModalBuilder()
        .setCustomId(`submission${mode === '' ? '' : '-' + mode}`)
        .setTitle('Submission Modal')

    // The common fields in modal
    const ytInput = new TextInputBuilder()
        .setCustomId('ytlink')
        .setLabel('UNLISTED YOUTUBE LINK:')
        .setStyle(TextInputStyle.Short)
    const emailInput = new TextInputBuilder()
        .setCustomId('email')
        .setLabel('SKILL-CAPPED EMAIL:')
        .setStyle(TextInputStyle.Short)
    const improvementInput = new TextInputBuilder()
        .setCustomId('improvementinput')
        .setLabel('What is your goal with this review')
        .setStyle(TextInputStyle.Paragraph)
    const consentInput = new TextInputBuilder()
        .setCustomId('consentinput')
        .setLabel('Can Skill-Capped use your review for content?')
        .setStyle(TextInputStyle.Short)
    // WoW fields
    const armoryInput = new TextInputBuilder()
        .setCustomId('armory')
        .setLabel('ARMORY LINK:')
        .setPlaceholder(
            'https://worldofwarcraft.blizzard.com/en-gb/character/eu/ravencrest/mýstíc'
        )
        .setStyle(TextInputStyle.Short)

    // The rows
    const ytRow = new ActionRowBuilder<TextInputBuilder>().addComponents(ytInput)
    const emailRow = new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput)
    const improvementRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        improvementInput
    )
    const consentRow = new ActionRowBuilder<TextInputBuilder>().addComponents(consentInput)
    // WoW rows
    const armoryRow = new ActionRowBuilder<TextInputBuilder>().addComponents(armoryInput)

    if (game.serverName === 'WoW') {
        modal.addComponents(
            ytRow,
            armoryRow,
            emailRow,
            improvementRow,
            consentRow
        )
    }  else {
        cLog(
            ['This server was NOT NULL but unknown!', interaction.guild.name],
            { guild: interaction.guildId, subProcess: 'CreateSubmissionModal' }
        )
        return null
    }
    await interaction.showModal(modal)
    return true
}
function createRatingModal(submissionNumber, game, mode) {
    const feedbackmodal = new ModalBuilder()
        .setCustomId(`${game}-modal-reviewrating-${submissionNumber}${mode === null ? '' : '-' + mode}`)
        .setTitle('Feedback Modal')

    const commentInput = new TextInputBuilder()
        .setCustomId('feedback')
        .setLabel('Tell us what you think?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)

    const ratingRow = new ActionRowBuilder<TextInputBuilder>().addComponents(commentInput)
    feedbackmodal.addComponents(ratingRow)
    return feedbackmodal
}

function createUserVerificationModal(serverPart = null) {
    const verifModal = new ModalBuilder()
        .setCustomId(`${serverPart ? 'verify-user-' + serverPart : 'verify-user'}`)
        .setTitle('Link your Skill Capped account to Discord!')
    
    const emailInput = new TextInputBuilder()
        .setCustomId('email')
        .setLabel('What is your email?')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)

    const verifyRow = new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput)
    verifModal.addComponents(verifyRow)
    return verifModal
}

export {
    completeSubmissionEmbed,
    createSubmissionModal,
    createRatingModal,
    createUserVerificationModal
}
