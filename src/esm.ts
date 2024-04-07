async function getModules () {
  return {
    'node-fetch': await import('node-fetch'),
    open: await import('open'),
    'puppeteer-real-browser': await import('puppeteer-real-browser')
  }
}

type ESModules = Awaited<ReturnType<typeof getModules>>

class ESM {
  private static _modules: ESModules

  static get modules () {
    if (!this._modules) {
      throw new Error('Load ES modules first using the load method')
    }

    return this._modules
  }

  static async load () {
    if (!this._modules) {
      this._modules = await getModules()
    }
  }
}

export default ESM;
