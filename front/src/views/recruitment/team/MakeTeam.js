import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import { styled } from '@mui/material/styles'

import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

import TeamInputField from '../TeamInputField'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 150,
  height: 150,
  border: '10'
}))

const MakeTeam = () => {
  const [teamData, setTeamData] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const router = useRouter()
  const defaultImg = '/images/cards/logo-bitbank.png'
  const [imgSrc, setImgSrc] = useState(defaultImg)
  const fileInputRef = useRef(null)

  const onImgChange = event => {
    const reader = new FileReader()
    const { files } = event.target
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result)
      reader.readAsDataURL(files[0])
    }
  }

  const onImgEditClick = () => {
    fileInputRef.current.click()
  }

  const onImgDeleteClick = () => {
    if (window.confirm('프로필 사진을 기본값으로 초기화합니다.')) {
      setImgSrc(defaultImg)
    }
  }

  const ProjectImg = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
      }}
    >
      <ImgStyled src={imgSrc} alt='프로젝트 사진' />
      <input
        type='file'
        onChange={onImgChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
        accept='image/*' // 파일 선택기에 이미지만 표시
      />
      <IconButton id='edit' color='primary' aria-label='edit profile' onClick={onImgEditClick}>
        <EditIcon />
      </IconButton>
      <IconButton id='edit' color='primary' aria-label='edit profile' onClick={onImgDeleteClick}>
        <DeleteIcon />
      </IconButton>
    </Box>
  )

  const handleSubmit = async event => {
    event.preventDefault()

    const newTeam = {
      id: Date.now(),
      image: imgSrc, // 예시 이미지 경로
      title: teamData.teamTitle,
      subject: teamData.teamSubject,
      professor: teamData.teamProfessor,
      teamName: teamData.teamName,
      teamDescription: teamData.teamDescription.split(',').map(desc => desc.trim()),
      techStack: teamData.techStack.split(',').map(tech => tech.trim()),
      teamRole: teamData.teamRole.split(',').map(role => role.trim()),
      registeredTime: new Date(),
      maxHead: teamData.maxHead
    }

    const teams = JSON.parse(localStorage.getItem('teams')) || []
    teams.push(newTeam)
    localStorage.setItem('teams', JSON.stringify(teams))

    setSnackbarOpen(true)
    setTimeout(() => {
      router.push('/teams', { query: { alert: 'success' } })
    }, 2000)
  }

  return (
    <Container>
      <Typography variant='h4'>팀 만들기</Typography>
      <Paper component='form' onSubmit={handleSubmit} elevation={0} sx={{ p: 3, bgcolor: 'inherit' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Card sx={{ bgcolor: 'inherit', boxShadow: 'none' }}>
              <CardContent>
                <TeamInputField teamData={teamData} setTeamData={setTeamData} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <ProjectImg />
            <Button type='submit' variant='contained' color='primary' sx={{ mt: 5 }}>
              팀 생성하기
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default MakeTeam
