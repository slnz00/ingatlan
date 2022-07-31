import BaseModel from 'models/base.model'

export default class Area extends BaseModel {
  min: number | null
  max: number | null

  constructor(options: { min?: number, max?: number } = {}) {
    super()

    this.min = options.min ?? null
    this.max = options.max ?? null
  }

  getParam(): string {
    if (this.min !== null && this.max === null) {
      return `${this.min}-m2-felett`
    }

    if (this.min === null && this.max !== null) {
      return `${this.max}-m2-alatt`
    }

    if (this.min !== null && this.max !== null) {
      return `${this.min}-${this.max}-m2`
    }

    return ''
  }
}