import ESM from 'esm';
import { Browser as PuppeteerBrowser, Page as PuppeteerPage } from 'puppeteer';

export type Page = PuppeteerPage;

export default class Browser {
  private initialized: boolean = false
  private browser: PuppeteerBrowser | null = null
  private page: PuppeteerPage | null = null

  private static _instance: Browser;

  static get instance() {
    return this._instance || (this._instance = new this());
  }

  async close () {
    if (this.browser) {
      await this.browser.close();
    }

    this.browser = null
    this.page = null
    this.initialized = false
  }

  async getPage (): Promise<PuppeteerPage> {
    await this.ensureInitialized()

    return this.page!
  }

  async waitForNavigationToComplete () {
    if (!this.page) {
      return
    }

    try {
      await this.page!.waitForNavigation({ waitUntil: 'networkidle2', timeout: 500 })
    } catch (err) {}
  }

  private constructor() {}

  private async ensureInitialized () {
    if (this.initialized) {
      return
    }

    const { connect } = ESM.modules['puppeteer-real-browser'];

    const { browser, page } = await connect({});

    this.browser = browser
    this.page = page
    this.initialized = true
  }
}
