import React from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  open, 
  message = '' 
}) => {
  return (
    <Backdrop
      sx={{ 
        color: '#fff', 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
      open={open}
    >
      <CircularProgress color="inherit" size={60} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {message}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          しばらくお待ちください...
        </Typography>
      </Box>
    </Backdrop>
  );
};
