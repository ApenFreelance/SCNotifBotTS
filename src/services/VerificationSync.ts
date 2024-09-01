import { Client } from 'discord.js'
import VerifiedUsers from '../models/VerifiedUsers'
import { Op } from 'sequelize'
//import { Logger } from '../classes/Logger'

/**
 * Class representing an Express server.
 */
class VerificationSync {
    private bot: Client
    private refreshRate: number
    /**
     * Creates an instance of ExpressServer.
     */
    constructor(bot: Client, refreshRate: number) {
        this.bot = bot
        this.refreshRate = refreshRate || 60 * 60 * 24 
    }
    private async getExpiringSubscriptions() {
        const today = new Date()
        const expiringSubscriptions = await VerifiedUsers.findAll({
            where: {
                skillCappedCheckDate: {
                    [Op.lte]: today
                }
            }
        })
        return expiringSubscriptions
    }

    

}

export default VerificationSync
