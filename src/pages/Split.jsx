import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
  uploadArchive,
  splitForAgent,
  getLatestOrderDate,
  getAssignedCounts,
  getSessionByDate,
  getSessionLotteries,
} from '../api';

const extractDateFromFileName = (filename) => {
  const parts = filename.replace(/\.zip$/i, '').split(' ');
  if (parts.length >= 3) {
    const [y, m, d] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return null;
};

const Split = () => {
  const { sessionId, setSessionId, lotteries, setLotteries } = useAppContext();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [agent, setAgent] = useState('JAYAWAY');
  const [assignedCounts, setAssignedCounts] = useState([]);
  const [splitting, setSplitting] = useState(false);
  const [mismatches, setMismatches] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await getLatestOrderDate();
      if (res.data.date) {
        setSelectedDate(res.data.date);
        loadSessionForDate(res.data.date);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedDate && agent) loadAssignedCounts(selectedDate, agent);
  }, [selectedDate, agent]);

  useEffect(() => {
    if (lotteries.length && assignedCounts.length) {
      const m = {};
      lotteries.forEach(l => {
        const a = assignedCounts.find(a => a.lottery_code === l.lottery_name);
        m[l.lottery_name] = a ? l.record_count !== a.available_quantity : false;
      });
      setMismatches(m);
    }
  }, [lotteries, assignedCounts]);

  const loadSessionForDate = async (date) => {
    try {
      const sRes = await getSessionByDate(date);
      if (sRes.data.session_id) {
        setSessionId(sRes.data.session_id);
        const lRes = await getSessionLotteries(sRes.data.session_id);
        setLotteries(lRes.data);
      } else {
        setSessionId(null);
        setLotteries([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAssignedCounts = async (date, agentName) => {
    try {
      const res = await getAssignedCounts(agentName, date);
      setAssignedCounts(res.data);
    } catch {
      setAssignedCounts([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const zipDate = extractDateFromFileName(file.name);
    if (zipDate && zipDate !== selectedDate) {
      if (!window.confirm(`ZIP file date (${zipDate}) does not match selected date (${selectedDate}). Continue?`)) return;
    }
    if (!window.confirm('Upload this archive?')) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadArchive(file);
      setSessionId(res.data.session_id);
      setLotteries(res.data.lotteries);
      setFile(null);
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSplit = async () => {
    if (!sessionId || !selectedDate) return alert('Missing session or date');
    if (assignedCounts.length === 0) return alert('No assignments');
    if (!window.confirm(`Split for ${agent} on ${selectedDate}?`)) return;
    setSplitting(true);
    try {
      await splitForAgent({
        session_id: sessionId,
        agent_name: agent,
        assignment_date: selectedDate,
        zip_filename: file?.name || undefined,
      });
      alert('Split completed');
      navigate(`/download?session=${sessionId}`);
    } catch (e) {
      alert(e.response?.data?.detail || 'Split failed');
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Split DBF Files</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Assignment Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => {
            setSelectedDate(e.target.value);
            loadSessionForDate(e.target.value);
          }}
          className="mt-1 w-64 rounded-lg border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>

      {!sessionId ? (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Upload a ZIP file named like <code>2026 06 05 DBS.zip</code> (date must match).
          </p>
          <input
            type="file"
            accept=".zip,.rar"
            onChange={e => setFile(e.target.files[0])}
            className="block mb-2"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`px-4 py-2 rounded-lg text-white ${
              !file || uploading ? 'bg-gray-400' : 'bg-cyan-600 hover:bg-cyan-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Archive'}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="mb-6">
          <p className="text-green-600 font-medium">✓ Upload successful </p>
          <div className="bg-white shadow rounded p-4 mt-2 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Ticket</th>
                  <th className="px-4 py-2 text-left">Draw</th>
                  <th className="px-4 py-2 text-left">Records</th>
                  <th className="px-4 py-2 text-left">Start Serial</th>
                  <th className="px-4 py-2 text-left">End Serial</th>
                  <th className="px-4 py-2 text-left">Match?</th>
                </tr>
              </thead>
              <tbody>
                {lotteries.map(l => (
                  <tr key={l.lottery_name} className={mismatches[l.lottery_name] ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2">{l.lottery_name}</td>
                    <td className="px-4 py-2">{l.draw_number}</td>
                    <td className="px-4 py-2">{l.record_count}</td>
                    <td className="px-4 py-2">{l.start_serial}</td>
                    <td className="px-4 py-2">{l.end_serial}</td>
                    <td className="px-4 py-2">
                      {mismatches[l.lottery_name] ? (
                        <span className="text-red-600 font-bold">Mismatch!</span>
                      ) : (
                        '✓'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {Object.values(mismatches).some(v => v) && (
            <p className="text-red-600 mt-2">Warning: Some counts don’t match ordered quantities. Check Order Entry.</p>
          )}
        </div>
      )}

      {sessionId && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Agent</label>
            <select
              value={agent}
              onChange={e => setAgent(e.target.value)}
              className="mt-1 w-48 rounded-lg border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option>JAYAWAY</option>
              <option>WINWAY</option>
            </select>
          </div>
          {assignedCounts.length > 0 && (
            <div className="bg-white shadow rounded-lg overflow-x-auto mb-6">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Ticket</th>
                    <th className="px-4 py-2 text-left">Draw #</th>
                    <th className="px-4 py-2 text-left">Available</th>
                    <th className="px-4 py-2 text-left">Assigned ({agent})</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedCounts.map(item => (
                    <tr key={item.lottery_code}>
                      <td className="px-4 py-2">{item.lottery_name}</td>
                      <td className="px-4 py-2">{item.draw_number}</td>
                      <td className="px-4 py-2">{item.available_quantity}</td>
                      <td className="px-4 py-2 font-semibold">{item.assigned_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {assignedCounts.length > 0 && (
            <button
              onClick={handleSplit}
              disabled={splitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {splitting ? 'Splitting...' : 'Split for Agent'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Split;