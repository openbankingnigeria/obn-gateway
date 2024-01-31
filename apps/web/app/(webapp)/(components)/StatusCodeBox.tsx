import React from 'react'

interface StatusBoxProps {
  status: number
}

const StatusCodeBox = ({ status }: StatusBoxProps) => {
  return (
    status == 100 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        Continue
      </span>
    ) 
    : status == 101 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        Switching Protocols
      </span>
    ) 
    : status == 102 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        Processing
      </span>
    ) 
    : status === 103 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        Early Hints
      </span>
    )
    : status === 200 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Ok
      </span>
    )
    : status === 201 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Created
      </span>
    )
    : status === 202 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Accepted
      </span>
    )
    : status === 203 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Non-Authoritative Information
      </span>
    )
    : status === 204 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        No Content
      </span>
    )
    : status === 205 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Reset Content
      </span>
    )
    : status === 206 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Partial Content
      </span>
    )
    : status === 207 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Multi-Status
      </span>
    )
    : status === 208 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Already Reported
      </span>
    )
    : status === 226 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        IM Used
      </span>
    )
    : status === 300 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Multiple Choice
      </span>
    )
    : status === 301 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Moved Permanently
      </span>
    )
    : status === 302 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Found
      </span>
    )
    : status === 303 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        See Other
      </span>
    )
    : status === 304 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Not Modified
      </span>
    )
    : status === 305 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Use Proxy
      </span>
    )
    : status === 306 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Unused
      </span>
    )
    : status === 307 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Temporary Redirect
      </span>
    )
    : status === 308 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Permanent Redirect
      </span>
    )
    : status === 400 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Bad Request
      </span>
    )
    : status === 401 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Unauthorized
      </span>
    )
    : status === 402 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Payment Required
      </span>
    )
    : status === 403 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Forbidden
      </span>
    )
    : status === 404 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Not Found
      </span>
    )
    : status === 405 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Method Not Allowed
      </span>
    )
    : status === 406 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Not Acceptable
      </span>
    )
    : status === 407 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Proxy Authentication Required
      </span>
    )
    : status === 408 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Request Timeout
      </span>
    )
    : status === 409 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Conflict
      </span>
    )
    : status === 410 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Gone
      </span>
    )
    : status === 411 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Length Required
      </span>
    )
    : status === 412 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Precondition Failed
      </span>
    )
    : status === 413 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Payload Too Large
      </span>
    )
    : status === 414 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        URI Too Long
      </span>
    )
    : status === 415 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Unsupported Media Type
      </span>
    )
    : status === 416 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Range Not Satisfiable
      </span>
    )
    : status === 417 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Expectation Failed
      </span>
    )
    : status === 418 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        I&#39;m a teapot
      </span>
    )
    : status === 421 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Misdirect Request
      </span>
    )
    : status === 422 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Unprocessable Content
      </span>
    )
    : status === 423 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Locked
      </span>
    )
    : status === 424 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Failed Dependency
      </span>
    )
    : status === 425 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Too Early
      </span>
    )
    : status === 426 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Upgrade Required
      </span>
    )
    : status === 428 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Precondition Required
      </span>
    )
    : status === 429 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Too Many Requests
      </span>
    )
    : status === 431 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Request Header Fields Too Large
      </span>
    )
    : status === 451 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Unavailable For Legal Reasons
      </span>
    )
    : status === 500 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Internal Server Error
      </span>
    )
    : status === 501 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Not Implemented
      </span>
    )
    : status === 502 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Bad Gateway
      </span>
    )
    : status === 503 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Service Unavailable
      </span>
    )
    : status === 504 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Gateway Timeout
      </span>
    )
    : status === 505 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        HTTP Version Not Supported
      </span>
    )
    : status === 506 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Variant Also Negotiates
      </span>
    )
    : status === 507 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Insufficient Storage
      </span>
    )
    : status === 508 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Loop Detected
      </span>
    )
    : status === 510 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Not Extended
      </span>
    )
    : status === 511 ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Network Authentication Required
      </span>
    )
    : <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        {status}
      </span>
  )
}

export default StatusCodeBox