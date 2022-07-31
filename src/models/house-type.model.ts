import BaseModel from 'models/base.model'

export abstract class HouseTypeBase<TSubtype> extends BaseModel {
  protected types: TSubtype[]
  protected abstract houseTypeStr: string

  constructor(options: { subtypes?: TSubtype[] } = {}) {
    super()
    this.types = Array.from(new Set(options.subtypes || []))
  }

  getParam(): string {
    const typesStr = this.types.join('+')
    if (typesStr) {
      return `${this.houseTypeStr}+${typesStr}`
    }

    return this.houseTypeStr
  }
}

export enum HouseSubtypes {
  CSALADIHAZ = 'csaladi-haz',
  IKERHAZ = 'ikerhaz',
  SORHAZ = 'sorhaz',
  HAZRESZ = 'hazresz',
  KASTELY = 'kastely',
  TANYA = 'tanya',
  KONNYUSZERKEZETES = 'konnyuszerkezetes',
  VALYOGHAZ = 'valyoghaz'
}

class House extends HouseTypeBase<HouseSubtypes> {
  houseTypeStr = 'haz'
}

export enum ApartmentSubtype {
  TEGLA = 'tegla-epitesu-lakas',
  PANEL = 'panel-lakas',
  SZOBA = 'szoba',
  CSUSZOZSALUS = 'csuszozsalus-lakas'
}

class Apartment extends HouseTypeBase<ApartmentSubtype> {
  houseTypeStr = 'lakas'
}

export enum GarageSubtype {
  ONALLO = 'onallo',
  TEREM = 'teremgarazs',
  BEALLO = 'beallo',
}

class Garage extends HouseTypeBase<GarageSubtype> {
  houseTypeStr = 'garazs'
}

const HouseType = {
  House,
  Apartment,
  Garage
}

export default HouseType
