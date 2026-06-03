import { useAppContext } from '../context/AppContext';
import AgentSummaryTable from '../components/AgentSummaryTable';

const AgentSummaryPage = () => {
  const { sessionId } = useAppContext();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Agent Summary</h1>
      {sessionId ? (
        <AgentSummaryTable sessionId={sessionId} />
      ) : (
        <p className="text-gray-500">Please upload and process lotteries first.</p>
      )}
    </div>
  );
};

export default AgentSummaryPage;