import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'


type ReviewTimerOverwriteAttributes = {
    userName: string;
    userId: string;
    timeBetween: string;
    uses: string;
    isRole: boolean;
    server: string;
}

export default class ReviewTimerOverwrite extends Model<ReviewTimerOverwriteAttributes> {
    declare userName: string
    declare userId: string
    declare timeBetween: string
    declare uses: string
    declare isRole: boolean
    declare server: string
    
    static initModel(sequelize: Sequelize): ModelStatic<ReviewTimerOverwrite> {
        return super.init({
            userName: { type: DataTypes.STRING },
            userId: { type: DataTypes.STRING },
            timeBetween: { type: DataTypes.STRING },
            uses: { type: DataTypes.STRING },
            isRole: { type: DataTypes.BOOLEAN },
            server: { type: DataTypes.STRING }
        }, {
            tableName: 'ReviewTimerOverwrite',
            updatedAt:true,
            createdAt:true,
            // raw:true,
            sequelize
        }) as ModelStatic<ReviewTimerOverwrite>
    }
}
