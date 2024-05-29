import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

import { useTeam } from 'src/context/TeamContext'

const ProjectDetailModal = ({ open, onClose, project, onApplicationSuccess, onApplicationError }) => {
  const { addTeam } = useTeam() // setSelectedTeam 함수 사용

  const handleApply = () => {
    if (window.confirm('해당 팀에 지원하시겠습니까?')) {
      const result = addTeam(project)
      if (result === 'success') {
        onApplicationSuccess('지원이 완료되었습니다.') // 성공 메시지
        onClose()
      } else if (result === 'already_applied') {
        onApplicationError('이미 지원한 팀입니다.') // 중복 지원 시 경고 메시지
      }
    }
  }

  if (!project) return null

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant='h5' fontWeight='bold'>
          {project.title}
        </Typography>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ width: 380 }}>
        <Grid container flexDirection='column' spacing={5}>
          {/* 상단 섹션 */}
          <Grid container item flexDirection='row' alignItems='center' spacing={2}>
            <Grid item>
              <Box component='img' src={project.image} alt='Project Logo' sx={{ width: '60px' }} mr={3} />
            </Grid>
            <Grid item>
              <Typography variant='h6'>{project.teamName}</Typography>
              <Typography variant='subtitle2'>
                {project.subject} / {project.professor}
              </Typography>
            </Grid>
          </Grid>

          {/* 필요 분야 */}
          <Grid item>
            <Typography variant='subtitle1' fontWeight={'bold'}>
              역할
            </Typography>
            <Box display='flex' flexWrap='wrap' gap={1} mt={1}>
              {project.teamRole.map((role, index) => (
                <Chip key={index} label={role} size='small' />
              ))}
            </Box>
          </Grid>

          {/* 기술 스택 */}
          <Grid item>
            <Typography variant='subtitle1' fontWeight={'bold'}>
              기술 스택
            </Typography>
            <Box display='flex' flexWrap='wrap' gap={1} mt={1}>
              {project.techStack.map((tech, index) => (
                <Chip key={index} label={tech} size='small' />
              ))}
            </Box>
          </Grid>
          {/* 업무 소개 */}
          <Grid item>
            <Typography variant='subtitle1' fontWeight={'bold'}>
              프로젝트 설명
            </Typography>
            {project.teamDescription.map((desc, index) => (
              <Typography key={index} variant='body2'>
                - {desc}
              </Typography>
            ))}
          </Grid>
        </Grid>

        <Box mx={5} mt={6} mb={2} display='flex' justifyContent='space-between'>
          <Button onClick={handleApply} sx={{ mt: 2 }} variant='contained'>
            지원하기
          </Button>
          <Button onClick={onClose} sx={{ mt: 2 }} variant='outlined'>
            닫기
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectDetailModal