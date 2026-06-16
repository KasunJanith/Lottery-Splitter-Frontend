import { useState, useEffect } from 'react';
import { getSplitsByDate, downloadFile, downloadAgentZip, getLatestOrderDate } from '../api';
import { formatDate } from '../utils/dateUtils';
import DateInput from '../components/DateInput';

const SplitDownload = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [agent, setAgent] = useState('JAYAWAY');
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(false);

  // On mount, try to get latest order date (to default date)
  useEffect(() => {
    (async () => {
      try {
        const res = await getLatestOrderDate();
        if (res.data.date) {
          setSelectedDate(res.data.date);
          loadSplits(res.data.date, agent);
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Reload when date or agent changes
  useEffect(() => {
    if (selectedDate) loadSplits(selectedDate, agent);
  }, [selectedDate, agent]);

  const loadSplits = async (date, agentName) => {
    setLoading(true);
    try {
      const res = await getSplitsByDate(agentName, date);
      setSplits(res.data);
    } catch (e) {
      console.error(e);
      setSplits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSingle = (filename, sessionId) => {
    downloadFile(sessionId, filename).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const handleDownloadAll = () => {
    if (!window.confirm(`Download all split files for ${agent} on ${formatDate(selectedDate)}?`)) return;
    if (splits.length === 0) return;
    // Use the first split's session_id to download zip (all splits are from same session)
    const sessionId = splits[0].session_id;
    downloadAgentZip(sessionId, agent).then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${agent}_splits_${selectedDate}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Download Split Files</h1>

      <div className="flex gap-6 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
        </div>
        <div className="text-sm text-gray-600 self-end mb-1">
          
        </div>
        <div>
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
        <button
          onClick={handleDownloadAll}
          disabled={splits.length === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          Download All as ZIP
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : splits.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          {selectedDate
            ? `No split files for ${agent} on ${formatDate(selectedDate)}.`
            : 'Select a date and agent to view splits.'}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Lottery</th>
                <th className="px-4 py-2 text-left">Draw #</th>
                <th className="px-4 py-2 text-left">Start Serial</th>
                <th className="px-4 py-2 text-left">End Serial</th>
                <th className="px-4 py-2 text-left">Records</th>
                <th className="px-4 py-2 text-left">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {splits.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{s.lottery_name}</td>
                  <td className="px-4 py-2">{s.draw_number}</td>
                  <td className="px-4 py-2">{s.start_serial}</td>
                  <td className="px-4 py-2">{s.end_serial}</td>
                  <td className="px-4 py-2">{s.record_count}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleDownloadSingle(s.filename, s.session_id)}
                        className="text-cyan-600 hover:underline">
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

export default SplitDownload;