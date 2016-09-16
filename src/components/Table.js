// Table.js
// Renders a bulma table.
//
// See the `propTypes` below for more information on how it's used.
import React, { PropTypes } from 'react'
import { FormattedDate, FormattedTime } from 'react-intl'

class Table extends React.Component {
  /**
   * Render row actions
   *
   * @return - rendered row <td><a><i> for as actions
   */
  _renderRowActions (row, columnKey) { // row = array of objects of rowItems
    const itemKey = `row-action-td-${columnKey}-${row.id}` // the idividual keys of the array: id, title, dateCreated, actions from  row
    return (
      <td className='is-icon' key={itemKey}>
        {row[columnKey].map(action => {
          const iconKey = `a-${action.label}-${row.id}`
          let icon

          switch (action.label) {
            case 'view':
              icon = <i
                onClick={action.onClick.bind(this, row.id)}
                className='fa fa-eye fa-2'
                key={`icon-${iconKey}-view`} />
              break
            case 'edit':
              icon = <i
                onClick={action.onClick.bind(this, row.id)}
                className='fa fa-pencil-square-o fa-2'
                key={`icon-${iconKey}-edit`} />
              break
            case 'remove':
              icon = <i
                onClick={action.onClick.bind(this, row.id)}
                className='fa fa-trash-o fa-2'
                key={`icon-${iconKey}-remove`} />
              break
          }
          return (
            <a href='#' key={iconKey}>
              {icon}
            </a>
          )
        })}
      </td>
    )
  }

  /**
   * Render row cells
   *
   * @return - rendered row <td>. Certain row items may need specific manipulations on
   *           their values, thus the switch statement.
   */
  _renderRowCells (row, columnKey, showIdColumn) {
    const cellKey = `row-cell-td-${columnKey}-${row.id}`
    let rowItem

    switch (row[columnKey].type) {
      case 'string':
        rowItem = row[columnKey].value
        break
      case 'date':
        const dateValue = row[columnKey].value
        rowItem = (
          <span>
            <FormattedDate value={dateValue} /> <FormattedTime value={dateValue} />
          </span>
        )
        break
      case 'id':
      default:
        if (showIdColumn) {
          rowItem = row[columnKey]
        }
        break
    }

    return (
      <td key={cellKey}>
        {rowItem}
      </td>
    )
  }

  /**
   * Render row items, renders rowActions and rowCells
   *
   * @return - render a collection of <td>s to be rendered within a <tr> in _renderBody
   */
  _renderRow (row, showIdColumn) { // row = array of objects of rowItems
    return (
      //  the idividual keys of the array: id, title, dateCreated, actions from  row
      Object.keys(row).map(columnKey => {
        return (() => {
          switch (columnKey) {
            case 'actions':
              return this._renderRowActions(row, columnKey)
            default:
              return this._renderRowCells(row, columnKey, showIdColumn)
          }
        })()
      })
    )
  }

  /**
   * Render table rows
   * Used directly in the render() function
   *
   * @return - rendered row <tr><th>headers</th></tr>
   */
  _renderBody () {
    const { tableName, rowItems, showIdColumn, onClickRow } = this.props

    return (
      rowItems.map((row, index) => {
        const rowKey = `row-item-${tableName}-${row.id}-${index}`

        return (
          <tr key={rowKey} onClick={onClickRow ? onClickRow.bind(null, row.id) : null}>
            {this._renderRow(row, showIdColumn)}
          </tr>
        )
      })
    )
  }

  /**
   * Render table headers based on columnHeaders prop
   * Used directly in the render() function
   *
   * @return - rendered row <tr><th>headers</th></tr>
   */
  _renderHeaders () {
    const { tableName, columnHeaders } = this.props
    return (
      <tr>
        {columnHeaders.map((header, index) => {
          const headerName = `table-header-${tableName}-${index}`
          return (
            <th key={headerName}>{header}</th>
          )
        })}
      </tr>
    )
  }

  /*
   * The render where everything starts
   */
  render () {
    const { rowItems, style } = this.props

    return (rowItems.length > 0
      ? <div>
        <div className='is-hidden-mobile'>
          <table className='table is-bordered is-unselectable' style={style}>
            <thead>
              {this._renderHeaders()}
            </thead>

            <tbody>
              {this._renderBody()}
            </tbody>
          </table>
        </div>

        <div className='is-hidden-tablet' style={{ minWidth: 280, overflow: 'auto' }}>
          <table className='table is-bordered is-unselectable' style={style}>
            <thead>
              {this._renderHeaders()}
            </thead>

            <tbody>
              {this._renderBody()}
            </tbody>
          </table>
        </div>
      </div>
      : <div>no data</div>
    )
  }
}

Table.defaultProps = {
  locale: 'en',
  showIdColumn: true
}

Table.propTypes = {
  // `locale` is used in rowItems to determine which language should be displayed.
  //
  // One example is dateToLocalMYD which takes a (new Date()).toISOString values
  // and converts to the proper Month-Day-Year date value based on locale.
  // Other data may have an en/zh values as well.
  //
  // Default value is 'en'
  locale: PropTypes.string,

  // `tableName` is used to generating `key` values to mapped parts of the table
  tableName: PropTypes.string.isRequired,

  // `columnHeaders` an array of strings that will be used as table headers
  columnHeaders: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.element)
  ]).isRequired,

  // `rowItems` is an object with special properties:
  //
  //    `id`: id of the row item, also used to generate `key` like `tableName`
  //    `actions`: an array with values 'view', 'edit', 'remove'
  //
  //    other props of `rowItems` will be an array of typeobjects:
  //      {
  //        // value to render
  //        value: '',
  //
  //        // determine how the cell should be rendered
  //        // current values: 'string', 'date'
  //        type: '',
  //      }
  rowItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      actions: PropTypes.arrayOf(PropTypes.string),
      // other props, as described above
      otherProps: PropTypes.shape({
        value: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
      })
    })
  ),

  // `showIdColumn` if true, will show the ID row, default is true
  showIdColumn: PropTypes.bool,

  // `style` an array or object of react style/s
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.object)
  ]),

  // `onClickRow` is the callback that runs on row click
  onClickRow: PropTypes.func
}

export default Table
