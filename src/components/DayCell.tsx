import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { getScoreColor } from '../utils/colors';
import { ScoreBadge } from './ScoreBadge';
import type { Entry } from '../store/appStore';

import { Dayjs } from 'dayjs';

export interface DayCellProps {
  day: Dayjs;
  entry: Entry | null;
  isToday: boolean;
  onClick: () => void;
}

export const DayCell: React.FC<DayCellProps> = ({ day, entry, isToday, onClick }) => {
  // エントリーからスコアを取得（月別取得時に既に評価スコアが含まれている）
  const score = entry?.score || null;
  const backgroundColor = score ? getScoreColor(score) : '#f9f9f9';
  return (
    <Paper
      elevation={isToday ? 3 : 1}
      sx={{
        height: 80,
        cursor: 'pointer',
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        padding: 1,
        position: 'relative',
        '&:hover': {
          elevation: 3,
          transform: 'scale(1.02)',
        },
        transition: 'transform 0.2s ease-in-out',
        border: isToday ? '2px solid #1976d2' : 'none'
      }}
      onClick={onClick}
    >
      {/* Date number */}
      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          top: { xs: 2, sm: 4 },
          right: { xs: 4, sm: 6 },
          fontWeight: isToday ? 'bold' : 'normal',
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}
      >
        {day.date()}
      </Typography>

      {/* Score badge */}
      {entry?.score && (
        <Box sx={{ 
          position: 'absolute', 
          top: { xs: "50%", sm: 4},
          left: { xs: "50%", sm: 4 },
          transform: { xs: "translate(-50%, -50%)", sm: "none"},
        }}>
          <ScoreBadge score={entry.score} size="small" />
        </Box>
      )}

      {/* Meal indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 4,
          left: 4,
          display: 'flex',
          gap: 0.5
        }}
      >
        {entry?.meals.breakfast && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#ff9800'
            }}
          />
        )}
        {entry?.meals.lunch && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#4caf50'
            }}
          />
        )}
        {entry?.meals.dinner && (
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#3f51b5'
            }}
          />
        )}
      </Box>
    </Paper>
  );
};
