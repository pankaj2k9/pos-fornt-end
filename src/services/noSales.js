import api from './api'

const noSalesService = api.service('/no-sales')

const noSales = {
  find (query) {
    return noSalesService.find(query)
  }
}

export default noSales
