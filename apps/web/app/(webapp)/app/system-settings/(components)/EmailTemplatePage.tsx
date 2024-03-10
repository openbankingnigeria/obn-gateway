import React from 'react'
import { EmailTemplateComponent } from './(emailTemplate)'
import { APIConfigurationProps } from '@/types/webappTypes/appTypes'

const EmailTemplatePage = ({ rawData, profileData }: APIConfigurationProps) => {
  return (
    <div className='w-full flex-col flex gap-[24px]'>
      {
        rawData?.map((template: any) => (
          <EmailTemplateComponent 
            key={template.id}
            rawData={template}
            profileData={profileData}
          />
        ))
      }
    </div>
  )
}

export default EmailTemplatePage