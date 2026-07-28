import { createContext, useContext } from 'react';

const GitStatsContext = createContext(null);

export function GitStatsProvider({ children, value }) {
  return (
    <GitStatsContext.Provider value={value}>
      {children}
    </GitStatsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGitStats() {
  const context = useContext(GitStatsContext);
  if (!context) {
    throw new Error('useGitStats must be used within a GitStatsProvider');
  }
  return context;
}
