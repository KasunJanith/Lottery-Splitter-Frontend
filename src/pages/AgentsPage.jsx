import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const AgentsPage = () => {
  const { agents, addAgent, removeAgent } = useAppContext();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addAgent(newName.trim());
      setNewName('');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Agents</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Agent name"
          className="flex-1 rounded-lg border-gray-300 shadow-sm focus:ring-cyan-500 focus:border-cyan-500 px-4 py-2"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition"
        >
          <PlusIcon className="h-5 w-5" /> Add
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 w-20 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{agent.name}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => removeAgent(agent.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                  No agents added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentsPage;