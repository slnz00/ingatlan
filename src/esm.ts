type ESModulesGetter<TModules extends object> = () => Promise<TModules>

class ESM <TModules extends object> {
  private _modules: TModules
  private readonly getModules: ESModulesGetter<TModules>

  constructor (getModules: ESModulesGetter<TModules>) {
    this.getModules = getModules
  }

  get modules () {
    if (!this._modules) {
      throw new Error('Load ES modules first using the load method')
    }

    return this._modules
  }

  async load () {
    if (!this._modules) {
      this._modules = await this.getModules()
    }
  }
}

export default new ESM(async () => ({
  open: await import('open'),
  'puppeteer-real-browser': await import('puppeteer-real-browser')
}));
