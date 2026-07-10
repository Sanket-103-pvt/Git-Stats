// AchievementBadges.jsx

import React from 'react';
import { Badge, Grid } from '@lucide-react-native';
import { useTheme } from 'react-native-paper';
import { useUserStats } from '../hooks/useUserStats';

const AchievementBadges = () => {
  const { userStats, loading, error } = useUserStats();
  const theme = useTheme();

  if (loading) {
    return <Grid>Loading...</Grid>;
  }

  if (error) {
    return <Grid>Error: {error.message}</Grid>;
  }

  const badges = [
    {
      title: 'Star Collector',
      description: '50+ total stars',
      condition: userStats.totalStars >= 50,
    },
    {
      title: 'Prolific Coder',
      description: '50+ public repos',
      condition: userStats.publicRepos >= 50,
    },
    {
      title: 'Social Butterfly',
      description: '100+ followers',
      condition: userStats.followers >= 100,
    },
    {
      title: 'Polyglot',
      description: '5+ languages used',
      condition: userStats.languagesUsed >= 5,
    },
    {
      title: 'Veteran',
      description: 'account age 5+ years',
      condition: userStats.accountAge >= 5,
    },
    {
      title: 'Open Source Hero',
      description: '10+ forked repos',
      condition: userStats.forkedRepos >= 10,
    },
  ];

  return (
    <Grid>
      {badges.map((badge, index) => (
        <Grid.Item key={index}>
          <Badge
            icon={badge.condition ? 'check-circle' : 'x-circle'}
            size={24}
            color={badge.condition ? theme.colors.success : theme.colors.error}
          />
          <Grid.Text>{badge.title}</Grid.Text>
          <Grid.Text>{badge.description}</Grid.Text>
        </Grid.Item>
      ))}
    </Grid>
  );
};

export default AchievementBadges;