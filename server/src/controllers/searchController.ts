import { SearchEngine } from '../handlers/searchEngine'
import { Request, Response, NextFunction } from 'express'
import { Scraper } from '../handlers/scraper'

/**
 * Represents a controller that handles search requests.
 */
export class SearchController {

  /**
   * The SearchEngine to query.
   */
  private searchEngine: SearchEngine

  constructor() {
    this.searchEngine = new SearchEngine()
  }

  /**
   * Scrapes the Wikipedia pages.
   * @param req The request.
   * @param res The response.
   * @param next The next function.
   */
  async scrape(req: Request, res: Response, next: NextFunction) {
    let startPage = req.body.startPage
    const numberOfPages = req.body.numberOfPages
    if (!startPage || !numberOfPages) {
      res.status(400).json('Missing start page or number of pages')
      return
    }

    startPage = startPage.split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('_')

    startPage = `/wiki/${startPage}`

    
    console.log('Scraping...')
    const scraper = new Scraper()
    await scraper.scrapePages(startPage, numberOfPages)
    this.searchEngine = new SearchEngine()

    res.status(200).json('Scraping complete')
  }

  /**
   * Queries the SearchEngine and returns the results.
   * @param req The request.
   * @param res The response.
   * @param next The next function.
   */
  query(req: Request, res: Response, next: NextFunction) {
    const searchQuery = req.body.query
    if (!searchQuery) {
      res.status(400).json('No search query provided')
      return
    }

    const results = this.searchEngine.query(searchQuery)
    res.status(200).json(results)
  }
}