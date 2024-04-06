import Area from 'models/area.model'
import { CityBase } from 'models/city.model'
import Furnished from 'models/furnished.model';
import { HouseTypeBase } from 'models/house-type.model'
import OfferType from 'models/offer-type.model'
import Price from 'models/price.model'

export default interface Config {
  city: CityBase | CityBase[]
  houseType: HouseTypeBase<any>
  offerType: OfferType
  furnished?: Furnished | Furnished[]
  price?: Price
  area?: Area
  excludeWithoutImage?: boolean
}
