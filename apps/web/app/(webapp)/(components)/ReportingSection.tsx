'use client'

import { DatePicker } from '@/app/(webapp)/(components)';
import { SelectElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import React, { useEffect, useState } from 'react'
import * as API from '@/config/endpoints';
import { searchParamsProps } from '@/types/webappTypes/appTypes';
import { REPORTING_DATA } from '@/data/dashboardData';
import { DashboardMetricCard } from '../app/home/dashboard/(components)';
import moment from 'moment';

const ReportingSection = ({ alt_data, profile_data }: searchParamsProps) => {
  const [from, setFrom] = useState<string | undefined>('');
  const [to, setTo] = useState<string | undefined>('');
  const [consumers, setConsumers] = useState<string[]>([]);
  const [collection, setCollection] = useState('');
  const [api, setApi] = useState('');
  const [loading, setLoading] = useState(false);

  const [apis, setApis] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [consumersList, setConsumerList] = useState<any[]>([]);
  const [logStats, setLogStats] = useState<any>(null);
  const environment = 'development';
  const apiConsumer = profile_data?.user?.role?.parent?.slug == 'api-consumer';

  // console.log('Company details >>>>>>', alt_data);

  const fetchConsumers = async () => {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanies({
        page: `1`,
        limit: `10000`
      }),
      method: 'GET',
      data: null,
      noToast: true
    })
    setConsumerList(result?.data);
  }

  const fetchCollections = async () => {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCollections(),
      method: 'GET',
      data: null,
      noToast: true
    })
    setCollections(result?.data);
  }

  const fetchAPIs = async () => {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPIsForCompany({environment}),
      method: 'GET',
      data: null,
      noToast: true
    })
    setApis(result?.data);
  }

  const fetchCollectionAPIs = async () => {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPIs({
        page: `1`,
        limit: `1000`,
        collectionId: collection,
        environment,
      }),
      method: 'GET',
      data: null,
      noToast: true
    })
    setApis(result?.data);
  }

  useEffect(() => {
    if (apiConsumer) {
      fetchAPIs();
    } else {
      fetchConsumers();
      fetchCollections();
      collection && fetchCollectionAPIs();
    }
  }, [collection]);

  const allObject = [{ label: 'All', value: ''}]

  const apis_list = apis?.map((data: any) => {
    return({
      ...data,
      label: data?.name,
      value: data?.id
    });
  });

  const collections_list = collections?.map((data: any) => {
    return({
      ...data,
      label: data?.name,
      value: data?.id
    });
  });

  const consumers_list = consumersList?.map((data: any) => {
    return({
      ...data,
      label: data?.name,
      value: data?.id
    });
  })

  const handleClearAll = () => {
    setApi('')
    setFrom(undefined)
    setTo(undefined)
    setConsumers([])
    setApi('');
    setCollection('');
  };

  const incorrect = (
    (apiConsumer ? true : Boolean(collection && !api))
  );

  // console.log(api, from, to, consumers, collection);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
      setLoading(true);
      const result: any = await clientAxiosRequest({
          headers: {},
          apiEndpoint: API.getAPILogStats({
            page: '1',
            limit: '10000',
            environment, 
            companyId: apiConsumer ? alt_data?.id : consumers,
            apiId: api,
            createdAt_gt: from ? moment(from).startOf('day').format()?.split('+')[0] + '.000Z' : '',
            createdAt_l: to ? moment(to).endOf('day').format()?.split('+')[0] + '.000Z' : '',
          }),
          method: 'GET',
          data: {}
        });

      if (result?.message) {
        setLoading(false);
        setLogStats(result?.data);
      }
  }

  return (
    <div className='w-full flex flex-col gap-[20px]'>
      <section className='w-full flex flex-col'>
        <form 
          onSubmit={handleSubmit}
          className='p-[20px] w-full flex flex-col gap-[24px] rounded-[8px] border border-o-border bg-white'
        >
          <div className='w-full flex flex-col gap-[16px]'>
            <div className='w-full flex items-center gap-[16px]'>
              <DatePicker 
                containerStyle={'!w-full'}
                name={'from'}
                changeValue={setFrom}
                label='From'
                fieldStyle='!px-[14px] !w-full justify-between !py-[12px]'
                popoverDirection='down'
                placeholder='YYYY-MM-DD'
                toggleStyle='!mt-[35px]'
                clearField={from === undefined}
                asSingle
                rightIcon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M17.5 8.33268H2.5M13.3333 1.66602V4.99935M6.66667 1.66602V4.99935M6.5 18.3327H13.5C14.9001 18.3327 15.6002 18.3327 16.135 18.0602C16.6054 17.8205 16.9878 17.4381 17.2275 16.9677C17.5 16.4329 17.5 15.7328 17.5 14.3327V7.33268C17.5 5.93255 17.5 5.23249 17.2275 4.69771C16.9878 4.2273 16.6054 3.84485 16.135 3.60517C15.6002 3.33268 14.9001 3.33268 13.5 3.33268H6.5C5.09987 3.33268 4.3998 3.33268 3.86502 3.60517C3.39462 3.84485 3.01217 4.2273 2.77248 4.69771C2.5 5.23249 2.5 5.93255 2.5 7.33268V14.3327C2.5 15.7328 2.5 16.4329 2.77248 16.9677C3.01217 17.4381 3.39462 17.8205 3.86502 18.0602C4.3998 18.3327 5.09987 18.3327 6.5 18.3327Z" 
                      stroke="#818898" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      fill='transparent' 
                    />
                  </svg>
                }
              /> 

              <DatePicker 
                containerStyle={'!w-full'}
                name={'to'}
                changeValue={setTo}
                label='To'
                fieldStyle='!px-[14px] !w-full justify-between !py-[12px]'
                popoverDirection='down'
                placeholder='YYYY-MM-DD'
                toggleStyle='!mt-[35px]'
                clearField={to === undefined}
                asSingle
                rightIcon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M17.5 8.33268H2.5M13.3333 1.66602V4.99935M6.66667 1.66602V4.99935M6.5 18.3327H13.5C14.9001 18.3327 15.6002 18.3327 16.135 18.0602C16.6054 17.8205 16.9878 17.4381 17.2275 16.9677C17.5 16.4329 17.5 15.7328 17.5 14.3327V7.33268C17.5 5.93255 17.5 5.23249 17.2275 4.69771C16.9878 4.2273 16.6054 3.84485 16.135 3.60517C15.6002 3.33268 14.9001 3.33268 13.5 3.33268H6.5C5.09987 3.33268 4.3998 3.33268 3.86502 3.60517C3.39462 3.84485 3.01217 4.2273 2.77248 4.69771C2.5 5.23249 2.5 5.93255 2.5 7.33268V14.3327C2.5 15.7328 2.5 16.4329 2.77248 16.9677C3.01217 17.4381 3.39462 17.8205 3.86502 18.0602C4.3998 18.3327 5.09987 18.3327 6.5 18.3327Z" 
                      stroke="#818898" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      fill='transparent' 
                    />
                  </svg>
                }
              /> 
            </div>

            {
              !apiConsumer &&
              <div className='w-full flex items-center gap-[16px]'>
                <SelectElement 
                  name='consumers'
                  options={allObject?.concat(consumers_list)}
                  label='Select Consumer(s)'
                  placeholder='Select consumer'
                  // multiple
                  required
                  optionStyle='top-[70px]'
                  clickerStyle='!w-full'
                  value={consumers}
                  changeValue={setConsumers}
                />

                <SelectElement 
                  name='collection'
                  options={allObject?.concat(collections_list)}
                  label='Select Collection'
                  placeholder='Select Collection'
                  required
                  optionStyle='top-[70px]'
                  clickerStyle='!w-full'
                  value={collection}
                  changeValue={setCollection}
                />
              </div>
            }

            <div className='w-full flex items-center gap-[16px]'>
              {
                (apiConsumer || collection) &&
                <SelectElement 
                  name='api'
                  options={allObject?.concat(apis_list)}
                  label='Select API'
                  placeholder='Select API'
                  required
                  optionStyle='top-[70px]'
                  clickerStyle='!min-w-[49%]'
                  value={api}
                  changeValue={setApi}
                />
              } 
            </div>
          </div>

          <div className='w-full bg-white flex items-center gap-[24px] justify-between'>
            <Button 
              title='Clear all'
              effect={handleClearAll}
              small
              outlined
            />

            <Button 
              type='submit'
              title='Generate'
              loading={loading}
              containerStyle='!w-[90px]'
              disabled={incorrect}
              small
            />
          </div>
        </form>
      </section>
{/* "totalCount": 1,
        "avgRequestLatency": 337,
        "avgGatewayLatency": 20,
        "avgProxyLatency": 317,
        "avgCountPerSecond": 1,
        "successCount": 1,
        "failedCount": 0 */}
      <section className='w-full flex flex-wrap gap-[20px] p-[20px] border-1 border-[#F1F2F4] bg-[#F6F8FA] rounded-[8px]'>
        {
          REPORTING_DATA({
            total_processed: logStats?.totalCount,
            successful: logStats?.successCount,
            failed: logStats?.failedCount,
            request_latency: logStats?.avgRequestLatency,
            gateway_latency: logStats?.avgGatewayLatency,
            latency: logStats?.avgProxyLatency
          })?.map(data => (
            <DashboardMetricCard 
              key={data?.id}
              title={data?.title}
              amount={data?.amount}
              containerStyle='!h-fit'
              amountUnit={data?.amountUnit}
              // isGreen={data?.isGreen}
              // labels={data?.labels}
              // data={data?.data}
            />
          ))
        }
      </section>
    </div>
  )
}

export default ReportingSection