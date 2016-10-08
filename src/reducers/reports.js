import {
  REPORTS_SET_TAB,
  PRODUCTSALES_FETCH_REQUEST,
  PRODUCTSALES_FETCH_SUCCESS,
  PRODUCTSALES_FETCH_FAILURE,
  COMPLETESALES_FETCH_REQUEST,
  COMPLETESALES_FETCH_SUCCESS,
  COMPLETESALES_FETCH_FAILURE,
  STOREORDERS_SET_ACTIVE_ID,
  STOREORDERS_SET_PAGE,
  STOREORDERS_FETCH_REQUEST,
  STOREORDERS_FETCH_SUCCESS,
  STOREORDERS_FETCH_FAILURE,
  REPORTS_STATE_RESET
} from '../actions/reports'

function productSales (state, action) {
  switch (action.type) {
    case PRODUCTSALES_FETCH_REQUEST:
      return Object.assign({}, state, {
        isLoading: true
      })
    case PRODUCTSALES_FETCH_SUCCESS:
      return Object.assign({}, state, {
        isLoading: false,
        productSales: action.productSales
      })
    case PRODUCTSALES_FETCH_FAILURE:
      return Object.assign({}, state, {
        isLoading: false,
        error: action.error
      })
    default:
      return state
  }
}

function completeSales (state, action) {
  switch (action.type) {
    case COMPLETESALES_FETCH_REQUEST:
      return Object.assign({}, state, {
        isLoading: true
      })
    case COMPLETESALES_FETCH_SUCCESS:
      return Object.assign({}, state, {
        isLoading: false,
        completeSales: action.completeSales,
        date: action.date || new Date()
      })
    case COMPLETESALES_FETCH_FAILURE:
      return Object.assign({}, state, {
        isLoading: false,
        error: action.error
      })
    default:
      return state
  }
}

function storeOrders (state, action) {
  switch (action.type) {
    case STOREORDERS_SET_ACTIVE_ID:
      return Object.assign({}, state, {
        activeOrderId: action.orderId,
        activeModal: action.orderId === null ? null : 'view'
      })
    case STOREORDERS_SET_PAGE:
      return Object.assign({}, state, {
        page: action.page
      })
    case STOREORDERS_FETCH_REQUEST:
      return Object.assign({}, state, {
        isLoading: true
      })
    case STOREORDERS_FETCH_SUCCESS:
      const { data, limit, skip, total } = action.response

      const byId = {}
      data.forEach(order => {
        byId[order.id] = order
      })

      return Object.assign({}, state, {
        isLoading: false,
        orderItems: data,
        byId,
        limit,
        skip,
        total
      })
    case STOREORDERS_FETCH_FAILURE:
      return Object.assign({}, state, {
        isLoading: false,
        error: action.error
      })
    default:
      return state
  }
}

function report (state = {
  activeTab: 'completeSales',
  productSales: {
    isLoading: false,
    productSales: [],
    from: new Date(),
    to: new Date()
  },
  completeSales: {
    isLoading: false,
    completeSales: null,
    date: new Date()
  },
  storeOrders: {
    isLoading: false,
    orderItems: [],
    byId: {},
    orderFromGet: null,
    error: false,
    orderSearchKey: '',
    activeOrderId: null,
    activeModal: null,
    page: 1,
    limit: 10,
    skip: 0,
    total: 0
  }
}, action) {
  switch (action.type) {
    case REPORTS_SET_TAB:
      return Object.assign({}, state, {
        activeTab: action.tab
      })
    case PRODUCTSALES_FETCH_REQUEST:
    case PRODUCTSALES_FETCH_SUCCESS:
    case PRODUCTSALES_FETCH_FAILURE:
      return Object.assign({}, state, {
        productSales: productSales(state.productSales, action)
      })
    case COMPLETESALES_FETCH_REQUEST:
    case COMPLETESALES_FETCH_SUCCESS:
    case COMPLETESALES_FETCH_FAILURE:
      return Object.assign({}, state, {
        completeSales: completeSales(state.completeSales, action)
      })
    case STOREORDERS_SET_ACTIVE_ID:
    case STOREORDERS_SET_PAGE:
    case STOREORDERS_FETCH_REQUEST:
    case STOREORDERS_FETCH_SUCCESS:
    case STOREORDERS_FETCH_FAILURE:
      return Object.assign({}, state, {
        storeOrders: storeOrders(state.storeOrders, action)
      })
    case REPORTS_STATE_RESET:
      return Object.assign({}, state, {
        storeOrders: {
          isLoading: false,
          orderItems: [],
          byId: {},
          orderFromGet: null,
          error: false,
          orderSearchKey: '',
          activeOrderId: null,
          activeModal: null,
          page: 1,
          limit: 10,
          skip: 0,
          total: 0
        },
        productSales: {
          isLoading: false,
          productSales: [],
          from: new Date(),
          to: new Date()
        }
      })
    default:
      return state
  }
}

export default report
