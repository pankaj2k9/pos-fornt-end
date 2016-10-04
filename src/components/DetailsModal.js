import React from 'react'

import { FormattedMessage } from 'react-intl'

const DetailsModal = (props) => {
  const {
    id,
    activeModalId,
    title,
    items,
    close,
    onClick,
    hideDetails
  } = props

  DetailsModal.defaultProps = {
    title: 'Details Modal',
    items: [{name: 'list name', desc: 'description'}],
    hideDetails: false,
    onClick: function (event) { event.preventDefault() }
  }

  const active = activeModalId === id ? 'is-active' : ''

  return (
    <div className={`modal ${active}`}>
      <div className='modal-background' />
      <div className='modal-card'>
        <header className='modal-card-head'>
          <p className='modal-card-title'>
            <FormattedMessage id={title} />
          </p>
          <button className='delete' onClick={close} />
        </header>
        <section className='modal-card-body'>
          {!hideDetails
            ? <section>
              <div className='is-pulled-right'>
                <a className='button is-success' onClick={onClick}>
                  <FormattedMessage id={'app.general.updateOdbo'} />
                </a>
              </div>
              <ul style={{fontSize: 16}}>
                {
                  items.map(function (item, key) {
                    let listName = item.name === undefined
                      ? null
                      : <strong><FormattedMessage id={item.name} />: </strong>
                    return (
                      <li key={key}>
                        {listName}
                        {item.desc}
                      </li>
                    )
                  }, this)
                }
              </ul>
            </section>
            : <section>
              {props.children}
            </section>
          }
        </section>
        <footer className='modal-card-foot'>
          <a className='button' onClick={close}>Close</a>
        </footer>
      </div>
    </div>
  )
}

export default DetailsModal
