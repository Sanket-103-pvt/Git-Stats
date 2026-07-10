// StatsBar.jsx

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AchievementBadges } from './AchievementBadges';

const StatsBar = () => {
  const theme = useTheme();

  return (
    <View style={{ padding: 16, backgroundColor: theme.colors.background }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Stats</Text>
      <AchievementBadges />
    </View>
  );
};

export default StatsBar;