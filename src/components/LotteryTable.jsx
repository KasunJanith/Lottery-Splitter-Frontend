const LotteryTable = ({ lotteries, onSplit }) => (
  <div className="bg-white rounded-xl shadow overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-100">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draw</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Serial</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Serial</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {lotteries.map((l) => (
          <tr key={`${l.lottery_name}${l.draw_number}`} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap font-medium">{l.lottery_name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{l.draw_number}</td>
            <td className="px-6 py-4 whitespace-nowrap">{l.record_count}</td>
            <td className="px-6 py-4 whitespace-nowrap">{l.start_serial}</td>
            <td className="px-6 py-4 whitespace-nowrap">{l.end_serial}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button
                onClick={() => onSplit(l)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded-lg shadow transition font-medium"
              >
                Split
              </button>
            </td>
          </tr>
        ))}
        {lotteries.length === 0 && (
          <tr>
            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
              No lottery data. Upload an archive first.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default LotteryTable;