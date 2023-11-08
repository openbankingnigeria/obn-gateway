import { RolesMemberCardProps } from '@/types/webappTypes/appTypes'
import Image from 'next/image';
import React from 'react'

const RolesMemberCard = ({
  members,
  member,
  changeMembers
}: RolesMemberCardProps) => {
  const fullnameArr = member?.name?.split(' ');
  const firstname = fullnameArr[0];
  const lastname = fullnameArr[1];
  const AvartarAlt = `${firstname && firstname[0]}${lastname && lastname[0]}`;

  const handleRemove = () => {
    const newMembers = members?.filter(item => item?.id != member?.id);
    // @ts-ignore
    newMembers && changeMembers(newMembers);
  }

  return (
    <div className='w-full pb-[16px] border-b border-o-border flex items-center justify-between gap-[12px]'>
      <div className='w-full flex items-center gap-[12px]'>
        <div className='min-w-[40px] h-[40px] flex justify-center items-center bg-[#E6E7EB] text-o-text-medium3 text-f14 font-[500] rounded-full'>
          {AvartarAlt}
        </div>

        <div className='w-full flex flex-col gap-[2px]'>
          <h3 className='text-f14 font-[500] text-o-text-dark'>
            {member?.name}
          </h3>

          <div className='text-f12 text-o-text-muted2'>
            {member?.email}
          </div>
        </div>
      </div>

      {
        changeMembers &&
        <div 
          onClick={handleRemove}
          className='w-fit cursor-pointer'
        >
          <Image 
            src={'/icons/trash.svg'}
            alt='remove'
            width={20}
            height={20}
          />
        </div>
      }
    </div>
  )
}

export default RolesMemberCard