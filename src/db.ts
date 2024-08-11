import { Sequelize, Model as SequelizeModel } from 'sequelize'
import WoWReviewHistory from './models/WoWReviewHistory'
import VerificationLogs from './models/VerificationLogs'
import WoWCharacters from './models/WoWCharacters'
import VerifiedUsers from './models/VerifiedUsers'
import config from '../config/bot.config.json'

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
            process.env.dbUser!,
            process.env.dbPass!,
            {
                host: process.env.dbHost!,
                dialect: 'mariadb',
                logging: false,
            }
        )
        this.initializeModels()
        this.initializeTableMapping()
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
     * Initialize the models and store them in the model mapping.
     */
    private initializeModels(): void {
        const models = [
            { model: WoWReviewHistory, tableName: 'WoWReviewHistory_PVP' },
            { model: WoWReviewHistory, tableName: 'WoWReviewHistory_PVE' },
            { model: VerificationLogs, tableName: 'VerificationLogs' },
            { model: WoWCharacters, tableName: 'WoWCharacters' },
            { model: VerifiedUsers, tableName: 'VerifiedUsers' }
        ]
        models.forEach(({ model, tableName }) => {
            model.initModel(this.sequelize, tableName)
            model.sync()
            this.modelMapping[tableName] = model
        })
    }

    /**
     * Initialize the table mapping.
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
}

// Export an instance of the Database class
export default Database.getInstance()
