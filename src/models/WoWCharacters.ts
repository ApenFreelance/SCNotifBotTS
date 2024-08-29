import { ModelStatic, Sequelize } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

type WoWCharactersAttributes = {
  reviewNumber: number;
  userEmail: string;
  armoryLink: string;
  characterName: string;
  characterRegion: string;
  armorLevel: number;
  characterClass: string;
  slug: string;
  characterImage: string;
  honorableKills: number;
  twoVtwoRating: number;
  threeVthreeRating: number;
  tenVtenRating: number;
  soloShuffleSpec1Rating: number;
  soloShuffleSpec2Rating: number;
  soloShuffleSpec3Rating: number;
  soloShuffleSpec4Rating: number;
  specialization: string;
  mythicPlusScore: number;
};

export default class WoWCharacters extends Model<WoWCharactersAttributes> {
    declare reviewNumber: number
    declare userEmail: string
    declare armoryLink: string
    declare characterName: string
    declare characterRegion: string
    declare armorLevel: number
    declare characterClass: string
    declare slug: string
    declare characterImage: string
    declare honorableKills: number
    declare twoVtwoRating: number
    declare threeVthreeRating: number
    declare tenVtenRating: number
    declare soloShuffleSpec1Rating: number
    declare soloShuffleSpec2Rating: number
    declare soloShuffleSpec3Rating: number
    declare soloShuffleSpec4Rating: number
    declare specialization: string
    declare mythicPlusScore: number

    static initModel(sequelize:Sequelize, tableName: string): ModelStatic<WoWCharacters> {
        return super.init(
            {
                reviewNumber: { type: DataTypes.INTEGER },
                userEmail: { type: DataTypes.STRING },
                armoryLink: { type: DataTypes.STRING },
                characterName: { type: DataTypes.STRING },
                characterRegion: { type: DataTypes.STRING },
                armorLevel: { type: DataTypes.INTEGER },
                characterClass: { type: DataTypes.STRING },
                slug: { type: DataTypes.STRING },
                characterImage: { type: DataTypes.STRING },
                honorableKills: { type: DataTypes.INTEGER },
                twoVtwoRating: { type: DataTypes.INTEGER, allowNull: true },
                threeVthreeRating: { type: DataTypes.INTEGER, allowNull: true },
                tenVtenRating: { type: DataTypes.INTEGER, allowNull: true },
                soloShuffleSpec1Rating: { type: DataTypes.INTEGER, allowNull: true },
                soloShuffleSpec2Rating: { type: DataTypes.INTEGER, allowNull: true },
                soloShuffleSpec3Rating: { type: DataTypes.INTEGER, allowNull: true },
                soloShuffleSpec4Rating: { type: DataTypes.INTEGER, allowNull: true },
                specialization: { type: DataTypes.STRING, allowNull: true },
                mythicPlusScore: { type: DataTypes.SMALLINT, allowNull: true },
            },
            {
                tableName,
                timestamps: true,
                sequelize,
            }
        ) as ModelStatic<WoWCharacters>
    }
};
