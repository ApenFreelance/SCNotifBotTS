import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'



type GlobalCounterAttributes = {
    review_number_pvp: number;
    review_number_pve: number;
}


export default class GlobalCounters extends Model<GlobalCounterAttributes> {
    declare review_number_pvp: number
    declare review_number_pve: number
    
    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<GlobalCounters> {
        return super.init({
            review_number_pvp: { type: DataTypes.INTEGER },
            review_number_pve: { type: DataTypes.INTEGER }
        }, {
            tableName,
            // raw:true,
            sequelize
        }) as ModelStatic<GlobalCounters>
    }
}
