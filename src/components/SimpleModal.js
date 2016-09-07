import React from 'react'

const SimpleModal = ({
  // Main div class
  modalClass,

  // Modal title displayed on the modal header
  modalTitle,

  // Modal body component to be rendered between 'modal-card-body'
  modalBodyComponent,

  // Modal btn close class
  modalBtnCloseClass,

  // Will run when 'x' button is clicked
  modalCloseBtnOnClick,

  // Primary button label
  modalPrimaryBtnLabel,

  // Will run when `primary` button is clicked
  modalPrimaryBtnOnClick,

  // Primary button class
  modalPrimaryBtnClass,

  // Cancel button label
  modalCancelBtnLabel,

  // Cancel button class
  modalCancelBtnClass,

  // Will run when `cancel` button is clicked
  modalCancelBtnOnClick,

  // Will skip rendering the footer if true
  modalRenderFooter
}) => {
  return (
    <div className={modalClass}>
      <div className='modal-background'></div>
      <div className='modal-card'>
        <header className='modal-card-head'>
          <p className='modal-card-title'>{modalTitle}</p>
          <button className={modalBtnCloseClass} onClick={modalCloseBtnOnClick}>
          </button>
        </header>
        <section className='modal-card-body'>
          {modalBodyComponent}
        </section>

        {modalRenderFooter
          ? <footer className='modal-card-foot'>
            {modalPrimaryBtnLabel
              ? <a className={modalPrimaryBtnClass} onClick={modalPrimaryBtnOnClick}>
                {modalPrimaryBtnLabel}
              </a>
              : null
            }

            {modalCancelBtnLabel
              ? <a className={modalCancelBtnClass} onClick={modalCancelBtnOnClick}>
                {modalCancelBtnLabel}
              </a>
              : null
            }
          </footer>
          : null
        }
      </div>
    </div>
  )
}

export default SimpleModal
