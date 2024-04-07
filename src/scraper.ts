import Browser from 'browser';
import ApartmentData from 'interfaces/apartment-data.interface'
import BaseModel from 'models/base.model'
import State from 'state'
import { JSDOM } from 'jsdom'

export default class Scraper {
  private static _instance: Scraper;

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  private constructor() {}

  async scrapeNewApartments () {
    const state = State.instance
    let hasMorePage = true
    let results: ApartmentData[] = []
    let page = 1

    console.log('Scraping:', this.getUrl())

    do {
      const url = this.getUrl(page)
      const currentResults = await this.scrape(url)

      results = results.concat(currentResults)
      state.addScrapedUrls(currentResults.map(r => r.url))

      hasMorePage = !!currentResults.length
      page++
    } while (hasMorePage)

    return results
  }

  async scrape(url: string): Promise<ApartmentData[]> {
    const state = State.instance
    const { config } = state

    const body = await this.fetchWithBrowser(url)

    const dom = new JSDOM(body)

    const { document } = dom.window

    const listings = [...document.querySelectorAll('.listing-card')] as Element[]

    return listings
      .map(listing => {
        const content = listing.querySelector('.listing-card-content .row')!
        const mainInfo = content.querySelectorAll('.w-100')![0]
        const details = [...content.querySelectorAll('.w-100')![1].querySelectorAll('div.d-flex.flex-column')]

        const getDetail = (name: string) => {
          const container = details.find(c => {
            const currentName = c.querySelector('span.text-nickel')!.textContent || ''
            return currentName.trim() === name
          })

          if (!container) {
            return ''
          }

          return container.querySelector('span.text-onyx')!.textContent || ''
        }

        return {
          url: `https://ingatlan.com${(listing as any).href}`,
          imageUrl: (listing.querySelector('.listing-card-image') as any || { src: '' }).src,
          price: mainInfo.querySelector('div.d-flex span.fw-bold.text-onyx')!.textContent || '',
          address: mainInfo.querySelector('span.d-block.text-onyx')!.textContent || '',
          area: getDetail('Alapterület'),
          balconyArea: getDetail('Erkély'),
          rooms: getDetail('Szobák')
        }
      })
      .filter(result => {
        if (config.excludeWithoutImage) {
          return !result.imageUrl.includes('listing-image-placeholder.svg')
        }
        return true
      })
      .filter(result => !state.scrapedUrls.includes(result.url))
  }

  private async fetchWithBrowser(url: string): Promise<string> {
    const browser = Browser.instance
    const page = await browser.getPage()

    await page.goto(url)

    await page
      .waitForSelector('.primary-header', { timeout: 10000 })
      .catch(() => { throw new Error('Failed to bypass cloudflare protection') })

    return page.content()
  }

  private getUrl(page?: number) {
    const baseUrl = `https://ingatlan.com/lista/${this.getUrlParams()}+ar-szerint`

    if (!page) {
      return baseUrl
    }
    return `${baseUrl}?page=${page}`
  }

  private getUrlParams (): string {
    const { config } = State.instance
    const params: string[] = []

    const addParam = (modelOrParam?: BaseModel | string) => {
      const param = modelOrParam instanceof BaseModel ? modelOrParam.getParam() : modelOrParam

      if (param) {
        params.push(param)
      }
    }

    addParam(config.offerType)
    addParam(config.houseType)

    const cities = config.city instanceof Array ? config.city : [config.city]
    cities.forEach(addParam)

    if (!config.furnished) {
      config.furnished = [];
    }

    const furnished = config.furnished instanceof Array ? config.furnished : [config.furnished]
    furnished.forEach(addParam)

    addParam(config.price)
    addParam(config.area)

    return params.join('+')
  }

  private async createPuppeteer () {

  }
}
