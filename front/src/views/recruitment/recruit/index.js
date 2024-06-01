import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { useTeam } from 'src/context/TeamContext'

import RenderList from './RenderList'

const Recruit = () => {
  const { selectedTeams } = useTeam()

  return (
    <Box sx={{ padding: 1 }}>
      <Typography variant='h4' sx={{ my: 4 }}>
        지원한 팀
      </Typography>
      {selectedTeams.length > 0 ? (
        selectedTeams.map(team => <RenderList key={team.id} team={team} showAppliedTime={true} />)
      ) : (
        <Typography>지원한 팀이 없습니다.</Typography>
      )}
    </Box>
  )
}

export default Recruit
