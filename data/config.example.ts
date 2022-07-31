import Config from '../src/interfaces/config.interface'
import Area from '../src/models/area.model'
import City from '../src/models/city.model'
import HouseType, { ApartmentSubtype } from '../src/models/house-type.model'
import OfferType from '../src/models/offer-type.model'
import Price from '../src/models/price.model'

const config: Config = {
  offerType: OfferType.KIADO,
  houseType: new HouseType.Apartment({
    subtypes: [
      ApartmentSubtype.PANEL,
      ApartmentSubtype.TEGLA
    ]
  }),
  city: [
    new City.Budapest({ districts: [11] }),
    new City.Plain('Gödöllő')
  ],
  price: new Price({ min: 100_000, max: 400_000 }),
  area: new Area({ min: 45 }),
  excludeWithoutImage: true
}

export default config
