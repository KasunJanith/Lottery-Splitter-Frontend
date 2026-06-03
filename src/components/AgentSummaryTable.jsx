import { useAppContext } from '../context/AppContext';
import { saveAs } from 'file-saver';   // optional for ZIP download later

const AgentSummaryPage = () => {
  const { splitResults, sessionId } = useAppContext();

  // Group splitResults by agent
  const agentSummary = {};
  splitResults.forEach((part) => {
    const agent = part.agent || 'Unassigned';
    if (!agentSummary[agent]) {
      agentSummary[agent] = [];
    }
    agentSummary[agent].push(part);
  });

  const handleDownloadZip = () => {
    // Placeholder: will trigger backend ZIP download in future
    alert('ZIP download will be implemented soon.');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Agent Ticket Summary</h1>
        <button
          onClick={handleDownloadZip}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow transition font-medium"
        >
          Download All as ZIP
        </button>
      </div>

      {Object.keys(agentSummary).length === 0 && (
        <p className="text-gray-500">No splits performed yet.</p>
      )}

      {Object.entries(agentSummary).map(([agent, parts]) => (
        <div key={agent} className="mb-6 bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 font-semibold text-lg border-b">
            {agent}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lottery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Draw</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Serial</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Serial</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parts.map((part, idx) => {
                  // Extract lottery name and draw from part.lottery (e.g., "Maha6192")
                  const match = part.lottery.match(/([A-Za-z]+)(\d+)/);
                  const lottery = match ? match[1] : part.lottery;
                  const draw = match ? match[2] : '';
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{lottery}</td>
                      <td className="px-6 py-4">{draw}</td>
                      <td className="px-6 py-4">{part.part_number}</td>
                      <td className="px-6 py-4">{part.start_serial}</td>
                      <td className="px-6 py-4">{part.end_serial}</td>
                      <td className="px-6 py-4">{part.record_count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentSummaryPage;