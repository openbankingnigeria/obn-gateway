'use client'

import React, { useMemo } from 'react'
import { 
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable, 
} from '@tanstack/react-table'
import { TabelElmentProps } from '@/types/webappTypes/componentsTypes'
import { StatusBox, TablePagination } from '.'

const TableElement = ({
  headerData,
  rawData,
  filters,
  rows,
  page,
  actionColumn,
  totalElements,
  totalPages,
  thStyle,
  tdStyle
}: TabelElmentProps) => {
  const columnHelper = createColumnHelper<any>()
  
  const rawColumns = headerData?.map(item => {
    return (
      columnHelper.accessor(item?.accessor, {
        header: () => item?.header,
        cell: ({ column, cell, renderValue }) => {
          if(column.id === 'status') {
            return <StatusBox status={cell.getValue()} />
          } else {
            return renderValue();
          }
        }
      })
    );
  });

  const columns = useMemo(
    () => [
      ...rawColumns,
      actionColumn
    ],
    [...filters]
  );

  const data = useMemo(
    () =>
      rawData?.map((item) => {
        return { ... item }
      }),
    [rawData]
  );

  const tableInstance = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
    <div className='w-full flex flex-col gap-[20px]'>
      <div className="relative border overflow-y-hidden overflow-x-auto border-o-border rounded-[8px] w-full min-h-[150px]">
        <table className='min-w-fit w-full'>
          <thead>
            {getHeaderGroups().map(headerGroup => (
              <tr 
                key={headerGroup.id}
                className='h-[40px] w-full bg-o-bg2 py-[10px]'
              >
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className={`whitespace-nowrap min-w-[170px] text-left 
                    first-of-type:rounded-tl-[8px] last-of-type:rounded-tr-[8px] 
                    text-o-text-medium px-[16px] text-f12 font-[500] 
                    ${header.id == 'actions' && '!w-[45px] !min-w-[0]'}
                    ${header.id == 'status' && '!w-[100px] !min-w-[0]'}
                    ${thStyle}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {getRowModel().rows.map(row => (
              <tr 
                key={row.id}
                className='bg-white'
              >
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id}
                    className={`bg-white border-b border-o-border px-[24px] py-[18px] 
                    min-w-fit w-auto text-o-text-medium3 text-f14 ${tdStyle}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination 
        rows={rows}
        page={page}
        totalElements={totalElements}
        totalPages={totalPages}
      />
    </div>
  )
}

export default TableElement