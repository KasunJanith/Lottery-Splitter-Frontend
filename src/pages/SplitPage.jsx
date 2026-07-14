import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  splitForAgent,
  getLatestOrderDate,
  getAssignedCounts,
  getSessionByDate,
  getSessionLotteries,
  validateUpload,
} from '../api';
import DateInput from '../components/DateInput';
import { formatDate } from '../utils/dateUtils';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const SplitPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [agent, setAgent] = useState('JAYAWAY');
  const [sessionId, setSessionId] = useState(null);
  const [lotteries, setLotteries] = useState([]);
  const [assignedCounts, setAssignedCounts] = useState([]);
  const [validation, setValidation] = useState(null);
  const [splitting, setSplitting] = useState(false);
  const navigate = useNavigate();
const LOTTERY_ORDER = ['ada', 'dana', 'govi', 'hada', 'maha', 'mgap', 'jaya', 'suba'];
  useEffect(() => {
    (async () => {
      const res = await getLatestOrderDate();
      if (res.data.date) {
        setSelectedDate(res.data.date);
        loadAllData(res.data.date);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedDate) loadAllData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && agent) loadAssignedCounts(selectedDate, agent);
  }, [selectedDate, agent]);

  const loadAllData = async (date) => {
    await Promise.all([loadSession(date), loadValidation(date)]);
  };
// new state
const [specialSplits, setSpecialSplits] = useState([]);
const [showSpecialModal, setShowSpecialModal] = useState(false);
const [specialCounts, setSpecialCounts] = useState({});
const [specialLabel, setSpecialLabel] = useState('');

// Load special splits when agent/date changes
useEffect(() => {
  if (selectedDate && agent && validation?.is_valid) {
    loadSpecialSplits(selectedDate, agent);
  }
}, [selectedDate, agent, validation]);

const loadSpecialSplits = async (date, agentName) => {
  try {
    const res = await getSpecialSplits(agentName, date);
    setSpecialSplits(res.data);
  } catch { setSpecialSplits([]); }
};

const handleSpecialSplit = async () => {
  const counts = assignedCounts.map(a => ({
    lottery_code: a.lottery_code,
    count: parseInt(specialCounts[a.lottery_code]) || 0,
  })).filter(c => c.count > 0);
  if (counts.length === 0) return alert('Enter at least one count');
  if (!window.confirm('Create special split?')) return;
  try {
    await createSpecialSplit({
      session_id: sessionId,
      agent_name: agent,
      assignment_date: selectedDate,
      counts: counts,
      label: specialLabel || undefined
    });
    alert('Special split created');
    setShowSpecialModal(false);
    setSpecialCounts({});
    setSpecialLabel('');
    loadSpecialSplits(selectedDate, agent);
  } catch (e) {
    alert(e.response?.data?.detail || 'Error');
  }
};
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

  const loadValidation = async (date) => {
    try {
      const res = await validateUpload(date);
      setValidation(res.data);
    } catch {
      setValidation(null);
    }
  };

  const loadAssignedCounts = async (date, agentName) => {
  try {
    const res = await getAssignedCounts(agentName, date);
    const sorted = [...res.data].sort((a, b) => {
      const idxA = LOTTERY_ORDER.indexOf(a.lottery_code.toLowerCase());
      const idxB = LOTTERY_ORDER.indexOf(b.lottery_code.toLowerCase());
      return idxA - idxB;
    });
    setAssignedCounts(sorted);
  } catch {
    setAssignedCounts([]);
  }
};

  // Build mismatch lookup from validation
  const getMismatchInfo = (lotteryCode) => {
    if (!validation?.mismatches) return null;
    return validation.mismatches.find(m => m.lottery_code === lotteryCode) || null;
  };

  const getMissingInfo = (lotteryCode) => {
    if (!validation?.missing_lotteries) return null;
    return validation.missing_lotteries.find(m => m.lottery_code === lotteryCode) || null;
  };

  const handleSplit = async () => {
    if (!sessionId) return alert('No uploaded archive for this date.');
    if (!validation?.is_valid) {
      return alert('Cannot split: There are validation errors. Fix them in Order Entry or re-upload the correct archive.');
    }
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

      <div className="mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
        </div>
        {selectedDate && (
          <div className="text-sm text-gray-600">({formatDate(selectedDate)})</div>
        )}
      </div>

      {/* Validation Status Banner */}
      {validation && !validation.upload_exists && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">No archive uploaded for this date. Please upload first.</span>
          </div>
        </div>
      )}

      {validation && validation.upload_exists && !validation.is_valid && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Validation Errors Found - Split disabled until fixed</span>
          </div>
          {validation.mismatches?.length > 0 && (
            <div className="text-sm text-red-700 mt-2">
              <strong>Mismatches:</strong>{' '}
              {validation.mismatches.map(m => 
                `${m.lottery_name} (Ordered: ${m.ordered_quantity}, Uploaded: ${m.uploaded_records})`
              ).join(', ')}
            </div>
          )}
          {validation.missing_lotteries?.length > 0 && (
            <div className="text-sm text-red-700 mt-1">
              <strong>Missing from upload:</strong>{' '}
              {validation.missing_lotteries.map(m => m.lottery_name).join(', ')}
            </div>
          )}
          {validation.extra_lotteries?.length > 0 && (
            <div className="text-sm text-amber-700 mt-1">
              <strong>Extra in upload:</strong>{' '}
              {validation.extra_lotteries.map(e => e.lottery_name).join(', ')}
            </div>
          )}
        </div>
      )}

      {validation && validation.is_valid && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">All files validated - Ready to split</span>
          </div>
        </div>
      )}

      {/* Uploaded Files Table */}
      {sessionId && lotteries.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-3">Uploaded Files</h2>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Ticket</th>
                <th className="px-4 py-2 text-left">Draw</th>
                <th className="px-4 py-2 text-left">Records</th>
                <th className="px-4 py-2 text-left">Ordered Qty</th>
                <th className="px-4 py-2 text-left">Start Serial</th>
                <th className="px-4 py-2 text-left">End Serial</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {lotteries.map((l) => {
                const mismatch = getMismatchInfo(l.lottery_name.toLowerCase());
                const missing = getMissingInfo(l.lottery_name.toLowerCase());
                const assigned = assignedCounts.find(a => a.lottery_code.toLowerCase() === l.lottery_name.toLowerCase());
                  const orderedQty = assigned?.available_quantity || 0;
                  const isMatch = !mismatch && !missing && orderedQty === l.record_count;
                return (
                  <tr
                    key={l.lottery_name}
                    className={
                      mismatch || missing
                        ? 'bg-red-50'
                        : !isMatch
                        ? 'bg-yellow-50'
                        : ''
                    }
                  >
                    <td className="px-4 py-2 font-medium">{l.lottery_name}</td>
                    <td className="px-4 py-2">{l.draw_number}</td>
                    <td className="px-4 py-2">{l.record_count}</td>
                    <td className="px-4 py-2">
                      {orderedQty > 0 ? orderedQty : '-'}
                    </td>
                    <td className="px-4 py-2">{l.start_serial}</td>
                    <td className="px-4 py-2">{l.end_serial}</td>
                    <td className="px-4 py-2">
                      {mismatch ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <XCircleIcon className="h-4 w-4" />
                          Mismatch ({mismatch.difference > 0 ? '+' : ''}{mismatch.difference})
                        </span>
                      ) : missing ? (
                        <span className="text-red-600">Missing from upload</span>
                      ) : isMatch ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircleIcon className="h-4 w-4" />
                          Match
                        </span>
                      ) : (
                        <span className="text-yellow-600">No order data</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Agent Selection & Split */}
      {sessionId && validation?.is_valid && (
        <>
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
              <h2 className="text-lg font-semibold p-4 pb-2">Assigned Counts for {agent}</h2>
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Ticket</th>
                    <th className="px-4 py-2 text-left">Draw #</th>
                    <th className="px-4 py-2 text-left">Available</th>
                    <th className="px-4 py-2 text-left">Assigned to {agent}</th>
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
          {/* Special Splits Section */}
{validation?.is_valid && assignedCounts.length > 0 && (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-3">Special Splits</h2>
    <button
      onClick={() => setShowSpecialModal(true)}
      className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
    >
      + Create Special Split
    </button>

    {specialSplits.length > 0 && (
      <div className="bg-white shadow rounded-lg overflow-x-auto mb-6">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Label</th>
              <th className="px-4 py-2">Lottery</th>
              <th className="px-4 py-2">Records</th>
              <th className="px-4 py-2">Start Serial</th>
              <th className="px-4 py-2">End Serial</th>
              <th className="px-4 py-2">Download</th>
            </tr>
          </thead>
          <tbody>
            {specialSplits.map(s => (
              <tr key={s.id}>
                <td className="px-4 py-2 font-medium">{s.label}</td>
                <td className="px-4 py-2">{s.lottery_name}</td>
                <td className="px-4 py-2">{s.record_count}</td>
                <td className="px-4 py-2">{s.start_serial}</td>
                <td className="px-4 py-2">{s.end_serial}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => downloadSpecialFile(s.session_id, s.filename).then(res => {
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = s.filename;
                      a.click();
                    })}
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
)}

{/* Special Split Modal */}
{showSpecialModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
      <h3 className="text-lg font-bold mb-4">Create Special Split</h3>
      <div className="mb-4">
        <label className="block text-sm">Label (optional)</label>
        <input
          type="text"
          value={specialLabel}
          onChange={e => setSpecialLabel(e.target.value)}
          className="w-full border rounded-lg p-2"
          placeholder="e.g., Special Split 1"
        />
      </div>
      <table className="w-full text-sm mb-4">
        <thead><tr><th>Lottery</th><th>Records to Take</th></tr></thead>
        <tbody>
          {assignedCounts.map(a => (
            <tr key={a.lottery_code}>
              <td>{a.lottery_name}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max={a.assigned_count}
                  value={specialCounts[a.lottery_code] || ''}
                  onChange={e => setSpecialCounts(prev => ({ ...prev, [a.lottery_code]: e.target.value }))}
                  className="w-20 border rounded p-1"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end gap-3">
        <button onClick={() => setShowSpecialModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        <button onClick={handleSpecialSplit} className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
      </div>
    </div>
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

export default SplitPage;