import { useState, useEffect } from 'react';
import { getAssignments, saveAssignments, getLatestOrderDate } from '../api';
import DateInput from '../components/DateInput';
import { formatDate } from '../utils/dateUtils';

const Assignment = () => {
  const [date, setDate] = useState('');
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getLatestOrderDate();
        if (res.data.date) {
          setDate(res.data.date);
          loadData(res.data.date);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (date) loadData(date);
  }, [date]);

  const loadData = async (d) => {
    try {
      const res = await getAssignments(d);
      setData(res.data);
    } catch (e) {
      setData([]);
    }
  };

  const handleCountChange = (code, agent, val) => {
    setData(prev =>
      prev.map(item => {
        if (item.lottery_code === code) {
          const newCounts = { ...item.agent_counts, [agent]: parseInt(val) || 0 };
          return { ...item, agent_counts: newCounts };
        }
        return item;
      })
    );
  };

  const handleAssignRemainingToggle = (code) => {
    setData(prev =>
      prev.map(item => {
        if (item.lottery_code === code) {
          const jaya = item.agent_counts?.JAYAWAY || 0;
          const remaining = item.available_quantity - jaya;
          return {
            ...item,
            agent_counts: {
              ...item.agent_counts,
              WINWAY: remaining > 0 ? remaining : 0,
            },
            assignRemaining: !item.assignRemaining,
          };
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    if (!window.confirm('Confirm assignments?')) return;
    const assignments = [];
    data.forEach(item => {
      for (const [agent, count] of Object.entries(item.agent_counts)) {
        assignments.push({ lottery_code: item.lottery_code, agent_name: agent, count });
      }
    });
    try {
      await saveAssignments({ assignment_date: date, assignments });
      setMessage('Assignments saved successfully');
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      setMessage('Error saving assignments');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Agent Assignment</h1>
      
      <div className="mb-4 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Assignment Date</label>
          <DateInput selectedDate={date} onChange={setDate} />
        </div>
        
      </div>

      {date && (
        <>
          <div className="bg-white shadow rounded-lg overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">JAYAWAY</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WINWAY</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign Rem.</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map(item => {
                  const jaya = item.agent_counts?.JAYAWAY || 0;
                  const winway = item.agent_counts?.WINWAY || 0;
                  const remaining = item.available_quantity - jaya - winway;
                  return (
                    <tr key={item.lottery_code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.lottery_name}</td>
                      <td className="px-4 py-3 text-gray-500">{item.draw_number}</td>
                      <td className="px-4 py-3">{item.available_quantity}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={jaya || ''}
                          onChange={e => handleCountChange(item.lottery_code, 'JAYAWAY', e.target.value)}
                          className="w-24 rounded border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={winway || ''}
                          onChange={e => handleCountChange(item.lottery_code, 'WINWAY', e.target.value)}
                          disabled={item.assignRemaining}
                          className="w-24 rounded border-gray-300 shadow-sm disabled:bg-gray-100"
                        />
                      </td>
                      <td className={`px-4 py-3 font-semibold ${remaining < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        {remaining}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.assignRemaining || false}
                          onChange={() => handleAssignRemainingToggle(item.lottery_code)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition"
          >
            Confirm Assignments
          </button>
          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
        </>
      )}
    </div>
  );
};

export default Assignment;