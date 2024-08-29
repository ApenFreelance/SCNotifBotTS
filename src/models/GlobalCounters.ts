import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'



type GlobalCounterAttributes = {
    reviewNumberPVP: number;
    reviewNumberPVE: number;
}


export default class GlobalCounters extends Model<GlobalCounterAttributes> {
    declare reviewNumberPVP: number
    declare reviewNumberPVE: number
    
    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<GlobalCounters> {
        return super.init({
            reviewNumberPVP: { type: DataTypes.INTEGER },
            reviewNumberPVE: { type: DataTypes.INTEGER }
        }, {
            tableName,
            // raw:true,
            underscored:true,
            sequelize
        }) as ModelStatic<GlobalCounters>
    }
}
