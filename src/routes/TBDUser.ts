import { Client } from 'discord.js'
import { Router, Request, Response } from 'express'
import VerifiedUsers from '../models/VerifiedUsers'
import { CustomEvents } from '../types'

const userRouter = (bot: Client) => {
    const router = Router()

    router.post('/verify', async (req: Request, res: Response) => {
        try {
            const { userId, linkId, skillCappedCheckDate } = req.body
            
            if (!userId) 
                return res.status(400).json({ error: 'User ID is required' })
            if (!linkId) 
                return res.status(400).json({ error: 'linkId is required' })
        
            // Logic to remove the user's subscription perks
            // This might involve updating the database, calling other services, etc.
            const user = await VerifiedUsers.findOne({
                where: {
                    linkId, // Since we lack a way to connect the accounts beside this and skill capped id...
                    
                }
            })
            if (!user) 
                return res.status(400).json({ error: 'No account with this User ID exists' })
           

            /**
             * ! REQUIREMENTS FOR FINDING THE CORRECT ACC
             * * ASSUME THAT USER AUTHENTICATES THROUGH BOT FIRST
             * 
             * If SkillCapped ID is connected somewhere already  
             * 
             */



            await emitVerificationToBot(userId, bot)
        
            res.status(200).json({ message: 'User subscription perks removed successfully' })
        } catch (error) {
            console.error('Error removing user subscription perks:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })
    router.post('/unverify', async (req: Request, res: Response) => {
        try {
            const { userId, code } = req.body
            
            if (!userId) 
                return res.status(400).json({ error: 'User ID is required' })
            if (!code) 
                return res.status(400).json({ error: 'Code is required' })
        
            // Logic to remove the user's subscription perks
            // This might involve updating the database, calling other services, etc.
            await removeUserPerks(userId, bot)
        
            res.status(200).json({ message: 'User subscription perks removed successfully' })
        } catch (error) {
            console.error('Error removing user subscription perks:', error)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    })

    return router
}
async function removeUserPerks(userId: string, bot): Promise<void> {
    // Implement the logic to remove the user's perks here
    // For example, update the database to remove the user's perks
    console.log(`Removing perks for user with ID: ${userId}`)
    bot.emit()
    // Example: await database.removeUserPerks(userId);
}

async function emitVerificationToBot(userId:string, bot): Promise<void> {
    console.log(`Removing perks for user with ID: ${userId}`)
    bot.emit(CustomEvents.VerifyUser, userId, )
}


export default userRouter

