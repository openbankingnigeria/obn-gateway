'use client'

import { InputElement } from '@/components/forms'
import { deleteSearchParams, updateSearchParams } from '@/utils/searchParams';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

interface SearchBarProps {
  placeholder?: string
  search_query?: string
}

const SearchBar = ({
  placeholder,
  search_query,
}: SearchBarProps) => {

  const router = useRouter();
  const [search, setSearch] = useState(search_query);

  const handleChange = (value: string) => {
    if (value) {
      setSearch(value);
      const url = updateSearchParams('search_query', value);
      router.push(url);
    } else {
      setSearch(value);
      const url = deleteSearchParams('search_query');
      router.push(url)
    }
  };

  return (
    <div className='w-fit'>
      <InputElement 
        placeholder={placeholder || 'Search'}
        small
        type='search'
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
        containerStyle='!w-[305px]'
        value={search}
        changeValue={handleChange}
      />
    </div>
  )
}

export default SearchBar