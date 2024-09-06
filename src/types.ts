import { AutocompleteInteraction, Collection, Events, RESTEvents } from 'discord.js'
import { ChatInputCommandInteraction } from 'discord.js'

export interface SlashCommand {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    command: any,
    execute: (interaction : ChatInputCommandInteraction) => Promise<void>,
    autocomplete?: (interaction: AutocompleteInteraction) => void,
    helpText?: string | 'This command doesn\'t have a help description.' // TODO: On HelpCommand make sure on empty you get default value,
    validFor?: GuildIds[] | GuildIds,
    strict?: boolean
}
export enum EventType {
    ONCE = 'once',
    ON = 'on',
    REST_ON = 'rest_on'
}


export enum CustomEvents {
    ClaimReview = 'claimReview',
    CloseSubmission = 'closeSubmission',
    CompleteReview = 'completeReview',
    RateReview = 'rateReview',
    RejectReview = 'rejectReview',
    SubmitReview = 'submitReview',
    VerifyUser = 'verifyUser',
    InitVerifyUser = 'initVerifyUser',
    RemoveVerification = 'removeVerification'
}

export interface BotEvent {
    name: Events | RESTEvents | CustomEvents,
    type: EventType,
    execute: (...args) => void
}

declare module 'discord.js' {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>
    }
  }
  

export enum GuildIds {
    SKILLCAPPED_WOW = '294958471953252353',
    DEV = '1024961321768329246'
}

export interface ServerInfo {
    serverId: string;
    reviewCategoryId: string;
    submissionChannelId: string;
    transcriptChannelId: string;
    ratingChannelId: string;
    premiumRoleId: string;
    specialPass?: boolean;
    verifForm?: string;
    wowpve?: WoWSubCategory;
    wowpvp?: WoWSubCategory;
    serverName?: string;
}
export interface WoWSubCategory {
    reviewCategoryId: string;
    submissionChannelId: string;
    transcriptChannelId: string;
    ratingChannelId: string;
    premiumRoleId: string;
}

export interface ServerInfoCollection {
    Valorant: ServerInfo;
    WoW: ServerInfo;
    Dev: ServerInfo;
}


export interface SheetBodyData {
    status?: string;
    createdAt?: string;
    id?: string;
    userID?: string;
    userEmail?: string;
    clipLink?: string;
    armoryLink?: string;
    charClass?: string;
    twovtwo?: string;
    threevthree?: string;
    solo1?: string;
    solo2?: string;
    solo3?: string;
    solo4?: string;
    mythicPlusScore?: string;
    specialization?: string;
}

export enum AccessLevel {
    NO_ACCESS = 'NO_ACCESS',
    ACCESS = 'ACCESS'
}


export enum DiscordAPIErrorEnum {
    MISSING_ACCESS = 50001,
}

export enum MillieTimeEnum {
    ONE_MINUTE = 60000,
    ONE_HOUR = 3600000,
    ONE_DAY = 86400000,
    ONE_WEEK = 604800000
}
