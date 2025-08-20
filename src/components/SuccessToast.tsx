import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAppStore } from '../store/appStore';

export const SuccessToast: React.FC = () => {
  const { successMessage, clearSuccessMessage } = useAppStore();

  const handleClose = () => {
    clearSuccessMessage();
  };

  return (
    <Snackbar
      open={!!successMessage}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
        {successMessage}
      </Alert>
    </Snackbar>
  );
};
