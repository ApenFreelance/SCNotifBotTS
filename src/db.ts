import { Sequelize, Model as SequelizeModel } from 'sequelize'
import WoWReviewHistory from './models/WoWReviewHistory'
import VerificationLogs from './models/VerificationLogs'
import WoWCharacters from './models/WoWCharacters'
import VerifiedUsers from './models/VerifiedUsers'
import config from '../config/bot.config.json'
import GlobalCounters from './models/GlobalCounters'
import dotenv from 'dotenv'
import ReviewTimerOverwrite from './models/ReviewTimerOverwrite'

dotenv.config()

const { serverInfo } = config


/**
 * Interface representing a model.
 */
interface Model {
    /**
     * Initialize the model with the given Sequelize instance and table name.
     * @param sequelize - The Sequelize instance.
     * @param tableName - The name of the table.
     */
    initModel(sequelize: Sequelize, tableName: string): void

    /**
     * Synchronize the model with the database.
     * @returns A promise that resolves when the synchronization is complete.
     */
    sync(): Promise<SequelizeModel>
}

/**
 * Interface representing a mapping of model names to models.
 */
interface ModelMapping {
    [key: string]: Model
}

/**
 * Interface representing the table mapping structure.
 */
interface TableMapping {
    reviewHistory: {
        [key: string]: {
            wowpve?: Model
            wowpvp?: Model
            Valorant?: Model
            WoW?: Model
        }
    }
    WoWCharacter: {
        [key: string]: Model
    }
    VerificationLogs: Model
    VerifiedUsers: Model
}

/**
 * Class representing the database. Contains methods for initializing models and getting models.
 */
class Database {
    private static instance: Database
    private sequelize: Sequelize
    private modelMapping: ModelMapping = {}
    private tableMapping: TableMapping

    /**
     * Create a new Database instance.
     */
    private constructor() {
        this.sequelize = new Sequelize(
            process.env.dbName!,
            process.env.dbName!,
            process.env.dbPass!,
            {
                host: process.env.dbHost!,
                dialect: 'mariadb',
                logging: false,
            }
        )
        this.authenticateAndInitialize()
    }

    /**
     * Get the instance of the Database class. If an instance does not exist, create one.
     * @returns The instance of the Database class
     */
    public static getInstance(): Database {
        if (!Database.instance) 
            Database.instance = new Database()
        
        return Database.instance
    }
    /**
     * Authenticate the database connection and initialize models and table mapping.
     */
    private async authenticateAndInitialize(): Promise<void> {
        try {
            await this.testConnection()
            this.initializeModels()
            this.initializeTableMapping()
        } catch (error) {
            console.error('Unable to connect to the database:', error)
        }
    }

    /**
     * Initialize the models and store them in the model mapping.
     */
    private async initializeModels(): Promise<void> {
        const models = [
            { model: GlobalCounters, tableName: 'GlobalCountersTEST' },
            { model: VerificationLogs, tableName: 'VerificationLogsTEST' },
            { model: WoWReviewHistory, tableName: 'WoWReviewHistoryTEST' },
            { model: WoWCharacters, tableName: 'WoWCharactersTEST' },
            { model: VerifiedUsers, tableName: 'VerifiedUsersTEST' },
            { model: ReviewTimerOverwrite, tableName: 'ReviewTimerOverwriteTEST' }
        ]
        
        for (const { model, tableName } of models) {
            try {
                model.initModel(this.sequelize, tableName)
                await model.sync({ alter: true })
                this.modelMapping[tableName] = model
                console.log(`Successfully initialized model: ${tableName}`)
            } catch (err) {
                if (err.message === 'Cannot delete property \'meta\' of [object Array]') {
                    console.error(
                        '\n\nYou likely got this error because you set `model.sync({ alter: true })`. I would look more into it, but you shouldn\'t be altering these tables all willy-nilly anyway right?\n',
                        err,
                        '\n\n'
                    )
                } else 
                    console.error(`Error initializing model: ${tableName}`, err)
                
            }
        }
    }

    /**
     * Initialize the table mapping.
     * @deprecated This method is deprecated and will be removed in a future release beacuse it is not useful for just 1 servers review system 
     */
    private initializeTableMapping(): void {
        this.tableMapping = {
            reviewHistory: {
                [serverInfo.Valorant.serverId]: {
                    Valorant: this.modelMapping['ValReviewHistory']
                },
                [serverInfo.WoW.serverId]: {
                    wowpve: this.modelMapping['WoWReviewHistory_PVE'],
                    wowpvp: this.modelMapping['WoWReviewHistory_PVP'],
                },
                [serverInfo.Dev.serverId]: {
                    WoW: this.modelMapping['WoWReviewHistory_PVP'],
                },
            },
            WoWCharacter: {
                [serverInfo.WoW.serverId]: this.modelMapping['WoWCharacters'],
            },
            VerificationLogs: this.modelMapping['VerificationLogs'],
            VerifiedUsers: this.modelMapping['VerifiedUsers'],
        }
    }

    /**
     * Get the model for the given server ID and model name.
     * @param serverId - The server ID.
     * @param modelName - The name of the model.
     * @param mode - The mode of the model.
     * @returns The model corresponding to the server ID and model name.
     * @throws Will throw an error if the model or server ID is not found.
     */
    public getTable(serverId: string, modelName: keyof TableMapping, mode?: string) {
        const modelMapping = this.tableMapping[modelName]
        if (!modelMapping) 
            throw new Error(`Model ${modelName} not found in table mapping`)
        
        const tableName = modelMapping[serverId]
        if (!tableName) 
            throw new Error(`Model ${modelName} not found for serverId ${serverId}`)
        
        if (modelName === 'reviewHistory' && mode) {
            const model = tableName[mode]
            if (!model) 
                throw new Error(`Model ${modelName} not found for serverId ${serverId} and mode ${mode}`)
            return model
        }
        return tableName
    }
    /**
     * Test the database connection.
     */
    public async testConnection(): Promise<void> {
        try {
            await this.sequelize.authenticate()
            console.log('Connection has been established successfully.')
        } catch (error) {
            console.error('Unable to connect to the database:', error)
        }
    }
}


// Export an instance of the Database class
export default Database.getInstance()
