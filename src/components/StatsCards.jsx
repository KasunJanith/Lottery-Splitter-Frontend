import { UsersIcon, TicketIcon, CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
const stats = [
  { label: 'Agents', value: '12', icon: UsersIcon, bg: 'bg-blue-500' },
  { label: 'Tickets Assigned', value: '34,567', icon: TicketIcon, bg: 'bg-green-500' },
  { label: 'Recent Draw', value: '2026-05-25', icon: CalendarDaysIcon, bg: 'bg-purple-500' },
  { label: 'Pending', value: '3', icon: ExclamationTriangleIcon, bg: 'bg-amber-500' },
];

const StatsCards = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {stats.map((s) => (
      <div key={s.label} className="bg-white rounded-xl shadow-md p-5 flex items-center">
        <div className={`rounded-full p-3 ${s.bg} text-white mr-4`}>
          <s.icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-sm font-medium text-gray-500">{s.label}</div>
          <div className="text-2xl font-bold">{s.value}</div>
        </div>
      </div>
    ))}
  </div>
);

export default StatsCards;