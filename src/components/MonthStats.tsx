import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Chip,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Restaurant,
  Assessment
} from '@mui/icons-material';
import type { Entry } from '../store/appStore';
import { getScoreColor } from '../utils/colors';

interface MonthStatsProps {
  entries: Entry[];
  month: string;
}

export const MonthStats: React.FC<MonthStatsProps> = ({ entries, month }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const validEntries = entries.filter(entry => entry.score !== null);
  
  // Calculate statistics
  const scores = validEntries.map(entry => entry.score!);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  
  // Calculate meal completion rate
  const totalMealOpportunities = entries.length * 3; // 3 meals per day
  const completedMeals = entries.reduce((total, entry) => {
    return total + 
      (entry.meals.breakfast ? 1 : 0) + 
      (entry.meals.lunch ? 1 : 0) + 
      (entry.meals.dinner ? 1 : 0);
  }, 0);
  
  const mealCompletionRate = totalMealOpportunities > 0 ? 
    (completedMeals / totalMealOpportunities) * 100 : 0;

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 'bold' }}>
        {month} 月間統計
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
        <Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Assessment sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="subtitle2">平均スコア</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {avgScore.toFixed(1)}
            </Typography>
            <Box 
              sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '50%', 
                backgroundColor: getScoreColor(Math.round(avgScore), isDark),
                margin: '0 auto',
                mt: 1
              }} 
            />
          </Box>
        </Box>
        
        <Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrendingUp sx={{ mr: 1, color: '#4caf50' }} />
              <Typography variant="subtitle2">最高</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              {maxScore}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrendingDown sx={{ mr: 1, color: '#f44336' }} />
              <Typography variant="subtitle2">最低</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
              {minScore}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Restaurant sx={{ mr: 1, color: '#ff9800' }} />
              <Typography variant="subtitle2">食事達成率</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              {mealCompletionRate.toFixed(0)}%
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label={`記録日数: ${entries.length}日`} 
          variant="outlined" 
          size="small" 
        />
        <Chip 
          label={`AI分析済み: ${validEntries.length}日`} 
          variant="outlined" 
          size="small" 
        />
      </Box>
    </Paper>
  );
};
