import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import OrderEntry from './pages/OrderEntry';
import Assignment from './pages/Assignment';
import Split from './pages/Split';
import SplitDownload from './pages/SplitDownload';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All pages use the sidebar Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<OrderEntry />} />
          <Route path="/orders" element={<OrderEntry />} />
          <Route path="/assign" element={<Assignment />} />
          <Route path="/split" element={<Split />} />
          <Route path="/download" element={<SplitDownload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;