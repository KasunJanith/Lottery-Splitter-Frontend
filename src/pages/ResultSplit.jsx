import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  validateWinning,
  splitWinning,
  getLatestOrderDate,
  getWinningSessionByDate,
} from '../api';
import DateInput from '../components/DateInput';
import { formatDate } from '../utils/dateUtils';

const ResultSplit = () => {
  const [date, setDate] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [agent, setAgent] = useState('JAYAWAY');
  const [splitting, setSplitting] = useState(false);
  const navigate = useNavigate();

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
    setLoadingSession(true);
    setSessionId(null);
    setValidation(null);
    try {
      const res = await getWinningSessionByDate(d);
      setSessionId(res.data.session_id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleValidate = async () => {
    if (!sessionId) return alert('No winning session loaded.');
    setValidating(true);
    setValidation(null);
    try {
      const res = await validateWinning(sessionId);
      setValidation(res.data);
    } catch (e) {
      alert(e.response?.data?.detail || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleSplit = async () => {
    if (!validation?.valid) return;
    setSplitting(true);
    try {
      await splitWinning({ session_id: sessionId, agent_name: agent });
      alert('Split completed');
      navigate('/result-download');
    } catch (e) {
      alert(e.response?.data?.detail || 'Split failed');
    } finally {
      setSplitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Split Winning Files</h1>

      <div className="mb-4 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DateInput selectedDate={date} onChange={setDate} />
        </div>
        {date && <div className="text-sm text-gray-600">({formatDate(date)})</div>}
      </div>

      {loadingSession && <p className="text-gray-500">Loading session…</p>}
      {!loadingSession && !sessionId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          No winning archive uploaded for this date.
        </div>
      )}

      {sessionId && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            Session: <span className="font-mono">{sessionId}</span>
          </p>

          <button
            onClick={handleValidate}
            disabled={validating}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg mb-6 disabled:opacity-50"
          >
            {validating ? 'Validating...' : 'Validate All Records'}
          </button>
        </>
      )}

      {/* Validation result */}
      {validation && (
        <div className={`p-4 rounded-xl mb-6 ${validation.valid ? 'bg-green-50' : 'bg-red-50'}`}>
          <h2 className="font-semibold">
            {validation.valid
              ? '✓ All records are within the assigned daytime splits'
              : '✗ Some records are outside the assigned ranges'}
          </h2>
          {validation.mismatches?.map((m, i) => (
            <p key={i} className="text-sm text-red-700">{m.lottery}: {m.message}</p>
          ))}
        </div>
      )}

      {/* Agent selection & split (only after global validation passes) */}
      {validation?.valid && (
        <div className="flex gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Agent</label>
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
            onClick={handleSplit}
            disabled={splitting}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {splitting ? 'Splitting...' : 'Split for Agent'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultSplit;