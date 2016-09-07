import React from 'react'
import { injectIntl } from 'react-intl'

const SearchBar = (props) => {
  const {
    id,
    size,
    autoFocus,
    onChange,
    onSubmit,
    onFocus,
    placeholder,
    confirmButton,
    cancelButton,
    confirmEvent,
    cancelEvent,
    icon,
    intl
  } = props

  SearchBar.defaultProps = {
    id: undefined,
    autoFocus: false,
    placeholder: 'Search...',
    confirmButton: undefined,
    confirmEvent: undefined,
    cancelButton: undefined,
    cancelEvent: undefined,
    icon: 'fa fa-search',
    onSubmit: function (event) { event.preventDefault() }
  }

  return (
    <div>
      <form className='form' onSubmit={onSubmit} autoComplete='off'>
        <div className='control is-grouped'>
          <p className='control has-icon is-expanded'>
            {autoFocus
              ? <input
                autoFocus
                id={id}
                className={`input ${size}`}
                type='text'
                onChange={e => onChange(e.target.value)}
                placeholder={intl.formatMessage({ id: placeholder })} />
              : <input
                id={id}
                className={`input ${size}`}
                type='text'
                onChange={e => onChange(e.target.value)}
                onFocus={() => onFocus(id)}
                placeholder={intl.formatMessage({ id: placeholder })} />
            }
            <i className={icon}></i>
          </p>
          {confirmButton !== undefined
            ? <a className='button control is-success' onClick={confirmEvent}>
              {confirmButton}
            </a>
            : null
          }

          {cancelButton !== undefined
            ? <a className='button control is-danger' onClick={cancelEvent}>
              {cancelButton}
            </a>
            : null
          }
        </div>
      </form>
    </div>
  )
}

export default injectIntl(SearchBar)
