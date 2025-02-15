import { useState } from 'react';
import path from 'path';

const FileUploader = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertedFilePath, setConvertedFilePath] = useState<string | null>(null);

  const handleBrowse = async () => {
    const filePath = await (window as any).electron.selectFile();
    if (!filePath) return; // Prevents setting null values

    console.log("Selected file path:", filePath);
    setSelectedFile(filePath);

    // Extract file extension and determine file type
    const extension = path.extname(filePath).toLowerCase();
    setFileType(extension === '.pdf' ? 'pdf' : extension === '.docx' ? 'docx' : null);

    setConvertedFilePath(null); // Reset after new file selection
  };

  const convertFile = async (conversionType: string) => {
    if (!selectedFile) {
      alert("No file selected!");
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setConvertedFilePath(null);

    for (let i = 0; i <= 100; i += 20) {
      await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate conversion
      setProgress(i);
    }

    console.log("Converting file:", selectedFile);
    try {
      const outputPath = await (window as any).electron.convertFile(selectedFile, conversionType);
      setIsConverting(false);

      if (outputPath) {
        setConvertedFilePath(outputPath);
      } else {
        alert('Conversion failed!');
      }
    } catch (error) {
      setIsConverting(false);
      alert("An error occurred during conversion.");
      console.error(error);
    }
  };

  const handleDownload = () => {
    if (convertedFilePath) {
      (window as any).electron.downloadFile(convertedFilePath);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {selectedFile && (
        <p>
          <strong>Selected File:</strong> {path.basename(selectedFile)}
        </p>
      )}

      <button onClick={handleBrowse} style={buttonStyle} disabled={isConverting}>
        Browse
      </button>

      {fileType === 'pdf' && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => convertFile('pdf-to-word')} style={buttonStyle} disabled={isConverting}>
            PDF to Word
          </button>
          <button onClick={() => convertFile('pdf-to-ppt')} style={buttonStyle} disabled={isConverting}>
            PDF to PowerPoint
          </button>
        </div>
      )}

      {fileType === 'docx' && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => convertFile('docx-to-pdf')} style={buttonStyle} disabled={isConverting}>
            DOCX to PDF
          </button>
        </div>
      )}

      {isConverting && (
        <div style={{ marginTop: '20px', width: '50%', marginLeft: 'auto', marginRight: 'auto' }}>
          <progress value={progress} max="100" style={{ width: '100%' }}></progress>
          <p>{progress}%</p>
        </div>
      )}

      {convertedFilePath && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleDownload} style={downloadButtonStyle}>Download File</button>
        </div>
      )}
    </div>
  );
};

// Button styles
const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  margin: '10px',
  cursor: 'pointer',
};

const downloadButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#28a745',
  color: 'white',
};

export default FileUploader;
