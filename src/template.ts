import ApartmentData from 'interfaces/apartment-data.interface'
import * as path from 'path'
import FSUtils from 'utils/fs.utils'
import * as dayjs from 'dayjs'
import * as Handlebars from 'handlebars'

const TEMPLATE_PATHS = {
  newApartments: 'templates/new-apartments.html'
}

const RESULTS_PATH_BASE = 'data/results'

export default class Template {
  private static _instance: Template;

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  async saveResultsAsHtml (results: ApartmentData[]): Promise<string> {
    const fileName = dayjs().format('YYYY-MM-DD_HH-mm-ss')
    const htmlPath = path.normalize(__dirname + `/../${RESULTS_PATH_BASE}/${fileName}.html`)
    const templateSource = await FSUtils.readFile(TEMPLATE_PATHS.newApartments, true)
    const template = Handlebars.compile(templateSource)
    const generatedHtml = template({ results })

    await FSUtils.writeFile(htmlPath, generatedHtml)

    return htmlPath
  }
}
