import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import DateInput from '../components/DateInput';
import { formatDate } from '../utils/dateUtils';
import {
  UsersIcon,
  TicketIcon,
  ClipboardDocumentCheckIcon,
  CloudArrowUpIcon,
  ScissorsIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const Overview = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load today's stats on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadStats(today);
  }, []);

  // Reload when date changes
  useEffect(() => {
    if (selectedDate) loadStats(selectedDate);
  }, [selectedDate]);

  const loadStats = async (date) => {
    setLoading(true);
    try {
      const res = await getDashboardStats(date);
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 mt-20">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Overview Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Viewing:</span>
          <DateInput selectedDate={selectedDate} onChange={setSelectedDate} />
          {selectedDate && (
            <span className="text-sm text-gray-600">({formatDate(selectedDate)})</span>
          )}
        </div>
      </div>

      {/* Row 1 - Always Global + Order Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Always global */}
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center">
          <div className="rounded-full p-3 bg-blue-500 text-white mr-4">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total Agents</div>
            <div className="text-2xl font-bold">{stats.total_agents}</div>
          </div>
        </div>

        {/* Date-specific: Tickets Ordered */}
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center">
          <div className="rounded-full p-3 bg-green-500 text-white mr-4">
            <TicketIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Tickets Ordered</div>
            <div className="text-2xl font-bold">{stats.total_tickets_ordered?.toLocaleString() || 0}</div>
            <div className="text-xs text-gray-400">{stats.total_lotteries_with_orders}/8 lotteries</div>
          </div>
        </div>

        {/* Date-specific: Assigned */}
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center">
  <div className={`rounded-full p-3 text-white mr-4 ${stats.remaining_to_assign > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
    <ClipboardDocumentCheckIcon className="h-6 w-6" />
  </div>
  <div>
    <div className="text-sm font-medium text-gray-500">Assigned to Agents</div>
    <div className="text-2xl font-bold">{stats.total_assigned?.toLocaleString() || 0}</div>
    {stats.remaining_to_assign > 0 && (
      <div className="text-xs text-amber-600">{stats.remaining_to_assign} remaining</div>
    )}
  </div>
</div>

        {/* Date-specific: Upload Status */}
        <div className="bg-white rounded-xl shadow-md p-5 flex items-center">
          <div className={`rounded-full p-3 text-white mr-4 ${stats.upload_exists ? 'bg-cyan-500' : 'bg-gray-400'}`}>
            <CloudArrowUpIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Archive Upload</div>
            <div className="text-2xl font-bold">
              {stats.upload_exists ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircleIcon className="h-5 w-5" /> Done
                </span>
              ) : (
                <span className="text-gray-400 flex items-center gap-1">
                  <XCircleIcon className="h-5 w-5" /> Pending
                </span>
              )}
            </div>
            {stats.upload_exists && (
              <div className="text-xs text-gray-400">{stats.total_uploaded_records?.toLocaleString()} records</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2 - Split Stats + Agent Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Split Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ScissorsIcon className="h-5 w-5 text-purple-500" />
            Split Status
          </h2>
          <div className="text-3xl font-bold mb-2">{stats.total_splits} splits</div>
          {stats.splits_per_agent && Object.keys(stats.splits_per_agent).length > 0 && (
            <div className="space-y-2 mt-3">
              {Object.entries(stats.splits_per_agent).map(([agent, data]) => (
                <div key={agent} className="flex justify-between items-center bg-gray-50 rounded p-2">
                  <span className="font-medium">{agent}</span>
                  <span className="text-sm text-gray-600">
                    {data.count} files ({data.total_records?.toLocaleString()} records)
                  </span>
                </div>
              ))}
            </div>
          )}
          {(!stats.splits_per_agent || Object.keys(stats.splits_per_agent).length === 0) && (
            <p className="text-sm text-gray-400 mt-2">No splits yet for this date.</p>
          )}
        </div>

        {/* Agent Assignments Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-blue-500" />
            Agent Assignments
          </h2>
          {stats.agent_assignments && Object.keys(stats.agent_assignments).length > 0 && (
            <div className="space-y-3">
              {Object.entries(stats.agent_assignments).map(([agent, count]) => (
                <div key={agent} className="flex items-center gap-3">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end px-2 text-xs text-white font-medium"
                      style={{
                        width: `${stats.total_tickets_ordered > 0 ? (count / stats.total_tickets_ordered) * 100 : 0}%`,
                        minWidth: count > 0 ? '40px' : '0'
                      }}
                    >
                      {count > 0 && count.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-sm font-medium w-20">{agent}</span>
                </div>
              ))}
            </div>
          )}
          {(!stats.agent_assignments || Object.keys(stats.agent_assignments).length === 0) && (
            <p className="text-sm text-gray-400">No assignments yet for this date.</p>
          )}
        </div>
      </div>

      {/* Mismatch Warnings */}
      {stats.has_mismatches && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="h-5 w-5" />
            Record Count Mismatches
          </h2>
          <div className="space-y-2">
            {stats.mismatches.map((m, idx) => (
              <div key={idx} className="flex items-center gap-4 text-sm">
                <span className="font-medium text-red-800 w-32">{m.lottery}</span>
                <span className="text-red-600">Ordered: <strong>{m.ordered}</strong></span>
                <span className="text-red-600">Uploaded: <strong>{m.uploaded}</strong></span>
                <span className="text-red-500">(Diff: {m.uploaded - m.ordered})</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-red-600 mt-3">Please check Order Entry and re-upload the correct file.</p>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Split Activity (All Dates)</h2>
        {stats.recent_activity?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Agent</th>
                  <th className="px-4 py-2 text-left">Lottery</th>
                  <th className="px-4 py-2 text-left">Draw #</th>
                  <th className="px-4 py-2 text-left">Records</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recent_activity.map((activity, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{activity.agent}</td>
                    <td className="px-4 py-2">{activity.lottery}</td>
                    <td className="px-4 py-2">{activity.draw}</td>
                    <td className="px-4 py-2">{activity.records}</td>
                    <td className="px-4 py-2 text-gray-500">{activity.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No split activity yet.</p>
        )}
      </div>
    </div>
  );
};

export default Overview;