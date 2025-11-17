'use client';

import { Button } from '@/components/globalComponents';
import { SelectElement } from '@/components/forms';
import { updateSearchParams } from '@/utils/searchParams';
import { useRouter } from 'next/navigation';
import React, { useMemo, useCallback, useEffect } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemsInCurrentPage: number;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
  enableKeyboardNav?: boolean;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemsInCurrentPage,
  showPageNumbers = true,
  maxPageButtons = 5,
  enableKeyboardNav = true,
}: PaginationProps) => {
  const router = useRouter();

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const halfButtons = Math.floor(maxPageButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfButtons);
    let endPage = Math.min(totalPages, currentPage + halfButtons);
    
    if (currentPage - halfButtons < 1) {
      endPage = Math.min(totalPages, endPage + (halfButtons - currentPage + 1));
    }
    
    if (currentPage + halfButtons > totalPages) {
      startPage = Math.max(1, startPage - (currentPage + halfButtons - totalPages));
    }
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages, maxPageButtons]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      const url = updateSearchParams('page', `${page}`);
      router.push(url);
    }
  }, [currentPage, totalPages, router]);

  const handleRowsChange = useCallback((rows: string) => {
    const url = updateSearchParams('rows', rows);
    router.push(url);
  }, [router]);

  useEffect(() => {
    if (!enableKeyboardNav) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, handlePageChange, enableKeyboardNav]);

  const rowOptions = useMemo(() => [
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
  ], []);

  if (totalPages === 0) return null;

  return (
    <div className='w-full flex-wrap flex items-center justify-between gap-5'>
      <div className='text-o-text-darkest text-f14'>
        Showing {itemsInCurrentPage} of {totalItems} entries
      </div>

      <div className='w-fit gap-[10px] flex items-center'>
        <div className='gap-[8px] flex items-center text-o-text-darkest text-f14'>
          Rows per page
          <SelectElement
            name='rows'
            options={rowOptions}
            value={itemsPerPage.toString()}
            containerStyle='!w-fit cursor-pointer'
            small
            removeSearch
            optionStyle='!bottom-[40px]'
            forFilter
            changeValue={handleRowsChange}
          />
        </div>

        <div className='w-fit flex items-center gap-1'>
          <Button 
            outlined
            effect={() => handlePageChange(currentPage - 1)}
            small
            title='Previous'
            disabled={currentPage === 1}
            titleStyle='group-hover:text-[#274079]'
            containerStyle='!w-fit !rounded-[4px] transition-all'
          />

          {showPageNumbers && pageNumbers.map((page, index) => (
            page === '...' ? (
              <span 
                key={`ellipsis-${index}`} 
                className='px-2 text-o-text-darkest text-f14'
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                outlined={currentPage !== page}
                effect={() => handlePageChange(page as number)}
                small
                title={page.toString()}
                titleStyle={currentPage === page ? 'text-white' : 'group-hover:text-[#274079]'}
                containerStyle={`!w-[36px] !rounded-[4px] transition-all ${
                  currentPage === page ? '!bg-[#274079] !border-[#274079]' : ''
                }`}
              />
            )
          ))}

          <Button 
            outlined
            effect={() => handlePageChange(currentPage + 1)}
            small
            title='Next'
            disabled={currentPage === totalPages}
            titleStyle='group-hover:text-[#274079]'
            containerStyle='!w-fit !rounded-[4px] transition-all'
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
