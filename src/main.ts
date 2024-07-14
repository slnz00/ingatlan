import Browser from 'browser';
import esm from 'esm';
import Scraper from 'scraper'
import State from 'state'
import Template from 'template'

async function main() {
  await esm.load();

  const { default: open } = esm.modules.open;

  const state = State.instance
  const scraper = Scraper.instance
  const template = Template.instance

  await state.initialize()

  for (const [name, config] of Object.entries(state.configs)) {
    if (config.enabled === false) {
      console.log(`[${name}] Config is disabled, skipping...`)

      continue
    }

    const startedAt = new Date();
    const newApartments = await scraper.scrapeNewApartments(name, config)
    const timeElapsed = new Date().getTime() - startedAt.getTime()

    if (newApartments.length) {
      const htmlPath = await template.saveResultsAsHtml(name, newApartments)

      console.log(`[${name}] Scraped ${newApartments.length} new apartments (took: ${timeElapsed} ms), opening browser...`)

      await open(htmlPath).catch(err => console.error(`[${name}] Failed to open browser:`, err))
    } else {
      console.log(`[${name}] Could not find new apartments`)
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await Browser.instance.close()
  })
