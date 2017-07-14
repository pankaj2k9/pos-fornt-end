import React from 'react'

export default class StoresDropdown extends React.PureComponent {
  render () {
    const { storeIds, selectedStore, onChange, disabled } = this.props

    // Extract store id array
    const storeSrcList = storeIds.map((store) => {
      return {
        source: store.source,
        name: store.name
      }
    })

    return (
      <p className='control'>
        <span className='select'>
          <select
            disabled={!!disabled}
            value={selectedStore}
            onChange={onChange}>
            {storeSrcList.map((storeSrc) => {
              return (
                <option
                  value={storeSrc.source}
                  key={`store-src-${storeSrc.source}`}>
                  {storeSrc.name}
                </option>
              )
            })}
          </select>
        </span>
      </p>
    )
  }
}
