import { useState, useEffect } from 'react';
import { uploadArchive, getSessionByDate, getSessionLotteries, getLatestOrderDate } from '../api';
import { formatDate } from '../utils/dateUtils';
import DateInput from '../components/DateInput';

const UploadPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [lotteries, setLotteries] = useState([]);
  const [error, setError] = useState('');
const LOTTERY_ORDER = ['ada', 'dana', 'govi', 'hada', 'maha', 'mgap', 'jaya', 'suba'];
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

  useEffect(() => {
    if (selectedDate) loadSession(selectedDate);
  }, [selectedDate]);

const loadSession = async (date) => {
  try {
    const sRes = await getSessionByDate(date);
    if (sRes.data.session_id) {
      setSessionId(sRes.data.session_id);
      const lRes = await getSessionLotteries(sRes.data.session_id);
      const sorted = [...lRes.data].sort((a, b) => {
        const idxA = LOTTERY_ORDER.indexOf(a.lottery_name.toLowerCase());
        const idxB = LOTTERY_ORDER.indexOf(b.lottery_name.toLowerCase());
        return idxA - idxB;
      });
      setLotteries(sorted);
    } else {
      setSessionId(null);
      setLotteries([]);
    }
  } catch {
    setSessionId(null);
    setLotteries([]);
  }
};

  const handleUpload = async () => {
    if (!file) return;
    if (!window.confirm(`Upload ${file.name}?`)) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadArchive(file);
      // Reload session for the current date (uploaded session should match the date)
      setFile(null);
      // The uploaded session may have been created with the date from the filename,
      // so reload to fetch the new session.
      await loadSession(selectedDate);
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upload DBF Archive</h1>

      <div className="mb-4 flex items-end gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700">Draw Date</label>
    <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
  </div>
  
</div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <p className="text-sm text-gray-500 mb-4">
          <strong>Note:</strong> ZIP must contain exactly 8 DBF files (e.g., <code>ada0786.dbf</code>).
          Filename should include the draw date like <code>2026 06 05 DBS.zip</code>.
        </p>
        <input
          type="file"
          accept=".zip,.rar"
          onChange={(e) => setFile(e.target.files[0])}
          className="block mb-4"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`px-5 py-2 rounded-lg text-white font-medium ${
            !file || uploading ? 'bg-gray-400' : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
        >
          {uploading ? 'Uploading...' : 'Upload Archive'}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {sessionId && lotteries.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Ticket</th>
                  <th className="px-4 py-2">Draw</th>
                  <th className="px-4 py-2">Records</th>
                  <th className="px-4 py-2">Start Serial</th>
                  <th className="px-4 py-2">End Serial</th>
                </tr>
              </thead>
              <tbody>
                {lotteries.map((l) => (
                  <tr key={l.lottery_name}>
                    <td className="px-4 py-2 font-medium">{l.lottery_name}</td>
                    <td className="px-4 py-2">{l.draw_number}</td>
                    <td className="px-4 py-2">{l.record_count}</td>
                    <td className="px-4 py-2">{l.start_serial}</td>
                    <td className="px-4 py-2">{l.end_serial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!sessionId && selectedDate && (
        <div className="text-gray-500">No archive uploaded for this date.</div>
      )}
    </div>
  );
};

export default UploadPage;