import React from 'react';
import { Box } from '@mui/material';
import { getScoreColor } from '../utils/colors';

interface ScoreBadgeProps {
  score: number | null;
  size?: 'small' | 'medium' | 'large';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'medium' }) => {
  if (score === null) return null;

  const sizeMap = {
    small: { width: 24, height: 24, fontSize: '0.75rem' },
    medium: { width: 32, height: 32, fontSize: '0.875rem' },
    large: { width: 48, height: 48, fontSize: '1.25rem' }
  };

  const { width, height, fontSize } = sizeMap[size];

  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: '50%',
        backgroundColor: 'white',
        color: "black",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize,
        border: `2px solid ${getScoreColor(score)}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      {score}
    </Box>
  );
};
