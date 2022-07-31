import { promises as fs } from 'fs'
import * as path from 'path'

export default class FSUtils {
  static async readFile(filePath: string, failOnError = false) {
    try {
      return await fs.readFile(path.normalize(filePath), 'utf8')
    } catch (error) {
      if (!failOnError) {
        return null
      }
      throw error
    }
  }

  static async writeFile(filePath: string, data: string | Buffer, failOnError = false) {
    try {
      return await fs.writeFile(path.normalize(filePath), data)
    } catch (error) {
      if (!failOnError) {
        console.error(error)
        return null
      }
      throw error
    }
  }
}
