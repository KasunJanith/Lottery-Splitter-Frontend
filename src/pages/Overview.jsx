import { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import { formatDate } from '../utils/dateUtils';
import {
  UsersIcon,
  TicketIcon,
  CalendarIcon,
  ScissorsIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  const statCards = [
    { label: 'Total Agents', value: stats.total_agents, icon: UsersIcon, bg: 'bg-blue-500' },
    { label: 'Tickets Ordered', value: stats.total_tickets?.toLocaleString(), icon: TicketIcon, bg: 'bg-green-500' },
    { label: 'Recent Draw Date', value: stats.recent_draw_date ? formatDate(stats.recent_draw_date) : 'N/A', icon: CalendarIcon, bg: 'bg-purple-500' },
    { label: 'Total Splits', value: stats.total_splits, icon: ScissorsIcon, bg: 'bg-orange-500' },
    { label: "Today's Uploads", value: stats.today_uploads, icon: CloudArrowUpIcon, bg: 'bg-cyan-500' },
    { label: 'Pending Assignments', value: stats.pending_assignments, icon: ExclamationTriangleIcon, bg: stats.pending_assignments > 0 ? 'bg-red-500' : 'bg-gray-500' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Overview Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition">
            <div className={`rounded-full p-3 ${stat.bg} text-white mr-5`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Split Activity</h2>
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