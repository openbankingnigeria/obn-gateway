import { DragAndUploadFileProps } from '@/types/webappTypes/componentsTypes';
import React, { ChangeEvent } from 'react'
import { toast } from 'react-toastify';

const DragAndUploadFile = ({
  name,
  selectedFile,
  setSelectedFile
}: DragAndUploadFileProps) => {

  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const maxFileSizeInBytes = 2 * 1024 * 1024; // 2MB

  const handleFileChange = (event: ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement> | any, type: string) => {
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

      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <section 
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
        value={selectedFile}
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
    </section>
  )
}

export default DragAndUploadFile