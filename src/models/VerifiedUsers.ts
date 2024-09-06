import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'
import { AccessLevel } from '../types'

type VerifiedUsersAttributes = {
    username: string;
    /**
     * Discord user id
     */
    userId: string;
    skillCappedId: string;
    /**
     * Discord server id
     */
    server: string;
    linkId: string;
    /**
     * Date when the link used to connect SC with bot will expire.
     */
    linkExpirationTime: Date;
    accessLevel: AccessLevel;
    /**
     * Date this users verification status will be checked again.
     */
    skillCappedCheckDate: Date;
}
export default class VerifiedUsers extends Model<VerifiedUsersAttributes> {
    declare id: number
    declare username: string
    declare userId: string
    declare server: string
    declare linkId: string
    declare linkExpirationTime: Date
    declare accessLevel: AccessLevel
    declare createdAt: Date
    declare skillCappedCheckDate: Date

    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<VerifiedUsers> {
        return super.init({
            username: { type: DataTypes.STRING },
            userId: { type: DataTypes.STRING },
            server: { type: DataTypes.STRING },
            accessLevel: { type: DataTypes.STRING },
            linkId: { type: DataTypes.STRING },
            linkExpirationTime: { type: DataTypes.DATE },
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
