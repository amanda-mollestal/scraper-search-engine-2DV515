/**
 * @file This file routes the requests to the appropriate controller.
 */

import express, { Request, Response, NextFunction } from 'express'
import createError from 'http-errors'
import { SearchController } from '../controllers/searchController'

export const router = express.Router()
const searchController = new SearchController()

router.get('/', (req: Request, res: Response) => {
  res.status(200).json('WELCOME TO THE API')
})

router.post('/scrape', (req: Request, res: Response, next: NextFunction) => {
  searchController.scrape(req, res, next)
})


router.post('/search', (req: Request, res: Response, next: NextFunction) => {
  searchController.query(req, res, next)
})

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req: Request, res: Response, next: NextFunction) => next(createError(404)))
