import React from 'react';
import { ToastContainer } from 'react-toastify';

import VideoTrimmer from './components/VideoTrimmer/VideoTrimmer';

function App() {
  return <>
    <VideoTrimmer />
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  </>;
}

export default App;