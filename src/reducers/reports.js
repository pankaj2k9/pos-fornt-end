import moment from 'moment'

import {
  REPORTS_SET_TAB,
  REPORTS_SET_DATE,
  PRODUCTSALES_FETCH_REQUEST,
  PRODUCTSALES_FETCH_SUCCESS,
  PRODUCTSALES_FETCH_FAILURE,
  COMPLETESALES_FETCH_REQUEST,
  COMPLETESALES_FETCH_SUCCESS,
  COMPLETESALES_FETCH_FAILURE,
  COMPLETESALES_CH_SOURCE,
  STOREORDERS_SET_ACTIVE_ID,
  STOREORDERS_SET_PAGE,
  STOREORDERS_FETCH_REQUEST,
  STOREORDERS_FETCH_SUCCESS,
  STOREORDERS_FETCH_FAILURE,
  REPORTS_STATE_RESET,

  VIEW_BILLS_FETCH_REQUEST,
  VIEW_BILLS_FETCH_SUCCESS,
  VIEW_BILLS_FETCH_FAILURE,
  VIEW_BILLS_STORE_ORDERS,

  VIEW_BILLS_CH_DATEPICKER_FR,
  VIEW_BILLS_CH_DATEPICKER_TO,

  VIEW_BILLS_CH_INPUT_IDTO,
  VIEW_BILLS_CH_INPUT_IDFR,

  VIEW_BILLS_CH_TYPE,
  OUTLET_STOCKS_CH_SOURCE
} from '../actions/reports'

function outletStocks (state, action) {
  switch (action.type) {
    case OUTLET_STOCKS_CH_SOURCE:
      return Object.assign({}, state, {
        source: action.source
      })
    default:
      return state
  }
}

function viewBills (state, action) {
  switch (action.type) {
    case VIEW_BILLS_FETCH_REQUEST:
      return Object.assign({}, state, {
        orders: [],
        isProcessing: true
      })
    case VIEW_BILLS_FETCH_SUCCESS:
      return Object.assign({}, state, {
        isProcessing: false
      })
    case VIEW_BILLS_FETCH_FAILURE:
      return Object.assign({}, state, {
        isProcessing: false,
        error: action.error
      })
    case VIEW_BILLS_STORE_ORDERS:
      let orders = [...state.orders, ...action.response.data]

      return Object.assign({}, state, {
        orders
      })
    case VIEW_BILLS_CH_DATEPICKER_FR:
      return Object.assign({}, state, {
        from: action.date
      })
    case VIEW_BILLS_CH_DATEPICKER_TO:
      return Object.assign({}, state, {
        to: action.date
      })
    case VIEW_BILLS_CH_INPUT_IDTO:
      return Object.assign({}, state, {
        idTo: action.value
      })
    case VIEW_BILLS_CH_INPUT_IDFR:
      return Object.assign({}, state, {
        idFrom: action.value
      })
    case VIEW_BILLS_CH_TYPE:
      return Object.assign({}, state, {
        reportType: action.reportType
      })
    default:
      return state
  }
}

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
    case COMPLETESALES_CH_SOURCE:
      return Object.assign({}, state, {
        source: action.source
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
  date: new Date(),
  productSales: {
    isLoading: false,
    productSales: [],
    from: new Date(),
    to: new Date()
  },
  completeSales: {
    isLoading: false,
    completeSales: null,
    date: new Date(),
    source: undefined
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
  },
  viewBills: {
    isProcessing: false,
    error: undefined,
    orders: [],
    from: moment().startOf('day').toDate(), // set `from` to start of day
    to: new Date(),
    idFrom: undefined,
    idTo: undefined,
    reportType: 'date'
  },
  outletStocks: {
    source: undefined
  }
}, action) {
  switch (action.type) {
    case REPORTS_SET_TAB:
      return Object.assign({}, state, {
        activeTab: action.tab
      })
    case REPORTS_SET_DATE:
      return Object.assign({}, state, {
        date: action.date
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
    case COMPLETESALES_CH_SOURCE:
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
        date: new Date(),
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
    case VIEW_BILLS_FETCH_REQUEST:
    case VIEW_BILLS_FETCH_SUCCESS:
    case VIEW_BILLS_FETCH_FAILURE:
    case VIEW_BILLS_STORE_ORDERS:
    case VIEW_BILLS_CH_DATEPICKER_FR:
    case VIEW_BILLS_CH_DATEPICKER_TO:
    case VIEW_BILLS_CH_INPUT_IDTO:
    case VIEW_BILLS_CH_INPUT_IDFR:
    case VIEW_BILLS_CH_TYPE:
      return Object.assign({}, state, {
        viewBills: viewBills(state.viewBills, action)
      })
    case OUTLET_STOCKS_CH_SOURCE:
      return Object.assign({}, state, {
        outletStocks: outletStocks(state.outletStocks, action)
      })
    default:
      return state
  }
}

export default report
