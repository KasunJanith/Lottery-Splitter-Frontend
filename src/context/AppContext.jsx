import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [lotteries, setLotteries] = useState([]);
  const [splitResults, setSplitResults] = useState([]);
  const [agents, setAgents] = useState([
    { id: 1, name: 'Jaya' },
    { id: 2, name: 'Winway' },
  ]);

  const addAgent = (name) =>
    setAgents((prev) => [...prev, { id: Date.now(), name }]);
  const removeAgent = (id) =>
    setAgents((prev) => prev.filter((a) => a.id !== id));

  return (
    <AppContext.Provider
      value={{
        sessionId, setSessionId,
        lotteries, setLotteries,
        splitResults, setSplitResults,
        agents, addAgent, removeAgent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);