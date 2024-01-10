import { CodeSnippet, TransparentPanel } from '@/app/(webapp)/(components)'
import { ACTIVITY_DETAILS_PANEL } from '@/data/activityData'
import { ActivitySectionsProps } from '@/types/webappTypes/appTypes'
import React from 'react'

const ActivitySections = ({
  path,
  rawData
}: ActivitySectionsProps) => {

  const request = rawData?.request;
  const response = rawData?.response;

const rawCode = path == 'response' ?
  `{
    "response": {
      "headers": {
        "access-control-allow-credentials": "${response?.headers?.['access-control-allow-credentials']}",
        "access-control-allow-origin": "${response?.headers?.['access-control-allow-origin']}",
        "connection": "${response?.headers?.connection}",
        "content-length": "${response?.headers?.['content-length']}",
        "content-type": "${response?.headers?.['content-type']}",
        "date": "${response?.headers?.date}",
        "server": "${response?.headers?.server}",
        "via": "${response?.headers?.via}",
        "x-kong-proxy-latency": "${response?.headers?.['x-kong-proxy-latency']}",
        "x-kong-upstream-latency": "${response?.headers?.['x-kong-upstream-latency']}"
      },
      "size": ${response?.size},
      "status": ${response?.status}
    }
  }`
  :
  `{
    "request": {
      "headers": {
        "accept": "${request?.headers?.accept}",
        "accept-encoding": "${request?.headers?.['accept-encoding']}",
        "authorization": "${request?.headers?.authorization}",
        "cache-control": "${request?.headers?.['cache-control']}",
        "connection": "${request?.headers?.connection}",
        "host": "${request?.headers?.host}",
        "postman-token": "${request?.headers?.['postman-token']}",
        "request-id": "${request?.headers?.['request-id']}",
        "user-agent": "${request?.headers?.['user-agent']}",
        "x-consumer-custom-id": "${request?.headers?.['x-consumer-custom-id']}",
        "x-consumer-id": "${request?.headers?.['x-consumer-id']}",
        "x-credential-identifier": "${request?.headers?.['x-credential-identifier']}"
      },
      "method": "${request?.method}",
      "querystring": "${request?.querystring}",
      "size": ${request?.size},
      "uri": "${request?.uri}",
      "url": "${request?.url}"
    }
  }`;

const codeElement = path == 'response' ?
  `{
    <span style='color: #FB8F8F'>"response"</span>: {
      <span style='color: #FB8F8F'>"headers"</span>: {
        <span style='color: #FB8F8F'>"access-control-allow-credentials"</span>: <span style='color: #6CE9A6'>"${response?.headers?.['access-control-allow-credentials']}"</span>,
        <span style='color: #FB8F8F'>"access-control-allow-origin"</span>: <span style='color: #6CE9A6'>"${response?.headers?.['access-control-allow-origin']}"</span>,
        <span style='color: #FB8F8F'>"connection"</span>: <span style='color: #6CE9A6'>"${response?.headers?.connection}"</span>,
        <span style='color: #FB8F8F'>"content-length"</span>: <span style='color: #6CE9A6'>"${response?.headers?.['content-length']}"</span>,
        <span style='color: #FB8F8F'>"content-type"</span>: <span style='color: #6CE9A6'>"${response?.headers?.['content-type']}"</span>,
        <span style='color: #FB8F8F'>"date"</span>: <span style='color: #6CE9A6'>"${response?.headers?.date}"</span>,
        <span style='color: #FB8F8F'>"server"</span>: <span style='color: #6CE9A6'>"${response?.headers?.server}"</span>,
        <span style='color: #FB8F8F'>"via"</span>: <span style='color: #6CE9A6'>"${response?.headers?.via}"</span>,
        <span style='color: #FB8F8F'>"x-kong-proxy-latency"</span>: <span style='color: #6CE9A6'>"${response?.headers?.['x-kong-proxy-latency']}"</span>,
        <span style='color: #FB8F8F'>"x-kong-upstream-latency"</span>: <span style='color: #6CE9A6'>"${response?.headers?.['x-kong-upstream-latency']}"</span>
      },
      <span style='color: #FB8F8F'>"size"</span>: <span style='color: #6CE9A6'>"${response?.size}"</span>,
      <span style='color: #FB8F8F'>"status"</span>: <span style='color: #6CE9A6'>"${response?.status}"</span>
    }
  }`
  :
  `{
    <span style='color: #FB8F8F'>"request"</span>: {
      <span style='color: #FB8F8F'>"headers"</span>: {
        <span style='color: #FB8F8F'>"accept"</span>: <span style='color: #6CE9A6'>"${request?.headers?.accept}"</span>,
        <span style='color: #FB8F8F'>"accept-encoding"</span>: <span style='color: #6CE9A6'>"${request?.headers?.['accept-encoding']}"</span>,
        <span style='color: #FB8F8F'>"authorization"</span>: <span style='color: #6CE9A6'>"${request?.headers?.authorization}"</span>,
        <span style='color: #FB8F8F'>"cache-control"</span>: <span style='color: #6CE9A6'>"${request?.headers?.['cache-control']}"</span>,
        <span style='color: #FB8F8F'>"connection"</span>: <span style='color: #6CE9A6'>"${request?.headers?.connection}"</span>,
        <span style='color: #FB8F8F'>"host"</span>: <span style='color: #6CE9A6'>"${request?.headers?.host}"</span>,
        <span style='color: #FB8F8F'>"postman-token"</span>: <span style='color: #6CE9A6'>"${request?.headers?.['postman-token']}"</span>,
        <span style='color: #FB8F8F'>"request-id"</span>: <span style='color: #6CE9A6'>"${request?.headers?.['request-id']}"</span>,
        <span style='color: #FB8F8F'>"user-agent"</span>: <span style='color: #6CE9A6'>"${request?.headers?.['user-agent']}"</span>,
        <span style='color: #FB8F8F'>"x-consumer-custom-id"</span>: <span style='color: #6CE9A6'>"${request?.headers?.['x-consumer-custom-id']}"</span>,
        <span style='color: #FB8F8F'>"x-consumer-id"</span>: <span style='color: #6CE9A6'>"${request?.headers?.['x-consumer-id']}"</span>,
        <span style='color: #FB8F8F'>"x-credential-identifier"</span>: <span style='color: #6CE9A6'>"${request?.headers?.['x-credential-identifier']}"</span>
      },
      <span style='color: #FB8F8F'>"method"</span>: <span style='color: #6CE9A6'>"${request?.method}"</span>,
      <span style='color: #FB8F8F'>"querystring"</span>: {},
      <span style='color: #FB8F8F'>"size"</span>: <span style='color: #6CE9A6'>"${request?.size}"</span>,
      <span style='color: #FB8F8F'>"uri"</span>: <span style='color: #6CE9A6'>"${request?.uri}"</span>,
      <span style='color: #FB8F8F'>"url"</span>: <span style='color: #6CE9A6'>"${request?.url}"</span>
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