import { DashboardMetricCardProps } from '@/types/webappTypes/appTypes'
import { addCommasToAmount } from '@/utils/addCommasToAmount'
import React from 'react'
import BarChart from './BarChart'
import moment from 'moment'

const DashboardMetricCard = ({
  title, 
  amount, 
  isGreen, 
  amountUnit,
  labels,
  data,
  containerStyle
}: DashboardMetricCardProps) => {
  return (
    <div className={`min-w-[235px] h-[250px] rounded-[8px] overflow-y-hidden border border-o-border bg-white p-[20px] flex flex-col ${containerStyle}`}>
      <div className='flex flex-col mb-[24px] gap-[4px]'>
        <h3 className='text-o-text-medium3 text-f12 fonr-[500] uppercase'>
          {title}
        </h3>

        <div className={`${isGreen ? 'text-o-dark-green' : 'text-[#182749]'} text-f18 font-[500]`}>
          {
            amountUnit ? 
            `${amount ? addCommasToAmount(amount) : '-'} ${amount ? amountUnit : ''}` :
            addCommasToAmount(amount)
          }
        </div>
      </div>

      <section className='relative w-full h-[120px] border-b border-o-border'>
        <BarChart 
          labels={labels}
          data={data}
        />
      </section>

      <div className='mt-[4px] w-full text-o-text-muted2 text-[10px] flex items-center justify-between gap-5'>
        <span>
          {labels[0]}
          {/* {moment(labels[0]).format('lll')} */}
        </span>

        <span>
          {labels[labels.length - 1]}
          {/* {moment(labels[labels.length - 1]).format('lll')} */}
        </span>
      </div>
    </div>
  )
}

export default DashboardMetricCard