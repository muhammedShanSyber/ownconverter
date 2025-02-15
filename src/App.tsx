// src/App.tsx
import React from 'react';
import Footer from './components/footer';
import "./App.css";
import FileUploader from './components/Fileuploader';

const App = () => {
  return (
    <>
      <main className="main-content">Welcome to my Electron App!
      
        <FileUploader/>
      </main>
      
      <Footer/>
    </>
  );
};

export default App;
