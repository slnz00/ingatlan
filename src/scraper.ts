import Browser, { Page } from 'browser';
import ApartmentData from 'interfaces/apartment-data.interface'
import Config from 'interfaces/config.interface';
import BaseModel from 'models/base.model'
import State from 'state'

export default class Scraper {
  private static _instance: Scraper;

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  private constructor() {}

  async scrapeNewApartments (name: string, config: Config) {
    const state = State.instance
    const scrapedUrls = await state.getScrapedUrls(name);

    let hasMorePage = true
    let results: ApartmentData[] = []
    let page = 1

    console.log(`[${name}] Scraping:`, this.getUrl(config))

    do {
      const startedAt = new Date();
      const url = this.getUrl(config, page)
      const currentResults = await this.scrape(url)

      const filteredCurrentResults = currentResults
        .filter(result => {
          if (config.excludeWithoutImage) {
            return !result.imageUrl.includes('listing-image-placeholder.svg')
          }
          return true
        })
        .filter(result => !scrapedUrls.includes(result.url))

      results = results.concat(filteredCurrentResults)
      filteredCurrentResults.forEach(r => scrapedUrls.push(r.url))

      const took = new Date().getTime() - startedAt.getTime()

      console.log(`[${name}] Scraped:`, { page, results: filteredCurrentResults.length, took })

      hasMorePage = !!currentResults.length
      page++
    } while (hasMorePage)

    await state.saveScrapedUrls(name, scrapedUrls)

    return results
  }

  async scrape(url: string): Promise<ApartmentData[]> {
    const page = await this.openPage(url)

    return page.evaluate(() => {
      const listings = Array.from(document.querySelectorAll('.listing-card'))

      return Promise.resolve(
        listings.map(listing => {
          const content = listing.querySelector('.listing-card-content .row')!
          const mainInfo = content.querySelectorAll('.w-100')![0]
          const details = Array.from(content.querySelectorAll('.w-100')![1].querySelectorAll('div.d-flex.flex-column'))

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
            url: (listing as any).href,
            imageUrl: (listing.querySelector('.listing-card-image') as any || { src: '' }).src,
            price: mainInfo.querySelector('div.d-flex span.fw-bold.text-onyx')!.textContent || '',
            address: mainInfo.querySelector('span.d-block.text-onyx')!.textContent || '',
            area: getDetail('Alapterület'),
            balconyArea: getDetail('Erkély'),
            rooms: getDetail('Szobák')
          }
        })
      );
    })
  }

  private async openPage(url: string): Promise<Page> {
    const browser = Browser.instance
    const page = await browser.getPage()

    await page.goto(url)

    await page
      .waitForSelector('.primary-header', { timeout: 10000 })
      .catch(() => { throw new Error('Failed to bypass cloudflare protection') })

    return page
  }

  private getUrl(config: Config, page?: number) {
    const baseUrl = `https://ingatlan.com/lista/${this.getUrlParams(config)}+ar-szerint`

    if (!page) {
      return baseUrl
    }
    return `${baseUrl}?page=${page}`
  }

  private getUrlParams (config: Config): string {
    const params: string[] = []

    const addParam = (modelOrParam?: BaseModel | string) => {
      const param = modelOrParam instanceof BaseModel ? modelOrParam.getParam(config) : modelOrParam

      if (param) {
        params.push(param)
      }
    }

    addParam(config.offerType)
    addParam(config.houseType)

    const cities = config.city instanceof Array ? config.city : [config.city]
    cities.forEach(addParam)

    if (!config.furnished) {
      config.furnished = []
    }
    if (config.airConditioner) {
      addParam('van-legkondi')
    }

    const furnished = config.furnished instanceof Array ? config.furnished : [config.furnished]
    furnished.forEach(addParam)

    addParam(config.price)
    addParam(config.area)

    return params.join('+')
  }
}
