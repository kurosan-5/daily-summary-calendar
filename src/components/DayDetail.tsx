import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Collapse,
  IconButton,
  Alert,
  Button
} from '@mui/material';
import { ExpandMore, ExpandLess, Restaurant, Place, Refresh, Add } from '@mui/icons-material';
import { ScoreBadge } from './ScoreBadge';
import { EntryComposer } from './EntryComposer';
import { useAppStore } from '../store/appStore';
import dayjs from 'dayjs';

interface DayDetailProps {
  date: string;
  onClose: () => void;
}

export const DayDetail: React.FC<DayDetailProps> = ({ date, onClose }) => {
  const { entryDetail, fetchEntryDetail, isLoading, saveEntry } = useAppStore();
  const [showOriginalText, setShowOriginalText] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  useEffect(() => {
    fetchEntryDetail(date);
  }, [date, fetchEntryDetail]);

  const handleReEvaluate = async () => {
    if (entryDetail?.entry) {
      await saveEntry(date, entryDetail.entry.raw_text, entryDetail.entry.meals);
      await fetchEntryDetail(date);
    }
  };

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
        <Typography>読み込み中...</Typography>
      </Paper>
    );
  }

  if (!entryDetail) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {dayjs(date).format('YYYY年MM月DD日')}
          </Typography>
          <IconButton onClick={onClose}>
            ×
          </IconButton>
        </Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          この日の記録はありません
        </Alert>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateModal(true)}
          sx={{ mt: 2 }}
        >
          記録を作成
        </Button>

        <EntryComposer 
          open={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            fetchEntryDetail(date); // 記録作成後に再読み込み
          }}
          date={date}
        />
      </Paper>
    );
  }

  const { entry, evaluation } = entryDetail;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {dayjs(date).format('YYYY年MM月DD日')}
          </Typography>
          {evaluation && <ScoreBadge score={evaluation.score} size="large" />}
        </Box>
        <IconButton onClick={onClose}>
          ×
        </IconButton>
      </Box>

      {evaluation ? (
        <>
          {/* AI Summary */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                AI要約
              </Typography>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={handleReEvaluate}
                disabled={isLoading}
                variant="outlined"
              >
                再評価
              </Button>
            </Box>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {evaluation.summary}
            </Typography>
          </Box>

          {/* Meals */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
              食事
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {entry.meals.breakfast && (
                <Chip
                  icon={<Restaurant />}
                  label="朝食"
                  size="small"
                  sx={{ backgroundColor: '#ff9800', color: 'white' }}
                />
              )}
              {entry.meals.lunch && (
                <Chip
                  icon={<Restaurant />}
                  label="昼食"
                  size="small"
                  sx={{ backgroundColor: '#4caf50', color: 'white' }}
                />
              )}
              {entry.meals.dinner && (
                <Chip
                  icon={<Restaurant />}
                  label="夕食"
                  size="small"
                  sx={{ backgroundColor: '#3f51b5', color: 'white' }}
                />
              )}
            </Box>
          </Box>

          {/* Places */}
          {evaluation.places.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
                行った場所
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {evaluation.places.map((place, index) => (
                  <Chip
                    key={index}
                    icon={<Place />}
                    label={place}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Tags */}
          {evaluation.tags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
                考えたこと・キーワード
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {evaluation.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
        </>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          AI分析が完了していません
        </Alert>
      )}

      {/* Original Text */}
      <Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => setShowOriginalText(!showOriginalText)}
        >
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            元のテキスト
          </Typography>
          <IconButton size="small">
            {showOriginalText ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={showOriginalText}>
          <Box sx={{ mt: 1, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {entry.raw_text}
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};
