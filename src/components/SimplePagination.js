import React from 'react'
import { FormattedMessage } from 'react-intl'

const SimplePagination = ({ total, limit, page, getClickPageAction, style }) => {
  const PAGINATION_LAST_PAGE = Math.ceil(total / limit)
  const PAGINATION_FIRST_PAGE = 1
  const CURRENT_PAGE = page
  const PAGINATION_MAIN_PAGES = []
  const PAGINATION_MAIN_PAGES_LIMIT = 3

  const START_PAGE = CURRENT_PAGE === 1 ? 1 : CURRENT_PAGE - 1
  for (let i = 0; i < PAGINATION_MAIN_PAGES_LIMIT; i++) {
    if (START_PAGE + i <= PAGINATION_LAST_PAGE) {
      PAGINATION_MAIN_PAGES.push(START_PAGE + i)
    } else if (START_PAGE - 1 > 0) {
      PAGINATION_MAIN_PAGES.unshift(START_PAGE - 1)
      break
    }
  }

  const prevBtnClass = 'pagination-previous'
  const nextBtnClass = 'pagination-next'

  const shouldShowEllipsisBefore = CURRENT_PAGE > PAGINATION_FIRST_PAGE + 2
  const shouldShowEllipsisAfter = CURRENT_PAGE < PAGINATION_LAST_PAGE - 2

  return (
    <nav className='pagination is-medium' style={style}>
      <a className={prevBtnClass}
        onClick={getClickPageAction.bind(null, CURRENT_PAGE - 1)}>
        <FormattedMessage id='app.general.previous' />
      </a>
      <a className={nextBtnClass}
        onClick={getClickPageAction.bind(null, CURRENT_PAGE + 1)}>
        <FormattedMessage id='app.general.nextPage' />
      </a>

      <ul className='pagination-list '>
        {CURRENT_PAGE - 1 > PAGINATION_FIRST_PAGE || PAGINATION_FIRST_PAGE !== 1
          ? <li>
            <a className='button'
              onClick={getClickPageAction.bind(null, PAGINATION_FIRST_PAGE)}>
              {PAGINATION_FIRST_PAGE}
            </a>
          </li> : null}

        {shouldShowEllipsisBefore ? <li><span>...</span></li> : null}

        {PAGINATION_MAIN_PAGES.map(THIS_PAGE =>
          <li key={`topups-table-page-${THIS_PAGE}`}>
            <a className={`button ${THIS_PAGE === CURRENT_PAGE ? 'is-primary' : null}`}
              onClick={THIS_PAGE === CURRENT_PAGE
                 ? null : getClickPageAction.bind(null, THIS_PAGE)}>
              {THIS_PAGE}
            </a>
          </li>
        )}

        {shouldShowEllipsisAfter ? <li><span>...</span></li> : null}

        {CURRENT_PAGE + 2 <= PAGINATION_LAST_PAGE && PAGINATION_LAST_PAGE !== 3
          ? <li>
            <a className='button'
              onClick={getClickPageAction.bind(null, PAGINATION_LAST_PAGE)}>
              {PAGINATION_LAST_PAGE}
            </a>
          </li> : null}
      </ul>
    </nav>
  )
}

export default SimplePagination
