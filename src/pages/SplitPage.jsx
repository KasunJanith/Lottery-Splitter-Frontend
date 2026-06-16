import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  splitForAgent,
  getLatestOrderDate,
  getAssignedCounts,
  getSessionByDate,
  getSessionLotteries,
} from '../api';
import DateInput from '../components/DateInput';
import { formatDate } from '../utils/dateUtils';

const SplitPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [agent, setAgent] = useState('JAYAWAY');
  const [sessionId, setSessionId] = useState(null);
  const [lotteries, setLotteries] = useState([]);
  const [assignedCounts, setAssignedCounts] = useState([]);
  const [mismatches, setMismatches] = useState({});
  const [splitting, setSplitting] = useState(false);
  const navigate = useNavigate();

  // Load latest date & its session on mount
  useEffect(() => {
    (async () => {
      const res = await getLatestOrderDate();
      if (res.data.date) {
        setSelectedDate(res.data.date);
        loadSession(res.data.date);
      }
    })();
  }, []);

  // Reload session when date changes
  useEffect(() => {
    if (selectedDate) loadSession(selectedDate);
  }, [selectedDate]);

  // Load assigned counts when date or agent changes
  useEffect(() => {
    if (selectedDate && agent) loadAssignedCounts(selectedDate, agent);
  }, [selectedDate, agent]);

  // Check mismatches
  useEffect(() => {
    if (lotteries.length && assignedCounts.length) {
      const m = {};
      lotteries.forEach((l) => {
        const a = assignedCounts.find((a) => a.lottery_code === l.lottery_name);
        m[l.lottery_name] = a ? l.record_count !== a.available_quantity : false;
      });
      setMismatches(m);
    }
  }, [lotteries, assignedCounts]);

  const loadSession = async (date) => {
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
    } catch {
      setSessionId(null);
      setLotteries([]);
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

  const handleSplit = async () => {
    if (!sessionId) return alert('No uploaded archive for this date.');
    if (assignedCounts.length === 0) return alert('No assignments found.');
    if (!window.confirm(`Split for ${agent} on ${formatDate(selectedDate)}?`)) return;
    setSplitting(true);
    try {
      await splitForAgent({
        session_id: sessionId,
        agent_name: agent,
        assignment_date: selectedDate,
      });
      alert('Split completed');
      navigate('/download');
    } catch (e) {
      alert(e.response?.data?.detail || 'Split failed');
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Split DBF Files</h1>

      <div className="mb-4 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
        </div>
      </div>

      {sessionId && lotteries.length > 0 ? (
        <>
          {/* Uploaded files table with mismatch indicators */}
          <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Ticket</th>
                  <th className="px-4 py-2">Draw</th>
                  <th className="px-4 py-2">Records</th>
                  <th className="px-4 py-2">Start Serial</th>
                  <th className="px-4 py-2">End Serial</th>
                  <th className="px-4 py-2">Match?</th>
                </tr>
              </thead>
              <tbody>
                {lotteries.map((l) => (
                  <tr key={l.lottery_name} className={mismatches[l.lottery_name] ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 font-medium">{l.lottery_name}</td>
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
            {Object.values(mismatches).some(v => v) && (
              <p className="text-red-600 mt-2">Warning: Some record counts don't match ordered quantities. Check Order Entry.</p>
            )}
          </div>

          {/* Agent selection & assigned counts */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Agent</label>
            <select
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              className="mt-1 w-48 rounded-lg border-gray-300"
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
                    <th className="px-4 py-2">Ticket</th>
                    <th className="px-4 py-2">Draw #</th>
                    <th className="px-4 py-2">Available</th>
                    <th className="px-4 py-2">Assigned ({agent})</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedCounts.map((item) => (
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
      ) : (
        <div className="text-gray-500">
          {selectedDate ? 'No uploaded archive for this date. Please upload first.' : 'Select a date to load data.'}
        </div>
      )}
    </div>
  );
};

export default SplitPage;