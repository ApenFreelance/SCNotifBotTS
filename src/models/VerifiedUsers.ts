import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { AccessLevel } from '../types'

type VerifiedUsersAttributes = {
    username: string;
    userId: string;
    skillCappedId: string;
    server: string;
    linkId: string;
    linkExpirationTime: Date;
    accessLevel: AccessLevel;
    skillCappedCheckDate: Date;
}
export default class VerifiedUsers extends Model<VerifiedUsersAttributes> {
    declare id: number
    declare username: string
    declare userId: string
    declare server: string
    declare accessLevel: AccessLevel
    declare createdAt: Date
    declare skillCappedCheckDate: Date

    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<VerifiedUsers> {
        return super.init({
            username: { type: DataTypes.STRING },
            userId: { type: DataTypes.STRING },
            server: { type: DataTypes.STRING },
            accessLevel: { type: DataTypes.STRING },
            skillCappedCheckDate: { type: DataTypes.DATE }
        }, {
            tableName,
            updatedAt:true,
            createdAt:true,
            underscored: true,
            sequelize
        }) as ModelStatic<VerifiedUsers>
    }
}
