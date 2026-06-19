import { useState, useEffect } from 'react';
import {
  listAgentWinningSplits,
  downloadWinningFile,
  downloadAgentWinningZip,
  getLatestOrderDate,
  getWinningSessionByDate,
} from '../api';
import DateInput from '../components/DateInput';
import { formatDate } from '../utils/dateUtils';

const ResultDownload = () => {
  const [date, setDate] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [agent, setAgent] = useState('JAYAWAY');
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getLatestOrderDate();
      if (res.data.date) {
        setDate(res.data.date);
        fetchSession(res.data.date);
      }
    })();
  }, []);

  useEffect(() => {
    if (date) fetchSession(date);
  }, [date]);

  const fetchSession = async (d) => {
    setSessionId(null);
    try {
      const res = await getWinningSessionByDate(d);
      setSessionId(res.data.session_id);
      if (res.data.session_id) {
        loadSplits(res.data.session_id, agent);
      } else {
        setSplits([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (sessionId && agent) loadSplits(sessionId, agent);
  }, [sessionId, agent]);

  const loadSplits = async (sId, agentName) => {
    setLoading(true);
    try {
      const res = await listAgentWinningSplits(sId, agentName);
      setSplits(res.data);
    } catch (e) {
      console.error(e);
      setSplits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSingle = (filename, originalFilename) => {
    downloadWinningFile(sessionId, filename, originalFilename).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    });
  };

  const handleDownloadAll = () => {
    downloadAgentWinningZip(sessionId, agent).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agent}_winning_${date}.zip`;
      a.click();
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Download Winning Splits</h1>

      <div className="flex gap-6 items-end mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DateInput selectedDate={date} onChange={setDate} />
        </div>
        <div className="text-sm text-gray-600 self-end mb-1">
          {date && `(${formatDate(date)})`}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Agent</label>
          <select value={agent} onChange={e => setAgent(e.target.value)} className="mt-1 w-40 rounded-lg border-gray-300">
            <option>JAYAWAY</option>
            <option>WINWAY</option>
          </select>
        </div>
        <button
          onClick={handleDownloadAll}
          disabled={splits.length === 0}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Download ZIP
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : !sessionId ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          No winning splits for this date.
        </div>
      ) : splits.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          No splits found for {agent} on this date.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Lottery</th>
                <th className="px-4 py-2 text-left">Draw</th>
                <th className="px-4 py-2 text-left">Records</th>
                <th className="px-4 py-2 text-left">Total Price</th>
                <th className="px-4 py-2 text-left">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {splits.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{s.lottery_name}</td>
                  <td className="px-4 py-2">{s.draw_number}</td>
                  <td className="px-4 py-2">{s.record_count}</td>
                  <td className="px-4 py-2">{s.total_price?.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDownloadSingle(s.filename, s.original_filename)}
                      className="text-cyan-600 hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultDownload;