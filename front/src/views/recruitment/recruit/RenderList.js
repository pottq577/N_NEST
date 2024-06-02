import React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import Badge from '@mui/material/Badge'

import EditIcon from '@mui/icons-material/Edit'
import GroupIcon from '@mui/icons-material/Group'
import DeleteIcon from '@mui/icons-material/Delete'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleIcon from '@mui/icons-material/People' // 추가된 부분

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

const RenderList = ({ team, showAppliedTime, onEdit, onDelete, onShowApplicants }) => {
  // 현재 지원자 수를 가져오기 위한 예시 데이터 (실제 데이터는 props나 상태에서 받아와야 함)
  const applicantCount = 3 // 임시로 3명의 지원자가 있다고 가정

  return (
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
        <Box>
          <IconButton onClick={() => onShowApplicants(team)}>
            <Badge badgeContent={applicantCount} color='primary'>
              <PeopleIcon sx={{ mr: 3 }} />
            </Badge>
          </IconButton>
          <IconButton onClick={() => onEdit(team)}>
            <EditIcon sx={{ mr: 3 }} />
          </IconButton>
          <IconButton onClick={() => onDelete(team.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  )
}

export default RenderList
