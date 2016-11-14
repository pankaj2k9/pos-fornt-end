import React from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

class ExportSales extends React.Component {
  render () {
    return (
      <div className='tile is-ancestor'>
        <div className='tile is-vertical'>
          <div className='tile is-parent is-vertical'>
            <div className='tile is-child'>
              <button className='button is-primary'>
                <FormattedMessage id='app.button.exportToText' />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect()(ExportSales)
