import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

import TeamSection from '../team/TeamSection'
import ProfileSection from './ProfileSection'

const index = () => {
  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 3, padding: 7 }}>
      <Grid container spacing={10}>
        <TeamSection />
        <ProfileSection />
      </Grid>
    </Box>
  )
}

export default index