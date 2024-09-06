import express, { Express, Request, Response, NextFunction } from 'express'
import { Client } from 'discord.js'
import userRouter from '../routes/User'
import testRouter from '../routes/TestUser'
//import { Logger } from '../classes/Logger'

/**
 * Class representing an Express server.
 */
class ExpressServer {
    private app: Express
    private port: number | string
    private bot: Client

    /**
     * Creates an instance of ExpressServer.
     */
    constructor() {
        this.app = express()
        this.port = process.env.PORT || 3000
        this.setupMiddleware()
    }
    /**
     * Attaches the bot to server. As function in case of restart of just server or bot seperatly
     * @param bot 
     */
    public setBotClient(bot: Client) {
        this.bot = bot
        this.setupRoutes()
    }
    /**
     * Sets up middleware for the Express server.
     */
    private setupMiddleware(): void {
        this.app.use(express.json())
        this.app.use(this.ensureBotClient.bind(this))
    }
    /**
     * Middleware to ensure bot client is available.
     */
    private ensureBotClient(req: Request, res: Response, next: NextFunction): void {
        if (!this.bot) 
            return res.status(503).json({ error: 'Bot client is not available' })
        
        req.bot = this.bot // Attach the bot instance to the request object
        next()
    }


    /**
     * Sets up routes for the Express server.
     */
    private setupRoutes(): void {
        this.app.get('/', (req: Request, res: Response) => {
            res.send('Hello, this is your Discord bot server!')
        })
        this.app.use('/user', userRouter)
        this.app.use('/test', testRouter(this.bot))
    }

    /**
     * Starts the Express server.
     * 
     * @param {Client} [bot] - Optional bot client to set.
     */
    public start(bot: Client | null = null): void {
        if (bot) 
            this.setBotClient(bot)
        
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`)
        })
        
    }
}

export default ExpressServer
