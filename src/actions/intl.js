import { update } from 'react-intl-redux'
import enMessages from '../utils/i18n/en'
import zhMessages from '../utils/i18n/zh'

export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE'

export function changeLanguage (locale) {
  return function (dispatch) {
    locale = locale || 'en'
    let messages = enMessages
    switch (locale) {
      case 'en':
        messages = enMessages
        break

      case 'zh':
        messages = zhMessages
        break
    }

    dispatch(update({ locale, messages }))
  }
}
