import { DataTypes, Model } from 'sequelize';

export default class VerifiedUsers extends Model {
    static init(sequelize) {
        return super.init({
         userName: { type: DataTypes.STRING },
         userId: { type: DataTypes.STRING },
         email: { type: DataTypes.STRING },
         server: {type: DataTypes.STRING},
         serverPart: {type: DataTypes.STRING}
        }, {
            tableName: "VerifiedUsers",
            updatedAt:true,
            createdAt:true,
            raw:true,
            sequelize
        });
    }
}