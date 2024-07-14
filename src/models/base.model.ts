import Config from 'interfaces/config.interface'

export default abstract class BaseModel {
  abstract getParam (config: Config): string
}
