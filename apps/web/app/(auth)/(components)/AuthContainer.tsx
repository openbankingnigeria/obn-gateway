'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { ReactNode, useEffect, useRef, useState } from 'react'

const AuthContainer = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const containerRef = useRef(null);
  const [scrollbarPresent, setScrollbarPresent] = useState(false);

  const latestYear = new Date()?.getFullYear()

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      // @ts-ignore
      const isScrollbarPresent = container.scrollHeight > container.clientHeight;
      setScrollbarPresent(isScrollbarPresent);
    }
  }, [pathname]);

  return (
    <section className='max-w-full min-h-screen relative bg-white'>
        <div ref={containerRef} className='max-w-full ms:w-full flex h-full overflow-x-hidden bg-white overflow-y-auto flex-row justify-start items-start'>
          <section className='w-full ms:w-[55%] h-screen bg-white'>
            <div className='w-full h-full flex flex-col'>
              <div className='block px-[22px] ms:px-6 lg:px-8 w-[calc(100%-7px)] py-5 left-0 ms:py-8 ms:!pb-4 bg-white top-0 z-[70] absolute'>
                <Link
                  className='inline cursor-pointer'
                  href='/'
                >
                <Image 
                  src='/icons/aperta_logo.svg'
                  alt='logo'
                  loading='lazy'
                  width={78}
                  height={33}
                  className='object-contain'
                />
                </Link>
              </div>

              <main className='w-full h-auto flex flex-col items-center px-[22px] ms:px-6 lg:px-8 pt-[100px] ms:pt-[130px]'>
                <div className='w-full mid:w-[480px] ms:w-full lg:w-[480px] h-fit flex flex-col items-center'>
                  {children}
                </div>

                {/* <motion.div 
                  className='w-full mid:w-[480px] ms:w-full lg:w-[480px] h-fit flex flex-col items-center'
                  initial={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0, transition: { stiffness: 700, damping: 30, duration: 0.2 } }}
                >
                  {children}
                </motion.div> */}
              </main>
              
              <footer className='mt-auto text-f14 text-o-text-medium px-[22px] ms:px-6 lg:px-8 py-5 ms:py-8'>
                © Open Banking Nigeria {latestYear}
              </footer>
            </div>
          </section>

          <section className={`w-[45%] ${scrollbarPresent ? 'right-[7px]' : 'right-0'} hidden ms:flex z-[80] items-center justify-center absolute min-h-screen bg-[#000034]`}>
            <div className='w-full min-h-screen relative flex items-center justify-center'>
              <Image 
                src='/icons/aperta_pattern2.svg'
                alt='pattern'
                loading='lazy'
                fill
                className='object-cover absolute'
              />
            </div>
          </section>
        </div>
      </section>
  )
}

export default AuthContainer