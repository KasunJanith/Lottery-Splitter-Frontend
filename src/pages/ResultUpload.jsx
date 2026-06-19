import { useState, useEffect } from 'react';
import {
  uploadWinningArchive,
  getLatestOrderDate,
  getWinningFilesByDate,
} from '../api';
import DateInput from '../components/DateInput';
import { formatDate } from '../utils/dateUtils';

const ResultUpload = () => {
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  // Existing files for the selected date (fetched automatically)
  const [existingFiles, setExistingFiles] = useState([]);
  const [existingSessionId, setExistingSessionId] = useState(null);

  // Load latest date on mount
  useEffect(() => {
    (async () => {
      const res = await getLatestOrderDate();
      if (res.data.date) {
        setDate(res.data.date);
        fetchExistingFiles(res.data.date);
      }
    })();
  }, []);

  // When date changes, fetch existing winning files
  useEffect(() => {
    if (date) {
      fetchExistingFiles(date);
      // Clear upload result when date changes
      setUploadResult(null);
    }
  }, [date]);

  const fetchExistingFiles = async (d) => {
    try {
      const res = await getWinningFilesByDate(d);
      if (res.data.session_id) {
        setExistingSessionId(res.data.session_id);
        setExistingFiles(res.data.files);
      } else {
        setExistingSessionId(null);
        setExistingFiles([]);
      }
    } catch (e) {
      console.error(e);
      setExistingFiles([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!date) return alert('Please select a date.');
    if (!window.confirm('Upload winning archive?')) return;

    setUploading(true);
    setError('');
    try {
      const res = await uploadWinningArchive(file, date);
      setUploadResult(res.data);
      // Refresh the file list after upload
      fetchExistingFiles(date);
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upload Winning Files</h1>

      <div className="mb-4 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DateInput selectedDate={date} onChange={setDate} />
        </div>
        {date && <div className="text-sm text-gray-600">({formatDate(date)})</div>}
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3">Upload New Archive</h2>
        <input
          type="file"
          accept=".zip,.rar"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-cyan-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Archive'}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        {uploadResult && (
          <p className="text-green-600 mt-2">
            Upload successful! Session ID: {uploadResult.session_id}
          </p>
        )}
      </div>

      {/* Existing Files Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Uploaded Files for {date ? formatDate(date) : '...'}
        </h2>
        {existingFiles.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Lottery Name</th>
                <th className="px-4 py-2 text-left">Draw</th>
                <th className="px-4 py-2 text-left">Records</th>
                <th className="px-4 py-2 text-left">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {existingFiles.map((f) => (
                <tr key={f.lottery_code}>
                  <td className="px-4 py-2 font-medium">{f.lottery_name}</td>
                  <td className="px-4 py-2">{f.draw_number}</td>
                  <td className="px-4 py-2">{f.record_count}</td>
                  <td className="px-4 py-2">
                    {f.total_price?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500 text-center py-6">
            No winning files uploaded for this date.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultUpload;