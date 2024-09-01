import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { AccessLevel } from '../types'

type VerifiedUsersAttributes = {
    username: string;
    userId: string;
    skillCappedId: string;
    server: string;
    serverPart: string;
    linkId: string;
    linkExpirationTime: Date;
    accessLevel: AccessLevel;
    skillCappedSbCheckDate: Date;
}
export default class VerifiedUsers extends Model<VerifiedUsersAttributes> {
    declare id: number
    declare username: string
    declare userId: string
    declare server: string
    declare serverPart: string
    declare accessLevel: AccessLevel
    declare createdAt: Date

    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<VerifiedUsers> {
        return super.init({
            username: { type: DataTypes.STRING },
            userId: { type: DataTypes.STRING },
            server: { type: DataTypes.STRING },
            serverPart: { type: DataTypes.STRING },
            accessLevel: { type: DataTypes.STRING },
        }, {
            tableName,
            updatedAt:true,
            createdAt:true,
            underscored: true,
            sequelize
        }) as ModelStatic<VerifiedUsers>
    }
}
