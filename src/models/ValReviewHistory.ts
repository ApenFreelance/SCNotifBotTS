import { DataTypes, Model, ModelStatic } from 'sequelize'
import { Sequelize } from 'sequelize'

type ReviewHistoryAttributes = {
    status: string;
    userEmail: string;
    userID: string;
    userTag: string;
    clipLink: string;
    AllTimeTier: string;
    CurrentTier: string;
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
};



export default class ValReviewHistory extends Model<ReviewHistoryAttributes> {
    declare status: string
    declare userEmail: string
    declare userID: string
    declare userTag: string
    declare clipLink: string
    declare AllTimeTier: string
    declare CurrentTier: string
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

    static initModel(sequelize: Sequelize, tableName: string): ModelStatic<ValReviewHistory> {
        return super.init({
            status: { type: DataTypes.STRING },
            userEmail: { type: DataTypes.STRING },
            userID: { type: DataTypes.STRING },
            userTag: { type: DataTypes.STRING },
            clipLink: { type: DataTypes.STRING },
            AllTimeTier: { type: DataTypes.STRING },
            CurrentTier: { type: DataTypes.STRING },
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
            sequelize
        }) as ModelStatic<ValReviewHistory>
    }
}
