import React from 'react'
import { EmailTemplateComponent } from './(emailTemplate)'
import { APIConfigurationProps } from '@/types/webappTypes/appTypes'

const EmailTemplatePage = ({ rawData }: APIConfigurationProps) => {
  return (
    <div className='w-full flex-col flex gap-[24px]'>
      {
        rawData?.map((template: any) => (
          <EmailTemplateComponent 
            key={template.id}
            rawData={template}
          />
        ))
      }
    </div>
  )
}

export default EmailTemplatePage