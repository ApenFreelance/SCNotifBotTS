import express, { Express, Request, Response } from 'express'
import router from '../routes/TBDUser'
import { Logger } from '../classes/Logger'

/**
 * Class representing an Express server.
 */
class ExpressServer {
    private app: Express
    private port: number | string

    /**
     * Creates an instance of ExpressServer.
     */
    constructor() {
        this.app = express()
        this.port = process.env.PORT || 3000
        this.setupMiddleware()
        this.setupRoutes()
    }

    /**
     * Sets up middleware for the Express server.
     */
    private setupMiddleware(): void {
        this.app.use(express.json())
    }

    /**
     * Sets up routes for the Express server.
     */
    private setupRoutes(): void {
        this.app.get('/', (req: Request, res: Response) => {
            res.send('Hello, this is your Discord bot server!')
        })

        this.app.use('/user', router)
    }

    /**
     * Starts the Express server.
     */
    public start(): void {
        this.app.listen(this.port, () => {
            Logger.log(`Server is running on port ${this.port}`)
        })
    }
}

export default ExpressServer
