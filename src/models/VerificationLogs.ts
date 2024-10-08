import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

type VerificationLogsAttributes = {
    username: string;
    userId: string;
    email: string;
    wasSuccessful: boolean;
    rejectionReason: string;
    server: string;
    serverPart: string;
}

export default class VerificationLogs extends Model<VerificationLogsAttributes> {
    declare username: string
    declare userId: string
    declare email: string
    declare wasSuccessful: boolean
    declare rejectionReason: string
    declare server: string
    declare serverPart: string

    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<VerificationLogs> {
        return super.init({
            username: { type: DataTypes.STRING },
            userId: { type: DataTypes.STRING },
            email: { type: DataTypes.STRING },
            wasSuccessful: { type: DataTypes.BOOLEAN },
            rejectionReason: { type: DataTypes.STRING },
            server: { type: DataTypes.STRING },
            serverPart: { type: DataTypes.STRING }
        }, {
            tableName,
            updatedAt:true,
            createdAt:true,
            underscored:true,
            sequelize
        }) as ModelStatic<VerificationLogs>
    }
}
