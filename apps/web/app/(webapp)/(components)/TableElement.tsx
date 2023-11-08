'use client'

import React, { useMemo } from 'react'
import { 
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable, 
} from '@tanstack/react-table'
import { TabelElmentProps } from '@/types/webappTypes/componentsTypes'
import { ConfigurationBox, RequestMethodText, StatusBox, TablePagination, TierBox } from '.'
import { timestampFormatter } from '@/utils/timestampFormatter'
import BooleanBox from './BooleanBox'

const TableElement = ({
  tableHeaders,
  rawData,
  filters,
  rows,
  page,
  actionColumn,
  totalElements,
  totalElementsInPage,
  removePagination,
  totalPages,
  thStyle,
  tdStyle
}: TabelElmentProps) => {
  const columnHelper = createColumnHelper<any>()
  
  const rawColumns = tableHeaders?.map(item => {
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
    () => actionColumn ? [
      ...rawColumns,
      actionColumn
    ] : [ ...rawColumns ],
    [...filters, rawColumns]
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
            {getHeaderGroups().map((headerGroup, index) => (
              <tr 
                key={index}
                // key={headerGroup.id}
                className='h-[40px] w-full bg-o-bg2 py-[10px]'
              >
                {headerGroup.headers.map((header, index) => (
                  <th 
                    key={index}
                    // key={header.id}
                    className={`whitespace-nowrap min-w-[220px] w-fit max-w-[500px] text-left 
                    first-of-type:rounded-tl-[8px] last-of-type:rounded-tr-[8px] 
                    text-o-text-medium px-[16px] text-f12 font-[500] 
                    ${header.id == 'actions' && '!min-w-[60px] !max-w-0 !w-auto'}
                    ${header.id == 'status' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'velocity' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'amount' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'no_of_apis' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'configuration' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'request_method' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'configured' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'tier' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'description' && '!min-w-[406px] !max-w-0 !w-auto'}
                    ${header.id == 'two_fa' && '!min-w-[100px] !max-w-0 !w-auto'}
                    ${header.id == 'members' && '!min-w-[100px] !max-w-0 !w-auto'}
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
            {getRowModel().rows.map((row, index) => (
              <tr 
                // key={row.id}
                key={index}
                className='bg-white'
              >
                {row.getVisibleCells().map((cell, index) => (
                  <td 
                    // key={cell.id}
                    key={index}
                    className={`bg-white border-b border-o-border vertical-align-start px-[12px] py-[18px] 
                    text-o-text-medium3 text-f14 ${tdStyle}`}
                  >
                    {
                      cell.id?.includes('timestamp') ? 
                        timestampFormatter(cell.getValue()) :
                        cell.id?.includes('request_method') ?
                          <RequestMethodText 
                            method={cell.getValue()} 
                          /> :
                          (cell.id?.includes('configured') || cell.id?.includes('two_fa')) ?
                            <BooleanBox 
                              value={Boolean(cell.getValue())} 
                            />
                            :
                            cell.id?.includes('tier') ?
                              <TierBox 
                                value={cell.getValue()} 
                              />
                              :
                              cell.id?.includes('configuration') ? 
                                <ConfigurationBox 
                                  value={cell.getValue()}
                                  noOfApis={row.original?.no_of_apis}
                                /> :
                                flexRender(cell.column.columnDef.cell, cell.getContext())
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {
        !removePagination &&
        <TablePagination 
          rows={rows}
          page={page}
          totalElements={totalElements}
          totalElementsInPage={totalElementsInPage}
          totalPages={totalPages}
        />
      }
    </div>
  )
}

export default TableElement