import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'


type ReviewTimerOverwriteAttributes = {
    username: string;
    userId: string;
    timeBetween: string;
    uses: number | 'unlimited';
    isRole: boolean;
    server: string;
}

export default class ReviewTimerOverwrite extends Model<ReviewTimerOverwriteAttributes> {
    declare username: string
    declare userId: string
    declare timeBetween: string
    declare uses: number | 'unlimited'
    declare isRole: boolean
    declare server: string
    
    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<ReviewTimerOverwrite> {
        return super.init({
            username: { type: DataTypes.STRING },
            userId: { type: DataTypes.STRING },
            timeBetween: { type: DataTypes.STRING },
            uses: { type: DataTypes.STRING },
            isRole: { type: DataTypes.BOOLEAN },
            server: { type: DataTypes.STRING }
        }, {
            tableName,
            updatedAt:true,
            createdAt:true,
            underscored:true,
            // raw:true,
            sequelize
        }) as ModelStatic<ReviewTimerOverwrite>
    }
}
