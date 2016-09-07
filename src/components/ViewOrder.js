import React, { PropTypes } from 'react'
import DataList from './DataList'

export default class ViewOrder extends React.Component {
  static propTypes () {
    return {
      orderItemData: PropTypes.object.isRequired,
      locale: PropTypes.string.isRequired
    }
  }

  render () {
    const { orderItemData } = this.props

    return <DataList data={orderItemData} listName={'DATA_LIST_ORDERS'} />
  }
}
