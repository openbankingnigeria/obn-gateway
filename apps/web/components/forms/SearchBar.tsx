'use client'

import { InputElement } from '@/components/forms'
import { SearchBarProps } from '@/types/componentsTypes/forms';
import { deleteSearchParams, updateSearchParams } from '@/utils/searchParams';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks';

const SearchBar = ({
  placeholder,
  searchQuery,
  name,
  big,
  containerStyle
}: SearchBarProps) => {

  const router = useRouter();
  const [search, setSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(search, 500);

  // Effect to handle URL updates when debounced value changes
  useEffect(() => {
    // Only update if the debounced value is different from the initial searchQuery
    if (debouncedSearch !== searchQuery) {
      if (debouncedSearch) {
        const url = updateSearchParams((name || 'search_query'), debouncedSearch);
        router.push(url);
      } else {
        const url = deleteSearchParams((name || 'search_query'));
        router.push(url);
      }
    }
  }, [debouncedSearch, name, router, searchQuery]);

  const handleChange = (value: string) => {
    setSearch(value);
  };

  return (
    <div className='w-auto'>
      <InputElement 
        placeholder={placeholder || 'Search'}
        small={!big}
        type='search'
        autoComplete='nope'
        name='search'
        leftIcon={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M17.5 17.5L12.5001 12.5M14.1667 8.33333C14.1667 11.555 11.555 14.1667 8.33333 14.1667C5.11167 14.1667 2.5 11.555 2.5 8.33333C2.5 5.11167 5.11167 2.5 8.33333 2.5C11.555 2.5 14.1667 5.11167 14.1667 8.33333Z" 
              stroke="#818898" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill='transparent'
            />
          </svg>
        }
        containerStyle={`w-[305px] ${containerStyle}`}
        value={search}
        changeValue={handleChange}
      />
    </div>
  )
}

export default SearchBar