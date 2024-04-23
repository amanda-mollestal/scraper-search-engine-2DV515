import express, { Express, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import createError from 'http-errors'
import { router } from './routes/router'
import cors from 'cors'

const app: Express = express()

async function startServer() {
  try {
    // Set various HTTP headers to make the application a little more secure (https://www.npmjs.com/package/helmet).
    app.use(helmet())

    // Enable CORS
    app.use(cors())

    // Set up a morgan logger using the dev format for log entries.
    app.use(logger('dev'))

    // Parse requests of the content type application/json.
    app.use(express.json())

    // Parse requests of the content type application/x-www-form-urlencoded.
    app.use(express.urlencoded({ extended: true }))

    // Register routes.
    app.use('/', router)

    // Error handler.
    app.use((err: createError.HttpError, req: Request, res: Response, next: NextFunction) => {
      if (!err.status) {
        const cause = err
        err = createError(500);
        (err as any).cause = cause
      }

      if (req.app.get('env') !== 'development') {
        return res.status(err.status).json({
          status: err.status,
          message: err.message,
        })
      }

      // Development only!
      // Only providing detailed error in development.
      return res.status(err.status).json({
        status: err.status,
        message: err.message,
        cause: (err as any).cause
          ? JSON.stringify((err as any).cause, Object.getOwnPropertyNames((err as any).cause))
          : undefined,
        stack: err.stack,
      })
    })

    // Starts the HTTP server listening for connections.
    const PORT = process.env.PORT || 3030
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
      console.log('Press Ctrl-C to terminate...')
    })
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  }
}

startServer()