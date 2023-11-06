import { CodeSnippet, TransparentPanel } from '@/app/(webapp)/(components)'
import { ACTIVITY_DETAILS_PANEL } from '@/data/activityData'
import { ActivitySectionsProps } from '@/types/webappTypes/appTypes'
import React from 'react'

const ActivitySections = ({
  path,
  rawData
}: ActivitySectionsProps) => {

const rawCode = path == 'response' ?
`{
  "response": {
    "headers": {
      "Content-Type": "${rawData?.content_type}",
      "Date": "${rawData?.date}"
    },
    "payload": {
      "balance": "${rawData?.balance}",
      "currency": "${rawData?.currency}"
    },
  }
}` 
  :
`{
  "request": {
    "headers": {
      "Authorization": "${rawData?.authorization}",
      "Content-Type": "${rawData?.content_type}",
      "User-Agent": "${rawData?.user_agent}"
    },
    "payload": {
      "user_id": "${rawData?.user_id}",
      "action": "${rawData?.action}",
      "account_type": "${rawData?.account_type}"
    },
  }
}`;

const codeElement = path == 'response' ?
`{
  <span style='color: #FB8F8F'>"response"</span>: {
    <span style='color: #FB8F8F'>"headers"</span>: {
      <span style='color: #FB8F8F'>"Content-Type"</span>: <span style='color: #6CE9A6'>"${rawData?.content_type}"</span>,
      <span style='color: #FB8F8F'>"Date"</span>: <span style='color: #6CE9A6'>"${rawData?.date}"</span>
    },
    <span style='color: #FB8F8F'>"payload"</span>: {
      <span style='color: #FB8F8F'>"balance"</span>: <span style='color: #6CE9A6'>"${rawData?.balance}"</span>,
      <span style='color: #FB8F8F'>"currency"</span>: <span style='color: #6CE9A6'>"${rawData?.currency}"</span>
    },
  }
}` 
  :
`{
  <span style='color: #FB8F8F'>"request"</span>: {
    <span style='color: #FB8F8F'>"headers"</span>: {
      <span style='color: #FB8F8F'>"Authorization"</span>: <span style='color: #6CE9A6'>"${rawData?.authorization}"</span>,
      <span style='color: #FB8F8F'>"Content-Type"</span>: <span style='color: #6CE9A6'>"${rawData?.content_type}"</span>,
      <span style='color: #FB8F8F'>"User-Agent"</span>: <span style='color: #6CE9A6'>"${rawData?.user_agent}"</span>
    },
    <span style='color: #FB8F8F'>"payload"</span>: {
      <span style='color: #FB8F8F'>"user_id"</span>: <span style='color: #6CE9A6'>"${rawData?.user_id}"</span>,
      <span style='color: #FB8F8F'>"action"</span>: <span style='color: #6CE9A6'>"${rawData?.action}"</span>,
      <span style='color: #FB8F8F'>"account_type"</span>: <span style='color: #6CE9A6'>"${rawData?.account_type}"</span>
    },
  }
}`;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <TransparentPanel
        panel={ACTIVITY_DETAILS_PANEL}
        currentValue={path}
      />

      <div className='w-full flex flex-col h-fit'>
        <CodeSnippet 
          rawCode={rawCode} 
          codeElement={codeElement}
        />
      </div>
    </section>
  )
}

export default ActivitySections