
import { Router, Request, Response } from 'express'
import VerifiedUsers from '../models/VerifiedUsers'
import { grantUserPremium, removeAllAccess } from '../components/functions/userVerificationUtil'
import { AccessLevel } from '../types'


const userRouter = Router()

userRouter.post('/verify', async (req: Request, res: Response) => {
    try {
        const { skillCappedId, linkId, skillCappedCheckDate, mode, accessLevel } = req.body

        // Feel like maybe i should do a check back towards the server here so you cant just give your own data in here.


        if (!skillCappedId) 
            return res.status(400).json({ error: 'skillCappedId is required' })
        if (!linkId) 
            return res.status(400).json({ error: 'linkId is required' })
        if (!Object.values(AccessLevel).includes(accessLevel)) 
            return res.status(400).json({ error: 'Invalid accessLevel' })
        // Logic to remove the user's subscription perks
        // This might involve updating the database, calling other services, etc.
        const user = await VerifiedUsers.findOne({
            where: {
                linkId, // Since we lack a way to connect the accounts beside this and skill capped id...
            }
        })
        if (!user) 
            return res.status(400).json({ error: 'No account with this User ID exists' })
           

        if (user.linkExpirationTime < new Date()) 
            return res.status(400).json({ error: 'Link expired' })
            
        
        user.skillCappedId = skillCappedId
        user.skillCappedCheckDate = skillCappedCheckDate
        user.accessLevel = accessLevel
        // This can potentially fail if that skillcapped account is already connected to someone
        await user.save()

        try {
            await grantUserPremium({ bot: req.bot, userId: user.userId, mode })
            res.status(200).json({ message: 'User has been verified and granted role' })
        } catch (err) {
            res.status(200).json({ error: 'Failed when attempting to provide role: ' + err })
        }
        
    } catch (error) {
        console.error('Error removing user subscription perks:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


userRouter.post('/unverify', async (req: Request, res: Response) => {
    try {
        const { skillCappedId } = req.body

            
        if (!skillCappedId) 
            return res.status(400).json({ error: 'skillCappedId is required' })
        
        // Logic to remove the user's subscription perks
        // This might involve updating the database, calling other services, etc.
        const user = await VerifiedUsers.findOne({
            where: {
                skillCappedId, // Since we lack a way to connect the accounts beside this and skill capped id...
            }
        })
        if (!user) 
            return res.status(400).json({ error: 'No account with this User ID exists' })
        
        user.accessLevel = AccessLevel.NO_ACCESS
        user.save()
        await removeAllAccess({ bot: req.bot, userId: user.userId })
        
        res.status(200).json({ message: 'User subscription perks removed successfully' })
    } catch (error) {
        console.error('Error removing user subscription perks:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})


export default userRouter

