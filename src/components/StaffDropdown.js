import React from 'react'
import { FormattedMessage } from 'react-intl'

export default class StaffsDropdown extends React.PureComponent {
  render () {
    const { staffs, selectedStaff, onChange } = this.props

    // Extract store id array
    const staffsList = staffs.map((staff) => {
      return {
        id: staff.id,
        name: staff.username
      }
    })

    return (
      <p className='control is-expanded'>
        <label className='label'>
          <FormattedMessage id='app.general.staffSales' />
        </label>

        <span className='select'>
          <select
            value={selectedStaff}
            onChange={onChange}>
            {staffsList.map((staff) => {
              return (
                <option
                  value={staff.id}
                  key={`staff-${staff.id}`}>
                  {staff.name}
                </option>
              )
            })}
          </select>
        </span>
      </p>
    )
  }
}
