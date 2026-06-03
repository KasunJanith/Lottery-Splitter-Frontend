import { useState, useEffect } from 'react';
import { splitLottery } from '../api';
import { useAppContext } from '../context/AppContext';

const SplitModal = ({ lottery, sessionId, onClose }) => {
  const { agents, splitResults, setSplitResults } = useAppContext();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalTickets = lottery.record_count;
  const assignedTickets = assignments.reduce((sum, a) => sum + (parseInt(a.count) || 0), 0);
  const remaining = totalTickets - assignedTickets;

  // Build assignments from agents (ordered as they appear)
  useEffect(() => {
    setAssignments(agents.map((agent) => ({ agent_name: agent.name, count: 0 })));
  }, [agents, lottery]);

  const handleCountChange = (index, value) => {
    const newAssign = [...assignments];
    newAssign[index].count = parseInt(value) || 0;
    setAssignments(newAssign);
  };

  const handleSplit = async () => {
    const validAssign = assignments.filter((a) => a.count > 0);
    if (validAssign.length === 0) return;

    setLoading(true);
    setError('');
    try {
      const res = await splitLottery({
        session_id: sessionId,
        lottery_name: lottery.lottery_name,
        draw_number: lottery.draw_number,
        assignments: validAssign,
      });

      const newParts = res.data.parts.map((p) => ({
        ...p,
        lottery: `${lottery.lottery_name}${lottery.draw_number}`,
      }));
      setSplitResults((prev) => [...prev, ...newParts]);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Split failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Split {lottery.lottery_name} Draw {lottery.draw_number}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Assign tickets to agents in order. The first agent receives the first serial numbers.
        </p>

        <div className="space-y-3 mb-6">
          {assignments.map((assign, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
              <span className="w-8 text-gray-400 font-mono text-center">{idx + 1}</span>
              <span className="w-40 font-medium">{assign.agent_name}</span>
              <input
                type="number"
                min="0"
                value={assign.count}
                onChange={(e) => handleCountChange(idx, e.target.value)}
                className="w-24 rounded-lg border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="Count"
              />
              <span className="text-sm text-gray-500">tickets</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between bg-gray-100 p-4 rounded-lg mb-4">
          <div>
            <span className="text-gray-500">Total Tickets:</span>{' '}
            <strong>{totalTickets}</strong>
          </div>
          <div>
            <span className="text-gray-500">Assigned:</span>{' '}
            <strong>{assignedTickets}</strong>
          </div>
          <div>
            <span className="text-gray-500">Remaining:</span>{' '}
            <strong className="text-amber-600">{remaining}</strong>
          </div>
        </div>

        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSplit}
            disabled={loading || assignedTickets === 0}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            {loading ? 'Splitting...' : 'Split & Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitModal;