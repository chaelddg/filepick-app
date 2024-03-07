import { useEffect, useState } from "react";
import { AiOutlineEdit, AiFillSave, AiFillCopy, AiFillPauseCircle, AiFillPlayCircle   } from "react-icons/ai";
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const List = ({ filesList }) => {
  const [editFileName, setEditFileName] = useState('');
  const [fileNames, setFileNames] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [fileToBeCopied, setFileToBeCopied] = useState('');
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    socket.on('file_change', (data) => {
      setProgress(data)
      if (data == 100) {
        setFileToBeCopied('')
      }
    });
    setFileNames(filesList)
  }, [filesList]);

  const handleChangeFilename = (file) => {
    setEditFileName(file)
  }

  const handleSaveNewFileName = async () => {
    let editedNames = fileNames.map((f) => {
      if (f == editFileName) {
        f = newFileName.target.value
      }
      return f
    });
    // request to api for file change name
    const response = await axios.post('/rename', { old_name: editFileName, new_name: newFileName.target.value });
    setFileNames([...editedNames]);
  }

  const handleCopyFile = async (file) => {
    setFileToBeCopied(file)
    const response = await axios.post('/copy', { filename: file })
    setFileNames(response.data);
  }

  const handlePauseFileCopy = async (file) => {
    const response = await axios.post('/pause', { filename: file });
  }

  const handleResumeFileCopy = async (file) => {
    const response = await axios.post('/resume', { filename: file });
  }

  const changeFilenameAndCopy = (file) => (
    <div className="flex flex-row gap-2">
      <AiOutlineEdit title="Edit Filename" size={28} className="mx-auto" onClick={() => handleChangeFilename(file)} />
      <AiFillCopy title="Copy File" size={28} className="mx-auto" onClick={() => handleCopyFile(file)} />
    </div>
  )

  const pauseAndResume = (file) => (
    <div className="flex flex-row gap-2">
      <AiFillPauseCircle title="Pause" size={28} className="mx-auto" onClick={() => handlePauseFileCopy(file)} />
      <AiFillPlayCircle title="Resume" size={28} className="mx-auto" onClick={() => handleResumeFileCopy(file)} />
    </div>
  )

  return (
    <div className="bg-white overflow-auto">
      <table className="text-left w-full border-collapse">
        <thead>
          <tr>
            <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light">Name</th>
            <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light text-right"></th>
            <th className="py-4 px-6 bg-grey-lightest font-bold uppercase text-sm text-grey-dark border-b border-grey-light text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {
            fileNames.map((file, index) => (
              <tr className="hover:bg-grey-lighter" key={index}>
                <td className="py-4 px-6 border-b border-grey-light">
                  {
                    (editFileName && editFileName == file) ?
                    <input 
                      placeholder={file} 
                      className="
                        border-2
                        border-slate-50
                        p-1
                      "
                      onChange={setNewFileName}
                    /> : file
                  }
                </td>
                <td className="py-4 px-6 border-b border-grey-light text-right">
                  {(fileToBeCopied && fileToBeCopied == file) ? (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                    </div>
                  ) : null}
                </td>
                <td className="py-4 px-6 border-b border-grey-light text-right">
                  <span className="float-right">
                    {
                      (!fileToBeCopied) ? (
                        (editFileName && editFileName == file) ?
                          <AiFillSave 
                            title="Save Filename"
                            size={28} 
                            className="mx-auto" 
                            onClick={() => handleSaveNewFileName()}
                          /> : (
                            changeFilenameAndCopy(file)
                          )
                      ) : (
                        (fileToBeCopied == file) ? (
                          pauseAndResume(file)
                        ) : changeFilenameAndCopy(file)
                      )
                    }
                  </span>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default List;