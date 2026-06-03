import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import StatsCards from '../components/StatsCards';
import LotteryTable from '../components/LotteryTable';
import SplitModal from '../components/SplitModal';

const DashboardPage = () => {
  const { lotteries, sessionId } = useAppContext();
  const [selectedLottery, setSelectedLottery] = useState(null);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <StatsCards />

      <h2 className="text-2xl font-bold mb-4">Lottery Tickets</h2>
      <LotteryTable lotteries={lotteries} onSplit={setSelectedLottery} />

      {selectedLottery && (
        <SplitModal
          lottery={selectedLottery}
          sessionId={sessionId}
          onClose={() => setSelectedLottery(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;