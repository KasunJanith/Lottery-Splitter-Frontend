import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadArchive } from '../api';
import { useAppContext } from '../context/AppContext';
import { formatDate } from '../utils/dateUtils';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setSessionId, setLotteries } = useAppContext();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await uploadArchive(file);
      setSessionId(res.data.session_id);
      setLotteries(res.data.lotteries);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Upload DBF Archive</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Upload a ZIP file containing DBF files.
        </p>

        <div className="border-2 border-dashed border-cyan-300 rounded-xl p-6 text-center mb-6 bg-cyan-50">
          <input
            type="file"
            accept=".zip,.rar"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
          />
          {file && (
            <p className="mt-2 text-sm text-cyan-700 font-medium">✓ Selected: {file.name}</p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg"
        >
          {loading ? 'Uploading & Extracting...' : 'Upload & Extract'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;