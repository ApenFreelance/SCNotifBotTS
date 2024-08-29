import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

type VerifiedUsersAttributes = {
    user_name: string;
    user_id: string;
    email: string;
    server: string;
    server_part: string;
}
export default class VerifiedUsers extends Model<VerifiedUsersAttributes> {
    declare id: number
    declare user_name: string
    declare user_id: string
    declare email: string
    declare server: string
    declare server_part: string
    declare createdt: Date
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
            underscored:true,
            sequelize
        }) as ModelStatic<VerifiedUsers>
    }
}
