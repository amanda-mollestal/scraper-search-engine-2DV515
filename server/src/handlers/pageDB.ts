import fs from 'fs'
import path from 'path'

/**
 * Represents a Wikipedia page with a name and an array of word ids.
 */
interface Page {
  name: string
  wordIds: number[]
}


/**
 * Represents a database of Wikipedia pages.
 */
export class PageDB {

  /*
   * A map from words to word ids.
   */
  private wordToIdMap: Map<string, number>

  /*
   * An array of pages.
   */
  private pages: Page[]

  constructor() {
    this.wordToIdMap = new Map<string, number>()
    this.pages = new Array<Page>()
    this.parseFolders()
  }

  /**
   * Parses the data from folders.
   */
  parseFolders(): void {
    console.time('parseData')
    const relativeWordPath = '/wikipedia/Words/'
    const wordPath = path.join(process.cwd(), relativeWordPath)

    /*const relativePathToProgramming = '/wikipedia/Words/Programming'
    const programmingPath = path.join(process.cwd(), relativePathToProgramming)

    this.parseFolder(gamesPath)
    this.parseFolder(programmingPath)*/
    this.parseFolder(wordPath)

    console.timeEnd('parseData')

  }

  /**
   * Parses the data from a folder.
   * @param pathToFolder The path to the folder to parse.
   */
  parseFolder(pathToFolder: string): void {
    const fileNames = fs.readdirSync(pathToFolder)
    fileNames.forEach((fileName) => {
      const filePath = path.join(pathToFolder, fileName)
      this.parseFile(filePath)
    })
  }

  /**
   * Parses the data from a file, adding the words to the wordToIdMap 
   * and creates a Page with the file name and the word ids.
   * @param filePath The path to the file to parse.
   */
  parseFile(filePath: string): void {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const words = fileContent.match(/\b[\w+]+\b/g)
    if (words) {
      
      const page = { name: path.basename(filePath), wordIds: new Array<number>()}

      words.forEach((word) => {
        const wordId = this.getIdForWord(word.toLowerCase())
        page.wordIds.push(wordId)
      })
      this.pages.push(page)
    }
  }

  /**
   * Takes a word and returns its id. If the word is not in the wordToIdMap, it is added.
   * @param word The word to get the id for.
   * @returns The id of the word.
   */
  private getIdForWord(word: string): number {
    if (!this.wordToIdMap.has(word)) {
      this.wordToIdMap.set(word, this.wordToIdMap.size)
    }
    return this.wordToIdMap.get(word)!
  }

  /**
   * Returns the id of a word.
   * @param word The word to get the id for.
   * @returns The id of the word.
   */
  getId(word: string): number | undefined {
    return this.wordToIdMap.get(word)
  }

  /**
   * Returns all the pages.
   */
  getPages(): Page[] {
    return this.pages
  }

  
}
