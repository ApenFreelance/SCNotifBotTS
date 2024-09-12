import { Client } from 'discord.js'
import VerifiedUsers from '../models/VerifiedUsers'
import { Op } from 'sequelize'
import axios from 'axios'
import { AccessLevel } from '../types'
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
    private async checkIfStillVerified(expiringSubscriptions: VerifiedUsers[]) {
        // TODO : Add logging   
        for (const user of expiringSubscriptions) {
            const response = await axios.get(`https://api.skill-capped.com/api/v1/verify/${user.skillCappedId}`)
            
            // TODO: Handle response. Need to check if i failed reaching server because of server issues or not so i know if i should continue trying
            if (response.status !== 200) return
        
            const { accessLevel, skillCappedCheckDate } = response

            if (accessLevel === AccessLevel.NO_ACCESS) {
                //removeUserAccess(user)
                //await user.save()
            }
            user.accessLevel = accessLevel
            user.skillCappedCheckDate = skillCappedCheckDate
            await user.save()
        }
    }
}

export default VerificationSync
