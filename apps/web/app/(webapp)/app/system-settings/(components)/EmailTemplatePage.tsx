import React from 'react'
import { NewMemberInviteOne, NewMemberInviteTwo } from './(emailTemplate)'

const EmailTemplatePage = () => {
  return (
    <div className='w-full flex-col flex gap-[24px]'>
      <NewMemberInviteOne />
      <NewMemberInviteTwo />
    </div>
  )
}

export default EmailTemplatePage