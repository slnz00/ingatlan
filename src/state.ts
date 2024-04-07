import Config from 'interfaces/config.interface'
import FSUtils from 'utils/fs.utils'

const SCRAPED_URLS_PATH = 'data/scraped-urls.json'

export default class State {
  config: Config
  scrapedUrls: string[]

  private static _instance: State;

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  private constructor() {}

  async initialize () {
    await this.loadConfig()
    await this.loadScrapedUrls()
  }

  async save () {
    await this.saveScrapedUrls()
  }

  addScrapedUrls (urls: string[]) {
    this.scrapedUrls = this.scrapedUrls.concat(Array.from(new Set(urls)))
  }

  private async loadConfig () {
    // @ts-ignore
    this.config = require('../data/config').default
  }

  private async loadScrapedUrls () {
    const urlsJson = await FSUtils.readFile(SCRAPED_URLS_PATH, false)
    this.scrapedUrls = urlsJson ? JSON.parse(urlsJson) : []
  }

  private async saveScrapedUrls () {
    await FSUtils.writeFile(SCRAPED_URLS_PATH, JSON.stringify(this.scrapedUrls))
  }
}
