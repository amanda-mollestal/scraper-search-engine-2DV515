import { PageDB } from './pageDB'

/**
 * Represents a Wikipedia page with its score relative to a search query.
 */
interface PageScore {
  name: string
  score: number
  freqScore: number
  locScore: number
}


/**
 * Represents a search engine that can query a PageDB.
 */
export class SearchEngine {

  /**
   * The PageDB to query.
   */
  private pageDB: PageDB

  constructor() {
    this.pageDB = new PageDB()
  }

  /**
   * Returns an array of PageScores that match the search query.
   * @param query The search query.
   * @returns An array of PageScores that match the query.
   */
  query(query: string): Array<PageScore> {
    const queryWords = this.getIdArray(query.toLowerCase())

    if (queryWords.length === 0) {
      return []
    }

    console.log(this.pageDB.getPages().length)

    const pageScores = this.getPageScores(queryWords)
    return pageScores
  }

  /**
   * Returns an array of word ids that match the search query.
   * @param query The search query.
   * @returns An array of word ids that match the query.
   */
  getIdArray(query: string): Array<number> {
    const wordIds = (query.match(/\b[\w+]+\b/g) || [])
      .map(word => this.pageDB.getId(word))
      .filter(id => id !== undefined)

    return wordIds as Array<number>
  }

  /**
   * Returns an array of PageScores with calculated scores.
   * @param queryWords The word ids that match the query.
   * @returns A sorted array of PageScores that match the query.
   */
  getPageScores(queryWords: Array<number>): Array<PageScore> {

    const pageMap = this.pageDB.getPages()
      .map((page) => {
        const freqScore = this.wordFrequency(page.wordIds, queryWords)
        const locScore = this.documentLocation(page.wordIds, queryWords)
        const score = 0

        return { name: page.name, score, freqScore, locScore }
      })
      .filter((item) => item.freqScore > 0)

    const normalizedScores = this.normalize(pageMap)

    const results = normalizedScores.map((page) => {
      return {
        name: page.name,
        score: page.freqScore + 0.8 * page.locScore,
        freqScore: page.freqScore,
        locScore: 0.8 * page.locScore,
      }
    })

    results.sort((a, b) => b.score - a.score)

    return results
  }

  /**
   * Calculates the word frequency score for a page.
   * @param wordIds The word ids the page contains.
   * @param queryWords The word ids that match the query.
   * @returns The word frequency score for the page.
   */
  wordFrequency(wordIds: number[], queryWords: number[]): number {
    let score = 0
    queryWords.forEach(queryId => {
      wordIds.forEach(wordId => {
        if (wordId === queryId) {
          score += 1
        }
      })
    })
    return score
  }

  /**
   * Calculates the document location score for a page.
   * @param wordIds The word ids the page contains.
   * @param queryWords The word ids that match the query.
   * @returns The document location score for the page.
   */
  documentLocation(wordIds: number[], queryWords: number[]): number {
    let score = 0
    queryWords.forEach(queryId => {
      const index = wordIds.findIndex(wordId => wordId === queryId)

      if (index !== -1) {
        score += (index + 1)
      } else {
        score += 100000
      }
    })
    return score
  }

  /**
   * Normalizes the scores for each page.
   * @param pages The array of pages with their scores.
   * @returns The array of pages with their normalized scores.
   */
  normalize(pages: Array<PageScore>): Array<PageScore> {

    const maxFrequency = Math.max(...pages.map((item) => item.freqScore), 0.00001)

    const minLocation = Math.min(...pages.map((item) => item.locScore))

    return pages.map((item) => {
      return {
        name: item.name,
        score: item.score,
        freqScore: item.freqScore / maxFrequency,
        locScore: minLocation / Math.max(item.locScore, 0.00001)
      }
    })
  }
}

