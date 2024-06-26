'use client'

import { SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents';
import { TablePaginationProps } from '@/types/webappTypes/componentsTypes';
import { updateSearchParams } from '@/utils/searchParams';
import { useRouter } from 'next/navigation';
import React from 'react'

const TablePagination = ({
  rows, 
  page, 
  totalElements,
  totalElementsInPage,
  totalPages
}: TablePaginationProps) => {
  const router = useRouter();

  const row_list = [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
  ];
  
  const handleNext = () => {
    if (page !== totalPages) {
      const url = updateSearchParams('page', `${page + 1}`);
      router.push(url);
    }
  };

  const handlePrevious = () => {
    if (page != 1) {
      const url = updateSearchParams('page', `${page - 1}`);
      router.push(url);
    }
  };

  return (
    <div className='w-full flex-wrap flex items-center justify-between gap-5'>
        <div className='text-o-text-darkest text-f14'>
          Showing {totalElementsInPage} of {totalElements} entries
        </div>

        <div className='w-fi gap-[10px] flex items-center'>
          <div className='gap-[8px] flex items-center text-o-text-darkest text-f14'>
            Rows per page

            <SelectElement
              name='rows'
              options={row_list}
              value={rows?.toString()}
              containerStyle='!w-fit cursor-pointer'
              small
              removeSearch
              optionStyle='!bottom-[40px]'
              forFilter
            />
          </div>

          <div className='w-fit flex items-center'>
            <Button 
              outlined
              effect={handlePrevious}
              small
              title='Previous'
              titleStyle='group-hover:text-[#274079]'
              containerStyle='!w-fit !rounded-tl-[4px] !rounded-bl-[4px] !rounded-[0]'
            />
            <Button 
              outlined
              effect={handleNext}
              small
              title='Next'
              titleStyle='group-hover:text-[#274079]'
              containerStyle='!w-fit !rounded-tr-[4px] !rounded-br-[4px] !rounded-[0]'
            />
          </div>
        </div>
      </div>
  )
}

export default TablePagination