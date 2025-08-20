import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Paper 
} from '@mui/material';
import { 
  ChevronLeft, 
  ChevronRight, 
  Today 
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAppStore } from '../store/appStore';
import { DayCell } from './DayCell';
import { MonthHeatmap } from './MonthHeatmap';
import { MonthStats } from './MonthStats';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const CalendarGrid: React.FC = () => {
  const {
    entries,
    currentMonth,
    setCurrentMonth,
    setSelectedDate,
    fetchEntries
  } = useAppStore();

  useEffect(() => {
    fetchEntries(currentMonth.format('YYYY-MM'));
  }, [currentMonth, fetchEntries]);

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const handleToday = () => {
    setCurrentMonth(dayjs());
  };

  const handleDayClick = (date: number) => {
    const clickedDate = currentMonth.date(date).format('YYYY-MM-DD');
    setSelectedDate(clickedDate);
  };

  // Generate calendar days
  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startOfCalendar = startOfMonth.startOf('week');
  const endOfCalendar = endOfMonth.endOf('week');

  const calendarDays = [];
  let current = startOfCalendar;

  while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
    calendarDays.push(current);
    current = current.add(1, 'day');
  }

  const today = dayjs();

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ChevronLeft />
        </IconButton>
        
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {currentMonth.format('YYYY年MM月')}
        </Typography>
        
        <Box>
          <IconButton onClick={handleToday} title="今日に戻る">
            <Today />
          </IconButton>
          <IconButton onClick={handleNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Weekday headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {WEEKDAYS.map((day, index) => (
          <Box key={index} sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: index === 0 ? '#f44336' : index === 6 ? '#2196f3' : 'inherit' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {calendarDays.map((day, index) => {
          
          const isCurrentMonth = day.month() === currentMonth.month();
          const isToday = day.isSame(today, 'day');
          const entry = entries.find(e => e.date === day.format('YYYY-MM-DD'));

          return (
            <Box key={index}>
              {isCurrentMonth ? (
                <DayCell
                  day={day}
                  entry={entry || null}
                  isToday={isToday}
                  onClick={() => handleDayClick(day.date())}
                />
              ) : (
                <Box sx={{ height: 80, backgroundColor: '#f5f5f5', opacity: 0.3 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Month Heatmap */}
      <MonthHeatmap entries={entries} month={currentMonth} />
      
      {/* Month Statistics */}
      <MonthStats entries={entries} month={currentMonth.format('YYYY年MM月')} />
    </Paper>
  );
};
