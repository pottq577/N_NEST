import React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'

import EditIcon from '@mui/icons-material/Edit'
import GroupIcon from '@mui/icons-material/Group'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

const formatDate = date => {
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const RenderList = ({ team, showAppliedTime, onEdit, onDelete }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        {/* 제목 및 과목/교수 정보 */}
        <Typography variant='body1' component='div' sx={{ fontWeight: 'bold', display: 'inline', mr: 3 }}>
          {team.title}
        </Typography>
        <Typography variant='body2' color='textSecondary' component='span' sx={{ display: 'inline' }}>
          {team.subject} / {team.professor}
        </Typography>
        {/* 팀명 및 회사 아이콘 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
          <GroupIcon sx={{ mr: 0.5 }} />
          <Typography sx={{ display: 'inline', fontSize: '0.875rem', mr: 3 }}>{team.teamName}</Typography>
          <AccessTimeIcon sx={{ mr: 0.5 }} />
          <Typography sx={{ display: 'inline', fontSize: '0.875rem' }}>
            {formatDate(new Date(showAppliedTime ? team.appliedTime : team.registeredTime))}
          </Typography>
        </Box>
      </Box>
      {showAppliedTime ? (
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      ) : (
        <Box>
          <IconButton onClick={() => onEdit(team)}>
            <EditIcon sx={{ mr: 3 }} />
          </IconButton>
          <IconButton onClick={() => onDelete(team.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </CardContent>
  </Card>
)

export default RenderList