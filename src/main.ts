import Browser from 'browser';
import ESM from 'esm';
import Scraper from 'scraper'
import State from 'state'
import Template from 'template'

async function main() {
  await ESM.load();

  const { default: open } = ESM.modules.open;

  const state = State.instance
  const scraper = Scraper.instance
  const template = Template.instance

  await state.initialize()

  const startedAt = new Date();
  const newApartments = await scraper.scrapeNewApartments()
  const timeElapsed = new Date().getTime() - startedAt.getTime()

  if (newApartments.length) {
    const htmlPath = await template.saveResultsAsHtml(newApartments)

    console.log(`Scraped ${newApartments.length} new apartments (took: ${timeElapsed} ms), opening browser...`)

    await open(htmlPath).catch(err => console.error('Failed to open browser:', err))
  } else {
    console.log('Could not find any new apartments')
  }

  await state.save()
}

main()
  .catch(console.error)
  .finally(() => {
    Browser.instance.close()
  })
