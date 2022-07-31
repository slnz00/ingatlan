import BaseModel from 'models/base.model'

export abstract class CityBase extends BaseModel {}

class Plain extends CityBase {
  name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  getParam(): string {
    return this.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '')
  }
}

class Budapest extends CityBase {
  private districts: string[]
  private romanNumeralCodes = [
    ["","I","II","III","IV","V","VI","VII","VIII","IX"],
    ["","X","XX","XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"],
    ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM"]
  ]

  constructor(options: { districts: number[] }) {
    super()
    this.districts = Array
      .from(new Set(options.districts))
      .map(d => this.toRomanNumeral(d).toLowerCase())
  }

  getParam(): string {
    return this.districts.map(d => `${d}-ker`).join('+')
  }

  private toRomanNumeral(num: number): string {
    let numeral = ''
    const digits = num.toString().split('').reverse()
    for (let i=0; i < digits.length; i++) {
      numeral = this.romanNumeralCodes[i][parseInt(digits[i])] + numeral
    }
    return numeral
  }
}

const City = {
  Budapest,
  Plain
}

export default City
