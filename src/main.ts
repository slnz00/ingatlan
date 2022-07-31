import * as open from 'open'
import Scraper from 'scraper'
import State from 'state'
import Template from 'template'

async function main() {
  const state = State.instance
  const scraper = Scraper.instance
  const template = Template.instance

  await state.initialize()

  const newApartments = await scraper.scrapeNewApartments()
  if (newApartments.length) {
    const htmlPath = await template.saveResultsAsHtml(newApartments)
    console.log(`Scraped ${newApartments.length} new apartments, opening browser...`)

    await open(htmlPath).catch(err => console.error('Failed to open browser:', err))
  } else {
    console.log('Could not find any new apartments')
  }

  await state.save()
}

main().catch(console.error)
