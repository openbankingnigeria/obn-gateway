// @ts-nocheck

import { useState } from 'react'
import * as FileSaver from 'file-saver';
import  * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { ACTIVITY_DETAILS, ACTIVITY_TABLE_DATA } from '@/data/activityData';

const useExportExcel = (type: string = '') => {
  const [loadingExport, setLoadingExport] = useState(false);
  const fileType =
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const activity = type == 'activity';
  const activity_details = type == 'activity_details';

  const activityData = ACTIVITY_TABLE_DATA;
  const activityDetailsData = [ACTIVITY_DETAILS]
  const allData = activity_details ? activityDetailsData : activityData;

  const exportToExcel = async (excelData: any[]) => {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, type?.replace(/ /g, '_')?.trim() + fileExtension);
  };

  const handleExport: () => void = () => {
    setLoadingExport(true);
    toast.info('Export in progress. Please do not leave this page');
    exportToExcel(
      allData?.map(data => {
        return (
          activity ? {
            'ID': data?.id,
            'Reference ID': data?.reference_id,
            'Consumer Name': data?.consumer_name,
            'Email Address': data?.email_address,
            'API Name': data?.api_name,
            'Status': data?.status,
            'Endpoint URL': data?.endpoint_url,
            'Timestamp': data?.timestamp
          } : 
            activity_details ? {
              'ID': data?.id,
              'Consumer Name': data?.consumer_name,
              'Email Address': data?.email_address,
              'API Name': data?.api_name,
              'Status': data?.status,
              'Reference ID': data?.reference_id,
              'Timestamp': data?.timestamp,
              'Endpoint URL': data?.endpoint_url,
              'Status Code': data?.status_code
            } : null
        );
      })
    );
    setLoadingExport(false);
  }

  return [loadingExport, handleExport];
}

export default useExportExcel