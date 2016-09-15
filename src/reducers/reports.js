import {
  REPORTS_SET_TAB,
  SALESREPORT_FETCH_REQUEST,
  SALESREPORT_FETCH_SUCCESS,
  SALESREPORT_FETCH_FAILURE,
  STOREORDERS_SET_ACTIVE_ID,
  STOREORDERS_SET_PAGE,
  STOREORDERS_FETCH_REQUEST,
  STOREORDERS_FETCH_SUCCESS,
  STOREORDERS_FETCH_FAILURE,
  REPORTS_STATE_RESET
} from '../actions/reports'

function salesReport (state, action) {
  switch (action.type) {
    case SALESREPORT_FETCH_REQUEST:
      return Object.assign({}, state, {
        isLoading: true
      })
    case SALESREPORT_FETCH_SUCCESS:
      return Object.assign({}, state, {
        isLoading: false,
        productSales: action.productSales
      })
    case SALESREPORT_FETCH_FAILURE:
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
  activeTab: 'sales',
  salesReport: {
    isLoading: false,
    productSales: [],
    from: new Date(),
    to: new Date()
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
    case SALESREPORT_FETCH_REQUEST:
    case SALESREPORT_FETCH_SUCCESS:
    case SALESREPORT_FETCH_FAILURE:
      return Object.assign({}, state, {
        salesReport: salesReport(state.salesReport, action)
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
        salesReport: {
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
