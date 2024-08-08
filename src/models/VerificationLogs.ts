import { DataTypes, Model } from 'sequelize';

module.exports = class VerificationLogs extends Model {
    static init(sequelize) {
        return super.init({
         userName: { type: DataTypes.STRING },
         userId: { type: DataTypes.STRING },
         email: { type: DataTypes.STRING },
         wasSuccessful: {type: DataTypes.BOOLEAN },
         rejectionReason: {type: DataTypes.STRING},
         server: {type: DataTypes.STRING},
         serverPart: {type: DataTypes.STRING}
        }, {
            tableName: "VerificationLogs",
            updatedAt:true,
            createdAt:true,
            raw:true,
            sequelize
        });
    }
}