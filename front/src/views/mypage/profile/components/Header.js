import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const Header = ({ header, isAdding, isEditing, handleAddClick }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant='h6' fontWeight={'bold'}>
      {header}
    </Typography>
    {isEditing ? (
      <Button variant='outlined' color='primary' onClick={handleAddClick}>
        수정
      </Button>
    ) : (
      <Button variant='outlined' onClick={handleAddClick} disabled={isEditing}>
        추가
      </Button>
    )}
  </Box>
)

export default Header