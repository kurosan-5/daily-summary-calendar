import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAppStore } from '../store/appStore';

interface TodayComposerProps {
  open: boolean;
  onClose: () => void;
}

export const TodayComposer: React.FC<TodayComposerProps> = ({ open, onClose }) => {
  const { saveEntry, isLoading, error } = useAppStore();
  const [text, setText] = useState('');
  const [meals, setMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false
  });

  const today = dayjs().format('YYYY-MM-DD');

  const handleSave = async () => {
    if (!text.trim()) {
      return;
    }
    
    await saveEntry(today, text, meals);
    setText('');
    setMeals({ breakfast: false, lunch: false, dinner: false });
    onClose(); // モーダルを閉じる
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    }
  };

  const handleMealChange = (meal: keyof typeof meals) => {
    setMeals(prev => ({
      ...prev,
      [meal]: !prev[meal]
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            今日の記録 ({dayjs().format('YYYY年MM月DD日')})
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="今日の行動や気持ちを自由に書いてください..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 400 }}
          helperText={`${text.length}/400文字 (Ctrl+Enterで保存)`}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            食事
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={meals.breakfast}
                  onChange={() => handleMealChange('breakfast')}
                  sx={{ '& .MuiSvgIcon-root': { color: '#ff9800' } }}
                />
              }
              label="朝食"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={meals.lunch}
                  onChange={() => handleMealChange('lunch')}
                  sx={{ '& .MuiSvgIcon-root': { color: '#4caf50' } }}
                />
              }
              label="昼食"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={meals.dinner}
                  onChange={() => handleMealChange('dinner')}
                  sx={{ '& .MuiSvgIcon-root': { color: '#3f51b5' } }}
                />
              }
              label="夕食"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={!text.trim() || isLoading}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
