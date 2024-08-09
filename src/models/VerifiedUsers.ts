import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

type VerifiedUsersAttributes = {
    userName: string;
    userId: string;
    email: string;
    server: string;
    serverPart: string;
}
export default class VerifiedUsers extends Model<VerifiedUsersAttributes> {
    declare userName: string
    declare userId: string
    declare email: string
    declare server: string
    declare serverPart: string
    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<VerifiedUsers> {
        return super.init({
            userName: { type: DataTypes.STRING },
            userId: { type: DataTypes.STRING },
            email: { type: DataTypes.STRING },
            server: { type: DataTypes.STRING },
            serverPart: { type: DataTypes.STRING }
        }, {
            tableName,
            updatedAt:true,
            createdAt:true,
            sequelize
        }) as ModelStatic<VerifiedUsers>
    }
}
