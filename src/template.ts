import ApartmentData from 'interfaces/apartment-data.interface'
import State from 'state';
import FSUtils from 'utils/fs.utils'
import dayjs from 'dayjs'
import * as Handlebars from 'handlebars'

const TEMPLATE_PATHS = {
  apartments: 'templates/apartments.html'
}

export default class Template {
  private readonly name: string

  constructor (name: string) {
    this.name = name
  }

  async saveResultsAsHtml (results: ApartmentData[]): Promise<string> {
    const state = State.instance

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

    const date = dayjs().format('YYYY-MM-DD_HH-mm-ss')
    const fileName = `${date}.html`
    const templateSource = await FSUtils.readFile(TEMPLATE_PATHS.apartments, true)
    const template = Handlebars.compile(templateSource)
    const generatedHtml = template({ name: capitalize(this.name), results })

    return state.saveResult(this.name, fileName, generatedHtml)
  }
}
