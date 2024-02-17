'use client'

import { useState } from 'react'
import * as FileSaver from 'file-saver';
import  * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { ACTIVITY_DETAILS, ACTIVITY_TABLE_DATA } from '@/data/activityData';
import clientAxiosRequest from './clientAxiosRequest';
import * as API from '@/config/endpoints';
import { getJsCookies } from '@/config/jsCookie';

const useExportExcel = (type: string = '', rawData: any) => {
  const [loadingExport, setLoadingExport] = useState(false);
  const fileType =
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const environment = getJsCookies('environment');
  const activity = type == 'activity';
  const activity_details = type == 'activity_details';

  const activityDetailsData = [rawData];

  const exportToExcel = async (excelData: any[]) => {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, type?.replace(/ /g, '_')?.trim() + fileExtension);
  };

  const handleExport: () => void = async () => {
    setLoadingExport(true);
    toast.info('Export in progress. Please do not leave this page');
    if (activity) {
      const result = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.getAPILogs({
          page: `1`,
          limit: `10000`,
          environment: environment || 'development'
        }),
        method: 'GET',
        data: null,
        noToast: true,
      });
      const apiActivities = result?.data || [];

      exportToExcel(
        apiActivities?.map((data: any) => {
          return({
            // 'ID': apiActivities?.id,
            'Reference ID': data?.id,
            'Consumer Name': data?.company?.name,
            // 'Email Address': data?.email_address,
            'API Name': data?.name,
            'Status': data?.response?.status,
            'Endpoint URL': data?.request?.url,
            'Timestamp': data?.timestamp
          })
        })
      );
    } else if(activity_details){
      exportToExcel(
        activityDetailsData?.map(data => {
          return (
            {
              'ID': data?.id,
              'Consumer Name': data?.company?.name,
              // 'Email Address': data?.email_address,
              'API Name': data?.name,
              'Status': data?.response?.status,
              // 'Reference ID': data?.reference_id,
              'Timestamp': data?.timestamp,
              'Endpoint URL': data?.request?.url,
              'Status Code': data?.response?.status
            });
        })
      );
    } else { null }
    setLoadingExport(false);
  }

  return [loadingExport, handleExport];
}

export default useExportExcel