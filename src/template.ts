import ApartmentData from 'interfaces/apartment-data.interface'
import State from 'state';
import FSUtils from 'utils/fs.utils'
import dayjs from 'dayjs'
import * as Handlebars from 'handlebars'

const TEMPLATE_PATHS = {
  apartments: 'templates/apartments.html'
}

export default class Template {
  private static _instance: Template;

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  async saveResultsAsHtml (name: string, results: ApartmentData[]): Promise<string> {
    const state = State.instance

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

    const date = dayjs().format('YYYY-MM-DD_HH-mm-ss')
    const fileName = `${date}.html`
    const templateSource = await FSUtils.readFile(TEMPLATE_PATHS.apartments, true)
    const template = Handlebars.compile(templateSource)
    const generatedHtml = template({ name: capitalize(name), results })

    return state.saveResult(name, fileName, generatedHtml)
  }
}
