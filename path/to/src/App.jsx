// App.jsx

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { StatsBar } from './components/StatsBar';
import { AchievementBadges } from './components/AchievementBadges';

const App = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatsBar />
      <AchievementBadges />
    </View>
  );
};

export default App;