import React, { useEffect, useState } from 'react';
import axios from 'axios';

import List from './components/List';

axios.defaults.baseURL = 'http://localhost:3001';

function App() {
  const [file, setFile] = useState(null);
  const [filesList, setFilesList] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const getFiles = async () => {
      const response = await axios.get('/files');
      if (response.data) {
        setFilesList(response.data)
      } else {
        console.log(response.error)
      }
    }

    getFiles();
  }, [file])

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      setIsExtracting(true)
      const response = await axios.post('/upload', formData ,{
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setIsExtracting(false);
      const files = response.data
      setFilesList(files);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDownloadFiles = async () => {
    setDownloading(true)
    const response = await axios.get('/download', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'download.zip');
    document.body.appendChild(link);
    link.click();
    setDownloading(false)
  }

  return (
    <div className='pb-15 pt-10'>
      <div
        className='
          max-w-[2520px]
          mx-auto
          xl:px-20
          md:px-10
          sm:px-2
          px-4
        '
      >
        <div className='mb-10'>
          <h1 className='text-black-300'>Upload Zip File</h1>
          <input type="file" onChange={handleFileChange} />
          <button 
            className='
              bg-gray-500
              text-slate-100
              pt-1
              pb-1
              pr-2
              pl-2
              rounded-md
              disabled:cursor-not-allowed
            ' 
            disabled={isExtracting || !file}
            onClick={handleUpload}>
              Extract Files
          </button>
          {
            filesList && filesList.length ? (
              <button 
                className='
                  ml-5
                  bg-sky-500
                  text-slate-100
                  pt-1
                  pb-1
                  pr-2
                  pl-2
                  rounded-md
                  disabled:cursor-not-allowed
                ' 
                disabled={downloading}
                onClick={handleDownloadFiles}>
                  {downloading ? 'Downloading...' : 'Save files'}
              </button>
            ) : null
          }
        </div>

        <div>
          {
            isExtracting && (
              <div className="border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-sky-500" />
            )
          }
          {filesList.length > 0 && (
            <List filesList={filesList} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;