import Browser from 'browser';
import esm from 'esm';
import Scraper from 'scraper'
import State from 'state'
import Template from 'template'

async function main() {
  await esm.load()

  const { default: open } = esm.modules.open
  const nameFilter = process.argv.slice(2);
  const state = State.instance

  await state.initialize()

  await Promise.all(
    Object.entries(state.configs).map(async ([name, config]) => {
      try {
        if (nameFilter.length && !nameFilter.includes(name)) {
          return
        }
        if (!nameFilter.includes(name) && config.enabled === false) {
          console.log(`[${name}] Config is disabled, skipping...`)

          return
        }

        const scraper = new Scraper(name, config);
        const template = new Template(name)

        const startedAt = new Date();
        const newApartments = await scraper.scrapeNewApartments()
        const timeElapsed = new Date().getTime() - startedAt.getTime()

        if (newApartments.length) {
          const htmlPath = await template.saveResultsAsHtml(newApartments)

          console.log(`[${name}] Scraped ${newApartments.length} new apartments (took: ${timeElapsed} ms), opening browser...`)

          await open(htmlPath).catch(err => console.error(`[${name}] Failed to open browser:`, err))
        } else {
          console.log(`[${name}] Could not find new apartments`)
        }
      } catch (err) {
        console.error(`[${name}]`, err);
      }
    })
  )
}

main()
  .catch(console.error)
  .finally(async () => {
    await Browser.instance.close()
  })
