'use client'

import { DragAndUploadFileProps } from '@/types/webappTypes/componentsTypes';
import React, { ChangeEvent, useState } from 'react'
import { toast } from 'react-toastify';
import ImageViewer from './ImageViewer';

const DragAndUploadFile = ({
  name,
  disabled,
  selectedFile,
  fileType,
  file,
  setSelectedFile
}: DragAndUploadFileProps) => {

  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const maxFileSizeInBytes = 2 * 1024 * 1024; // 2MB
  const [editFile, setEditFile] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement> | any, type: string) => {
    event.preventDefault();

    const files = (
      (type == 'input') ? 
        event.target.files : 
        event.dataTransfer.files
    );

    if (files && files.length > 0) {
      const file = files[0];

      if (!allowedFileTypes.includes(file.type)) {
        toast.error('Invalid file type. Please select a JPG, JPEG, PNG, or PDF file.');
        return;
      }

      if (file.size > maxFileSizeInBytes) {
        toast.error('File size exceeds the maximum limit of 2MB.');
        return;
      }

      setEditFile('editted');
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handlePreview = (path: string) => {
    window.open(path, '_blank')
  }

  const closeModal = () => {
    setOpenModal(false);
  }

  return (
    <>
    {
        openModal && (
          <ImageViewer 
            title={name}
            fileType={fileType || ''}
            file={file || ''}
            effect={closeModal}
          />
        )
      }

      {
        !editFile && file ?
          <div className='w-full justify-start items-center gap-[8px] flex'>
            <div className='text-f14 flex items-center gap-[4px] w-fit'>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" 
                  stroke="#666D80" 
                  strokeWidth="2" 
                  fill='transparent'
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>

              <span className='text-[#344054]'>
                {selectedFile}
              </span>
            </div>

            <span 
              onClick={() => setOpenModal(true)} 
              className='cursor-pointer whitespace-nowrap font-500 text-f14 text-o-light-blue'
            >
              Preview
            </span>

            {
              !disabled &&
              <span 
                onClick={() => setEditFile('edit')} 
                className='cursor-pointer whitespace-nowrap font-500 text-f14 text-o-green2'
              >
                Edit
              </span>
            }
          </div>
          :
          editFile == 'editted' && selectedFile ?
            <div className='px-[14px] py-[12px] w-full justify-between gap-[4px] flex items-center rounded-[6px] border border-o-border'>
              <div className='text-f14 flex items-center gap-[8px] w-full'>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 13H8M16 17H8M10 9H8M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2Z" 
                    stroke="#666D80" 
                    strokeWidth="2" 
                    fill='transparent'
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>

                <span className='text-[#344054]'>
                  {selectedFile?.name}
                </span>

                <span className='text-[#667085]'>
                  {
                    Number(selectedFile?.size) ?
                      formatBytes(Number(selectedFile.size)) :
                      null
                  }
                </span>
              </div>

              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className='min-w-[20px] h-[20px] cursor-pointer'
                onClick={() => setSelectedFile(null)}
              >
                <path 
                  d="M7.5 2.5H12.5M2.5 5H17.5M15.8333 5L15.2489 13.7661C15.1612 15.0813 15.1174 15.7389 14.8333 16.2375C14.5833 16.6765 14.206 17.0294 13.7514 17.2497C13.235 17.5 12.5759 17.5 11.2578 17.5H8.74221C7.42409 17.5 6.76503 17.5 6.24861 17.2497C5.79396 17.0294 5.41674 16.6765 5.16665 16.2375C4.88259 15.7389 4.83875 15.0813 4.75107 13.7661L4.16667 5M8.33333 8.75V12.9167M11.6667 8.75V12.9167" 
                  stroke="#DF1C41" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill='transparent'
                />
              </svg>
            </div>
            :
            <div 
              onDrop={(event) => handleFileChange(event, 'drop')}
              onDragOver={handleDragOver}
              className='p-[14px] h-[124px] w-full flex flex-col justify-center items-center gap-[4px] rounded-[6px] bg-o-bg-disabled'
            >
              <input 
                id={name}
                className='hidden'
                name={name}
                accept='.jpg, .jpeg, .png, .pdf'
                type="file"
                value={(editFile ? '' : selectedFile) || ''}
                onChange={(event) => handleFileChange(event,'input')}
              />
        
              <div className='text-o-text-dark text-center text-f14'>
                Drag your file here or&#160;
                <label
                  htmlFor={name} 
                  className='cursor-pointer text-f14 font-[600] text-o-light-blue'
                >
                  select a file
                </label>&#160;
                to upload
              </div>

              <div className='text-f12 text-o-text-muted2'>
                JPG, JPEG, PNG, PDF (max 2MB)
              </div>
            </div>
      }
    </>
  )
}

export default DragAndUploadFile