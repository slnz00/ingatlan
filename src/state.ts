import Config from 'interfaces/config.interface'
import * as path from 'node:path';
import FSUtils from 'utils/fs.utils'

const SCRAPED_URLS_PATH = (name: string) => `data/results/${name}/scraped-urls.json`
const RESULT_PATH = (name: string, fileName: string) => `data/results/${name}/${fileName}`

export default class State {
  configs: Record<string, Config>

  private static _instance: State;

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  private constructor() {}

  async initialize () {
    await this.loadConfig()
  }

  private async loadConfig () {
    // @ts-ignore
    const config = require('../data/config').default

    this.configs = typeof config === 'object' ? config : { default: config }
  }

  public async getScrapedUrls (name: string): Promise<string[]> {
    const urlsJson = await FSUtils.readFile(SCRAPED_URLS_PATH(name), false)

    return urlsJson ? JSON.parse(urlsJson) : []
  }

  public async saveScrapedUrls (name: string, urls: string[]): Promise<string> {
    const urlsPath = SCRAPED_URLS_PATH(name)
    const urlsDir = path.dirname(urlsPath)

    await FSUtils.ensureDirectoryExists(urlsDir)
    await FSUtils.writeFile(urlsPath, JSON.stringify(urls))

    return urlsPath
  }

  public async saveResult (name: string, fileName: string, content: string): Promise<string> {
    const resultPath = RESULT_PATH(name, fileName)
    const resultDir = path.dirname(resultPath)

    await FSUtils.ensureDirectoryExists(resultDir)
    await FSUtils.writeFile(resultPath, content)

    return resultPath
  }
}
