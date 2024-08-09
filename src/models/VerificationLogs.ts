import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

type VerificationLogsAttributes = {
    userName: string;
    userId: string;
    email: string;
    wasSuccessful: boolean;
    rejectionReason: string;
    server: string;
    serverPart: string;
}

export default class VerificationLogs extends Model<VerificationLogsAttributes> {
    declare userName: string
    declare userId: string
    declare email: string
    declare wasSuccessful: boolean
    declare rejectionReason: string
    declare server: string
    declare serverPart: string

    static initModel(sequelize: Sequelize): ModelStatic<VerificationLogs> {
        return super.init({
            userName: { type: DataTypes.STRING },
            userId: { type: DataTypes.STRING },
            email: { type: DataTypes.STRING },
            wasSuccessful: { type: DataTypes.BOOLEAN },
            rejectionReason: { type: DataTypes.STRING },
            server: { type: DataTypes.STRING },
            serverPart: { type: DataTypes.STRING }
        }, {
            tableName: 'VerificationLogs',
            updatedAt:true,
            createdAt:true,
            //raw:true,
            sequelize
        }) as ModelStatic<VerificationLogs>
    }
}
