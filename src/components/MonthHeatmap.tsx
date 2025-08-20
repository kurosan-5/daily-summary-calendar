import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Dayjs } from 'dayjs';
import type { Entry } from '../store/appStore';

interface MonthHeatmapProps {
  entries: Entry[];
  month: Dayjs;
}

export const MonthHeatmap: React.FC<MonthHeatmapProps> = ({ entries, month }) => {
  const endOfMonth = month.endOf('month');
  const daysInMonth = endOfMonth.date();
  const firstDayOfMonth = month.startOf('month');
  const startDayOfWeek = firstDayOfMonth.day(); // 0=Sunday, 1=Monday, ..., 6=Saturday

  const getOutingIntensity = (day: number): number => {
    const dayString = month.year() + '-' + String(month.month() + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const entry = entries.find(e => e.date === dayString);
    return entry?.went_out_level || 0;
  };

  const getIntensityColor = (intensity: number): string => {
    const colors = [
      '#f0f0f0', // 0: 屋内
      '#c6e48b', // 1: 近所
      '#7bc96f', // 2: 複数外出
      '#239a3b'  // 3: 長距離/多拠点
    ];
    return colors[intensity] || colors[0];
  };

  // Create 7x6 grid (42 cells) to fit 31 days in calendar format
  const gridCells = [];
  
  // Add empty cells for days before the 1st of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    gridCells.push(
      <Box
        key={`empty-${i}`}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0'
        }}
      />
    );
  }
  
  // Add cells for actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const intensity = getOutingIntensity(day);
    gridCells.push(
      <Box
        key={`day-${day}`}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: getIntensityColor(intensity),
          border: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}
      >
        {day}
      </Box>
    );
  }
  
  // Fill remaining cells to complete the grid
  const remainingCells = 42 - (startDayOfWeek + daysInMonth);
  for (let i = 0; i < remainingCells; i++) {
    gridCells.push(
      <Box
        key={`empty-end-${i}`}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f9f9f9',
          border: '1px solid #e0e0e0'
        }}
      />
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 'bold' }}>
        外出ヒートマップ
      </Typography>
      
      {/* Day of week headers */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1,
        mb: 1
      }}>
        {['日', '月', '火', '水', '木', '金', '土'].map((dayName, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              color: '#666',
              height: 20,
            }}
          >
            <Typography variant="caption" sx={{fontWeight: 'bold', color: index === 0 ? '#f44336' : index === 6 ? '#2196f3' : 'inherit'}}>
              {dayName}
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1,
        height: 140
      }}>
        {gridCells}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 2 }}>
        <Typography variant="caption">外出度:</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#f0f0f0', border: '1px solid #e0e0e0' }} />
          <Typography variant="caption">屋内</Typography>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#c6e48b', border: '1px solid #e0e0e0' }} />
          <Typography variant="caption">近所</Typography>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#7bc96f', border: '1px solid #e0e0e0' }} />
          <Typography variant="caption">複数</Typography>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#239a3b', border: '1px solid #e0e0e0' }} />
          <Typography variant="caption">多拠点</Typography>
        </Box>
      </Box>
    </Paper>
  );
};
