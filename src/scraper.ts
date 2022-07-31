import ApartmentData from 'interfaces/apartment-data.interface'
import BaseModel from 'models/base.model'
import fetch from 'node-fetch'
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

      console.log('Scraped:', { page, results: currentResults.length })

      hasMorePage = !!currentResults.length
      page++
    } while (hasMorePage)

    return results
  }

  async scrape(url: string): Promise<ApartmentData[]> {
    const state = State.instance
    const { config } = state

    const body = await fetch(url).then((res: any) => res.text())

    const dom = new JSDOM(body)
    const { document } = dom.window

    const listings = [...document.querySelectorAll('.listing__card') as any]

    return listings
      .map(listing => ({
        url: 'https://ingatlan.com' + listing.querySelector('.listing__link.js-listing-active-area').href,
        imageUrl: (listing.querySelector('.listing__image') || { src: '' }).src,
        price: listing.querySelector('.price').innerHTML.trim(),
        address: listing.querySelector('.listing__address').innerHTML.trim(),
        area: listing.querySelector('.listing__parameter.listing__data--area-size').innerHTML.trim(),
        balconyArea: (listing.querySelector('.listing__parameter.listing__data--balcony-size') || { innerHTML: '' }).innerHTML.trim(),
        rooms: listing.querySelector('.listing__parameter.listing__data--room-count').innerHTML.trim()
      }))
      .filter(result => {
        if (config.excludeWithoutImage) {
          return !!result.imageUrl
        }
        return true
      })
      .filter(result => !state.scrapedUrls.includes(result.url))
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

    addParam(config.price)
    addParam(config.area)

    return params.join('+')
  }
}
