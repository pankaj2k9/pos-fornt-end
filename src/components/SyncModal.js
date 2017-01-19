import React from 'react'
import {FormattedMessage} from 'react-intl'

const SyncModal = (props) => {
  const {
    failedOrders,
    offlineOrders,
    successOrders,
    isProcessing,
    syncSuccess,
    onSync,
    onClose
  } = props

  const noOfflineOrders = offlineOrders.length === 0
  const noFailedOrders = failedOrders.length === 0
  let noDataToSync

  if (noOfflineOrders && noFailedOrders) {
    noDataToSync = true
  } else {
    if (!noOfflineOrders) {
      if (!noOfflineOrders && noFailedOrders) { noDataToSync = false } else { noDataToSync = true }
    } else if (!noFailedOrders) {
      if (!noFailedOrders && noOfflineOrders) { noDataToSync = false } else { noDataToSync = true }
    }
  }

  return (
    <div className='modal is-active'>
      <div className='modal-background' />
      <div className='modal-card'>
        <header className='modal-card-head'>
          <p className='modal-card-title'>
            <FormattedMessage id='app.button.syncData' />
          </p>
          <button className='delete' onClick={onClose.bind(this)} />
        </header>
        <section className='modal-card-body'>
          <div className='box'>
            <article className='media'>
              <div className='media-left'>
                <span className='icon is-medium'>
                  <i className='fa fa-list-alt' />
                </span>
              </div>
              <div className='media-content'>
                <div className='content'>
                  <p>
                    <strong className='title'><FormattedMessage id='app.ph.offlineOrders' /></strong>
                    {noDataToSync
                      ? <span className=''>(<FormattedMessage id='app.ph.noDataToSync' />)</span>
                      : null
                    }
                  </p>
                  {noDataToSync
                    ? syncSuccess
                      ? <div className='notification is-success'><p className='title has-text-centered'><FormattedMessage id='app.ph.syncSuccess' /></p></div>
                      : null
                    : <div className='columns is-multiline is-mobile has-text-centered'>
                      <div className='column is-3'>
                        <div className='box'>
                          <a className='title button is-success is-outlined is-marginless'>{successOrders.length}</a>
                          <p className=''><FormattedMessage id='app.ph.syncSuccess' /></p>
                        </div>
                      </div>
                      <div className='column is-3'>
                        <div className='box'>
                          <a className='title button is-info is-outlined is-marginless'>{offlineOrders.length}</a>
                          <p className=''><FormattedMessage id='app.ph.notSynced' /></p>
                        </div>
                      </div>
                      <div className='column is-3'>
                        <div className='box'>
                          <a className='title button is-danger is-outlined is-marginless'>{failedOrders.length}</a>
                          <p className=''><FormattedMessage id='app.ph.syncFailed' /></p>
                        </div>
                      </div>
                      <div className='column is-3' style={{display: 'flex', alignItems: 'center'}}>
                        <div className='box'>
                          <i className={`fa fa-refresh ${isProcessing ? 'fa-spin fa-3x' : 'fa-2x'}`} style={{color: '#23d160'}} />
                          {isProcessing
                            ? <p className='is-marginless' style={{color: '#23d160'}}><FormattedMessage id='app.ph.syncing' /></p>
                            : <a className='is-marginless' style={{color: '#23d160'}} onClick={onSync.bind(this)}><FormattedMessage id='app.button.syncOrders' /></a>}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </article>
          </div>
        </section>
        <footer className='modal-card-foot' />
      </div>
    </div>
  )
}

export default SyncModal
