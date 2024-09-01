import { Client } from 'discord.js'
import { Router, Request, Response } from 'express'
import { CustomEvents } from '../types'

const testRouter = (bot: Client) => {
    const router = Router()

    router.get('/test', async (req, res) => {
        res.status(200).json({ message: 'Got it' }) 

    })


    router.get('/verify-user/:linkId', async (req: Request, res: Response) => {
        try {
            const { linkId } = req.params
            console.log('\nRECEIVED REQUEST\n')
            if (!linkId)
                res.status(400).json({ message: 'linkId missing' })

            /**
             * Returning static data just to like... look cool i guess
             */
            const data = {
                skillCappedId: 2313221,
                linkId

            }   


            res.status(200).json({ ...data })
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


export default testRouter

