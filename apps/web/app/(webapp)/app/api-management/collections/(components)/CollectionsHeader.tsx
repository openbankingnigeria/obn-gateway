'use client'

import { AppRightModal } from '@/app/(webapp)/(components)'
import { Button } from '@/components/globalComponents'
import { SearchBar } from '@/components/forms'
import { CollectionsHeaderProps } from '@/types/webappTypes/componentsTypes'
import React, { useState } from 'react'
import ImportSpecModal from './ImportSpecModal'
import { getJsCookies } from '@/config/jsCookie'

const CollectionsHeader = ({
  searchQuery,
  collections,
  userType
}: CollectionsHeaderProps) => {
  const [openModal, setOpenModal] = useState(false)
  const environment = getJsCookies('environment')

  const closeModal = () => {
    setOpenModal(false)
  }

  const showImportButton = userType === 'api-provider'

  return (
    <>
      {
        openModal &&
          <AppRightModal
            title='Import API Specification'
            effect={closeModal}
            childrenStyle='relative !px-0'
          >
            <ImportSpecModal 
              close={closeModal}
              environment={environment || 'development'}
              collections={collections}
            />
          </AppRightModal>
      }

      <div className='w-full flex-wrap flex items-center justify-between gap-[12px]'>
        <SearchBar 
          placeholder='Search collections'
          searchQuery={searchQuery}
        />

        {
          showImportButton &&
          <Button 
            title='Import Spec'
            small
            effect={() => setOpenModal(true)}
            leftIcon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M10 4.16667V15.8333M4.16667 10H15.8333" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        }
      </div>
    </>
  )
}

export default CollectionsHeader
