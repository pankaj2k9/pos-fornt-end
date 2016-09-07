import React from 'react'

import { FormattedMessage } from 'react-intl'

const DetailsModal = (props) => {
  const {
    id,
    activeModalId,
    title,
    items,
    close
  } = props

  DetailsModal.defaultProps = {
    title: 'Details Modal',
    items: [{name: 'list name', desc: 'description'}]
  }

  const active = activeModalId === id ? 'is-active' : ''

  return (
    <div className={`modal ${active}`}>
      <div className='modal-background'></div>
      <div className='modal-card'>
        <header className='modal-card-head'>
          <p className='modal-card-title'>
            <FormattedMessage id={title} />
          </p>
          <button className='delete' onClick={close}></button>
        </header>
        <section className='modal-card-body'>
          <ul>
          {
            items.map(function (item, key) {
              return (
                <li key={key}>
                  <strong><FormattedMessage id={item.name} />: </strong>
                  {item.desc}
                </li>
              )
            }, this)
          }
          </ul>
        </section>
        <footer className='modal-card-foot'>
          <a className='button' onClick={close}>Close</a>
        </footer>
      </div>
    </div>
  )
}

export default DetailsModal
