const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')
const Handlebars = require('handlebars')
const open = require('opn');

function readFile(filePath, failOnError = false) {
  try {
    return fs.readFileSync(path.normalize(filePath), 'utf8')
  } catch (error) {
    if (!failOnError) {
      return null
    }
    throw error
  }
}

function writeFile(filePath, data, failOnError = false) {
  try {
    fs.writeFileSync(path.normalize(filePath), data)
  } catch (error) {
    if (!failOnError) {
      console.error(error)
      return null
    }
    throw error
  }
}

const configManager = {
  _path: path.normalize('data/config.json'),
  _value: null,

  default: () => ({
    searchParams: {
      startPrice: 120,
      endPrice: 175,
      minArea: 40,
      districts: ['XI', 'XII', 'V'],
      excludeWithoutImage: true,
    },
    scrapedUrls: []
  }),

  load() {
    if (!this._value) {
      this._value = JSON.parse(readFile(this._path)) || this.default()
      this.save(this._value)
    }
  },

  get() {
    return this._value
  },

  save() {
    writeFile(this._path, JSON.stringify(this._value || this.default(), null,4))
  },
}

function getUrl(page) {
  const { startPrice, endPrice, minArea, districts } = configManager.get().searchParams

  let districtsStr = 'budapest'
  if (districts.length) {
    districtsStr = districts.map(d => `${d}-ker`).join('+')
  }

  return `https://ingatlan.com/lista/kiado+lakas+${districtsStr}+havi-${startPrice}-${endPrice}-ezer-Ft+${minArea}-m2-felett+ar-szerint?page=${page}`
}

async function scrape(page) {
  const url = getUrl(page)
  const { searchParams } = configManager.get()

  const body = await fetch(url)
    .then(res => res.text())

  const dom = new JSDOM(body)
  const { document } = dom.window

  const listings = [...document.querySelectorAll('.listing__card')]

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
    .filter(listings => {
      if (searchParams.excludeWithoutImage) {
        return !!listings.imageUrl
      }
      return true
    })
}

function filterAlreadyScrapedResults(results) {
  const alreadyScrapedUrls = configManager.get().scrapedUrls

  return results.filter(listing => !alreadyScrapedUrls.includes(listing.url))
}

async function scrapeNewApartments() {
  let hasMorePage = true
  let results = []
  let page = 1

  do {
    const currentResults  = await scrape(page)
    const filteredCurrentResults = filterAlreadyScrapedResults(currentResults)
    results = results.concat(filteredCurrentResults)

    console.log('Scraped:', { page, results: currentResults.length })

    hasMorePage = !!currentResults.length
    page++
  } while (hasMorePage)

  return results
}

function markResultsAsAlreadyScraped(results) {
  const newUrls = results.map(result => result.url)
  if (!newUrls.length) {
    return
  }

  const config = configManager.get()
  config.scrapedUrls = config.scrapedUrls.concat(newUrls)
}

function saveResultsToHtml(results) {
  if (!results.length) {
    console.log('Could not find any new apartments')
    return
  }

  const htmlPath = path.normalize(__dirname + `/../data/results/${new Date().toISOString()}.html`)
  const templateSource = readFile('templates/new-apartments.html', true)
  const template = Handlebars.compile(templateSource)
  const generatedHtml = template({ results })

  writeFile(htmlPath, generatedHtml)

  console.log(`Scraped ${results.length} new apartments, opening browser...`)
  open(htmlPath)
}

async function main() {
  configManager.load()

  const results = await scrapeNewApartments()
  markResultsAsAlreadyScraped(results)
  saveResultsToHtml(results)

  configManager.save()
}

main()
