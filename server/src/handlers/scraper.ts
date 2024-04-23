import axios from 'axios'
import * as cheerio from 'cheerio'
import { promises as fsPromises } from 'fs'
import { emptyDir } from 'fs-extra'
import * as path from 'path'

export class Scraper {
  private baseUrl: string = 'https://en.wikipedia.org';

  public async scrapePages(startPage: string, numberOfPages: number): Promise<void> {

    await emptyDir('wikipedia/Words')
    await emptyDir('wikipedia/Links')

    const visited: Set<string> = new Set()
    const toVisit: string[] = [startPage]

    while (toVisit.length > 0 && visited.size < numberOfPages) {
      const currentPage = toVisit.shift()
      if (!currentPage || visited.has(currentPage)) continue

      visited.add(currentPage)
      const pageContent = await this.fetchPage(currentPage)
      await this.processPage(currentPage, pageContent)

      const links = this.extractLinks(pageContent)
      links.forEach(link => {
        if (!visited.has(link)) {
          toVisit.push(link)
        }
      })
    }
  }

  private async fetchPage(pageUrl: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}${pageUrl}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching page ${pageUrl}:`, error)
      return ''
    }
  }

  private async processPage(pageName: string, htmlContent: string): Promise<void> {
    const $ = cheerio.load(htmlContent)
    const textContent = $('#mw-content-text p').map((_, element) => $(element).text()).get()
      .join(' ')
      .toLowerCase()
  
      .replace(/[\W_]+(?<!\d)(?<!\+)/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const links = $('#mw-content-text p a').map((_, element) => $(element).attr('href')).get()
      .filter(href => href && href.startsWith('/wiki/'))
      .filter(href => !href.startsWith('/wiki/Wikipedia:'))
      .filter(href => !href.startsWith('/wiki/Portal:'))
      .filter(href => !href.startsWith('/wiki/Help:'))
      .filter(href => !href.startsWith('/wiki/Talk:'))
      .filter(href => !href.startsWith('/wiki/File:'))
      .map(href => href.trim())

    const pageFileName = pageName.split('/').pop()?.replace(/[\W_]+/g, '_') ?? 'Unknown'

    await this.saveFile(`wikipedia/Words/${pageFileName}`, textContent)
    await this.saveFile(`wikipedia/Links/${pageFileName}`, links.join('\n'))
  }

  private async saveFile(filePath: string, content: string): Promise<void> {
    const directory = path.dirname(filePath)
    await fsPromises.mkdir(directory, { recursive: true })
    await fsPromises.writeFile(filePath, content)
  }

  private extractLinks(htmlContent: string): string[] {
    const $ = cheerio.load(htmlContent)
    return $('#mw-content-text p a').map((_, element) => $(element).attr('href')).get()
      .filter(href => href && href.startsWith('/wiki/'))
      .filter(href => !href.startsWith('/wiki/Wikipedia:'))
      .filter(href => !href.startsWith('/wiki/Portal:'))
      .filter(href => !href.startsWith('/wiki/Help:'))
      .filter(href => !href.startsWith('/wiki/Talk:'))
      .filter(href => !href.startsWith('/wiki/File:'))
      .map(href => href.trim())
  }
}