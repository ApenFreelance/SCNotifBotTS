import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

type WoWReviewHistoryAttributes = {
    status: string;
    userEmail: string;
    userID: string;
    userTag: string;
    charIdOnSubmission: number;
    clipLink: string;
    claimedByID: string;
    claimedByTag: string;
    claimedAt: Date;
    closedByTag: string;
    completedByID: string;
    completedByTag: string;
    completedAt: Date;
    reviewLink: string;
    reviewRating: number;
    reviewRatingComment: string;
    transcript: string;
    createdAt: Date;
};

export default class WoWReviewHistory extends Model<WoWReviewHistoryAttributes> {
    declare status: string
    declare userEmail: string
    declare userID: string
    declare userTag: string
    declare charIdOnSubmission: number
    declare clipLink: string
    declare claimedByID: string
    declare claimedByTag: string
    declare claimedAt: Date
    declare closedByTag: string
    declare completedByID: string
    declare completedByTag: string
    declare completedAt: Date
    declare reviewLink: string
    declare reviewRating: number
    declare reviewRatingComment: string
    declare transcript: string
    declare createdAt: Date

    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<WoWReviewHistory> {
        return super.init({
            status: { type: DataTypes.STRING },
            userEmail: { type: DataTypes.STRING },
            userID: { type: DataTypes.STRING },
            userTag: { type: DataTypes.STRING },
            charIdOnSubmission: { type: DataTypes.INTEGER },
            clipLink: { type: DataTypes.STRING },
            claimedByID: { type: DataTypes.STRING },
            claimedByTag: { type: DataTypes.STRING },
            claimedAt: { type: DataTypes.DATE },
            closedByTag: { type: DataTypes.STRING },
            completedByID: { type: DataTypes.STRING },
            completedByTag: { type: DataTypes.STRING },
            completedAt: { type: DataTypes.DATE },
            reviewLink: { type: DataTypes.STRING },
            reviewRating: { type:DataTypes.INTEGER },
            reviewRatingComment: { type: DataTypes.TEXT },
            transcript: { type: DataTypes.TEXT },
        }, {
            tableName,
            updatedAt:false,
            createdAt:true,
            underscored:true,
            sequelize
        }) as ModelStatic<WoWReviewHistory>
    }
}
