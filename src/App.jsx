import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import AgentsPage from './pages/AgentsPage';
import AgentSummaryPage from './pages/AgentSummaryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages with sidebar layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agent-summary" element={<AgentSummaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;