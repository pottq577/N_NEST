import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const EmptyMessage = ({ message }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
    <Typography variant='body1'>{message}</Typography>
  </Box>
)

export default EmptyMessage