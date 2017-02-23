import React from 'react'
import { FormattedMessage } from 'react-intl'

const ModalCard = (props) => {
  const {
    isActive,
    title,
    cancelAction,
    closeAction,
    confirmAction,
    footer,
    children
  } = props

  return (
    <div className={`modal is-active ${isActive}`}>
      <div className='modal-background' />
      <div className='modal-card'>
        <header className='modal-card-head'>
          <p className='modal-card-title has-text-centered'>
            {title
              ? <FormattedMessage id={title} />
              : ''
            }
          </p>
          <button className='delete' onClick={closeAction} />
        </header>
        <section className='modal-card-body'>
          {children}
        </section>
        {confirmAction || cancelAction
          ? <footer className='modal-card-foot is-paddingless'>
            <div className='columns is-multilines is-mobile is-fullwidth is-marginless' style={{width: '100%'}}>
              {cancelAction
                ? <div className='column'>
                  <a className='button is-large is-fullwidth is-danger'>
                    <FormattedMessage id='app.button.cancel' />
                  </a>
                </div>
                : null
              }
              {confirmAction
                ? <div className='column'>
                  <a className='button is-large is-fullwidth is-success'>
                    <FormattedMessage id='app.button.confirm' />
                  </a>
                </div>
                : null
              }
            </div>
          </footer>
          : null
        }
      </div>
    </div>
  )
}

export default ModalCard
