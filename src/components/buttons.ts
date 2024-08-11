import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import { GuildIds } from '../types'

function createReviewButtons(submissionNumber: string, game:string, mode:string | null = null) {
    const reviewRow = new ActionRowBuilder()
    const buttonAmount = 5
    for (let i = 1; i <= buttonAmount; i++) {
        const button = new ButtonBuilder()
            .setCustomId(`${game}-reviewrating-${i}-${submissionNumber}${mode === null ? '' : '-' + mode}`)
            .setLabel(i.toString())
            .setStyle(ButtonStyle.Success)
        reviewRow.addComponents(button)
    }
    return [reviewRow]
}

export function submitReviewButton(mode: string): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`submitreview-${mode}`)
            .setLabel('Submit review')
            .setStyle(ButtonStyle.Success)
    )
}
function waitingForReviewRow(mode:string) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`claimsubmission-${mode}`)
            .setLabel('Claim')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`rejectsubmission-${mode}`)
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger)
    )
}

export function verificationButton(guildId: string) { // TODO: Fix these guildIds
    if (guildId === GuildIds.SKILLCAPPED_WOW || guildId === GuildIds.DEV) { // If WoW server return these
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('verify-user-wowpvp')
                .setLabel('Verify for PVP')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('verify-user-wowpve')
                .setLabel('Verify for PVE')
                .setStyle(ButtonStyle.Success),
        )
    }
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('verify-user')
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success)
    )
}


export {
    createReviewButtons,
    waitingForReviewRow,
}
