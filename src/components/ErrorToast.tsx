import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAppStore } from '../store/appStore';

export const ErrorToast: React.FC = () => {
  const { error, clearError } = useAppStore();

  const handleClose = () => {
    clearError();
  };

  return (
    <Snackbar
      open={!!error}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
    </Snackbar>
  );
};
