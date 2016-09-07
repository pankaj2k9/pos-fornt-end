import React from 'react'

const Dropdown = (props) => {
  const {
    value,
    onChange,
    options,
    size
  } = props

  Dropdown.defaultProps = {
    size: 'is-small',
    value: 1,
    options: [1, 2, 3, 4]
  }

  return (
    <p className='control'>
      <span className={`select is-fullwidth ${size}`}>
        <select
          onChange={e => onChange(e.target.value)}
          value={value}
        >
          {
            options.map(function (option) {
              return (
                <option value={option} key={option}>
                  {option}
                </option>
              )
            }, this)
          }
        </select>
      </span>
    </p>
  )
}

export default Dropdown
