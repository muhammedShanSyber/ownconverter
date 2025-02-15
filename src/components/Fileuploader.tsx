import { useState } from 'react';

const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleBrowse = async () => {
    const filePath = await (window as any).electron.selectFile();
    if (filePath) {
      setSelectedFile(filePath.split('/').pop()); // Show only file name
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {selectedFile && <p><strong>Selected File:</strong> {selectedFile}</p>}
      <button 
        onClick={handleBrowse} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Browse
      </button>
    </div>
  );
};

export default FileUploader;
