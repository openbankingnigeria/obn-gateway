'use client'

import { InputElement, SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { IoTrashOutline } from 'react-icons/io5'

export interface HeaderMapping {
  id: number
  from: string
  to: string
  operation: 'add' | 'remove' | 'rename' | 'replace'
  value?: string
}

interface HeaderMappingBuilderProps {
  mappings: HeaderMapping[]
  onMappingsChange: (mappings: HeaderMapping[]) => void
  direction?: 'request' | 'response'
  disabled?: boolean
  fieldLabel?: string
}

export const HeaderMappingBuilder = ({
  mappings,
  onMappingsChange,
  direction = 'request',
  disabled = false,
  fieldLabel = 'Header',
}: HeaderMappingBuilderProps) => {
  const handleAdd = () => {
    onMappingsChange([
      ...mappings,
      {
        id: mappings.length > 0 ? Math.max(...mappings.map((m) => m.id)) + 1 : 1,
        from: '',
        to: '',
        operation: 'add',
      },
    ])
  }

  const handleRemove = (id: number) => {
    onMappingsChange(mappings.filter((m) => m.id !== id))
  }

  const handleChange = (id: number, field: string, value: any) => {
    onMappingsChange(
      mappings.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  return (
    <div className='flex flex-col gap-[12px]'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-[6px]'>
          <h4 className='text-f14 font-[600] text-o-text-dark'>
            {direction === 'request' ? 'Request' : 'Response'} {fieldLabel} Transformations
          </h4>
          <p className='text-f12 text-o-text-medium3'>
            Transform {fieldLabel.toLowerCase()} between gateway and backend API. Use add/remove/rename/replace operations.
          </p>
        </div>
        <Button
          title='Add Mapping'
          effect={handleAdd}
          small
          outlined
          disabled={disabled}
        />
      </div>

      <div className='flex flex-col gap-[8px]'>
        {mappings.map((mapping) => (
          <div
            key={mapping.id}
            className='flex items-end gap-[8px] p-[12px] bg-white rounded-[6px] border border-o-border'
          >
            <div className='w-[120px]'>
              <SelectElement
                name={`operation-${mapping.id}`}
                label='Operation'
                value={mapping.operation}
                changeValue={(v) => handleChange(mapping.id, 'operation', v)}
                options={[
                  { value: 'add', label: 'Add' },
                  { value: 'remove', label: 'Remove' },
                  { value: 'rename', label: 'Rename' },
                  { value: 'replace', label: 'Replace' },
                ]}
                disabled={disabled}
              />
            </div>

            <div className='flex-1'>
              <InputElement
                name={`from-${mapping.id}`}
                label={
                  mapping.operation === 'add' ? `${fieldLabel} Name` : `From ${fieldLabel}`
                }
                value={mapping.from}
                changeValue={(v: any) => handleChange(mapping.id, 'from', v)}
                placeholder={
                  mapping.operation === 'add'
                    ? fieldLabel === 'Header'
                      ? 'X-Custom-Header'
                      : fieldLabel === 'Querystring'
                      ? 'limit'
                      : 'data.id'
                    : fieldLabel === 'Header'
                    ? 'X-Original-Header'
                    : fieldLabel === 'Querystring'
                    ? 'page'
                    : 'user.name'
                }
                disabled={disabled}
              />
            </div>

            {(mapping.operation === 'rename' || mapping.operation === 'replace') && (
              <div className='flex-1'>
                <InputElement
                  name={`to-${mapping.id}`}
                  label={`To ${fieldLabel}`}
                  value={mapping.to}
                  changeValue={(v: any) => handleChange(mapping.id, 'to', v)}
                  placeholder={
                    fieldLabel === 'Header' ? 'X-New-Header' : fieldLabel === 'Querystring' ? 'page' : 'user.id'
                  }
                  disabled={disabled}
                />
              </div>
            )}

            {(mapping.operation === 'add' || mapping.operation === 'replace') && (
              <div className='flex-1'>
                <InputElement
                  name={`value-${mapping.id}`}
                  label='Value'
                  value={mapping.value || ''}
                  changeValue={(v: any) => handleChange(mapping.id, 'value', v)}
                  placeholder={ fieldLabel === 'Header' ? 'header-value' : 'value' }
                  disabled={disabled}
                />
              </div>
            )}

            <button
              onClick={() => handleRemove(mapping.id)}
              disabled={disabled}
              className='w-[40px] h-[40px] mb-[2px] flex items-center justify-center rounded-[6px] border border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <IoTrashOutline size={18} />
            </button>
          </div>
        ))}

        {mappings.length === 0 && (
          <div className='p-[20px] bg-o-bg-disabled rounded-[6px] border border-o-border text-center'>
            <p className='text-f12 text-o-text-medium3'>
              No {fieldLabel.toLowerCase()} transformations configured. Click &quot;Add Mapping&quot; to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
