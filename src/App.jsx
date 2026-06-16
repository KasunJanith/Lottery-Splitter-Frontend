import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import OrderEntry from './pages/OrderEntry';
import Assignment from './pages/Assignment';
import UploadPage from './pages/UploadPage';
import SplitPage from './pages/SplitPage';
import SplitDownload from './pages/SplitDownload';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/orders" element={<OrderEntry />} />
          <Route path="/assign" element={<Assignment />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/split" element={<SplitPage />} />
          <Route path="/download" element={<SplitDownload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;