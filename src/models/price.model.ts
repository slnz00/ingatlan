import BaseModel from 'models/base.model'
import OfferType from 'models/offer-type.model'
import State from 'state'

export default class Price extends BaseModel {
  min: number | null
  max: number | null

  constructor(options: { min?: number, max?: number } = {}) {
    super()

    this.min = options.min ?? null
    this.max = options.max ?? null
  }

  getParam (): string {
    const { config } = State.instance

    if (config.offerType === OfferType.ELADO) {
      return this.getSaleParam()
    }

    return this.getRentalParam()
  }

  getRentalParam (): string {
    const toParam = (val: number) => val / 1000

    if (this.min !== null && this.max === null) {
      return `havi-${toParam(this.min)}-ezer-Ft-tol`
    }

    if (this.min === null && this.max !== null) {
      return `havi-${toParam(this.max)}-ezer-Ft-ig`
    }

    if (this.min !== null && this.max !== null) {
      return `havi-${toParam(this.min)}-${toParam(this.max)}-ezer-Ft`
    }

    return ''
  }

  getSaleParam (): string {
    const toParam = (val: number) => val / 1000000

    if (this.min !== null && this.max === null) {
      return `${toParam(this.min)}-mFt-tol`
    }

    if (this.min === null && this.max !== null) {
      return `${toParam(this.max)}-mFt-ig`
    }

    if (this.min !== null && this.max !== null) {
      return `${toParam(this.min)}-${toParam(this.max)}-mFt`
    }

    return ''
  }
}