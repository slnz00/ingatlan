import esm from 'esm';
import { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer'

export type Page = PuppeteerPage

export default class Browser {
  private browsers: PuppeteerBrowser[] = []
  private pagesByName: Record<string, PuppeteerPage> = {}

  private static _instance: Browser;

  static get instance() {
    return this._instance || (this._instance = new this())
  }

  async close () {
    for (const browser of this.browsers) {
      await browser.close();
    }

    this.browsers = []
    this.pagesByName = {}
  }

  async getPage (name: string): Promise<PuppeteerPage> {
    if (!this.pagesByName[name]) {
      const { connect } = esm.modules['puppeteer-real-browser']

      const { browser, page } = await connect({})

      this.browsers.push(browser)
      this.pagesByName[name] = page
    }

    return this.pagesByName[name]
  }

  async waitForNavigationToComplete (name: string) {
    const page = await this.getPage(name)

    if (!page) {
      return
    }

    try {
      await page!.waitForNavigation({ waitUntil: 'networkidle2', timeout: 500 })
    } catch (err) {}
  }

  private constructor() {}
}
