import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// import EditIcon from '@mui/icons-material/Edit'
// import IconButton from '@mui/material/IconButton'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 100,
  height: 100,
  border: '10'
}))

const ProfileSection = () => {
  const [imgSrc, setImgSrc] = useState('/images/avatars/1.png')

  return (
    <Grid container spacing={2} alignItems='center'>
      <Grid item xs={9}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            minHeight: 100
          }}
        >
          <Typography variant='h4'>홍길동</Typography>
          <Typography variant='body1'>honggildong@example.com</Typography>
          <Typography variant='body1'>github.com/honggildong</Typography>
        </Box>
      </Grid>
      <Grid item xs={3}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <ImgStyled src={imgSrc} alt='프로필 사진' />
          {/* <IconButton color='primary' aria-label='edit profile'>
            <EditIcon />
          </IconButton> */}
        </Box>
      </Grid>
    </Grid>
  )
}

const EducationSection = () => {
  const [educations, setEducations] = useState([])
  const [newEducation, setNewEducation] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const addEducation = () => {
    setIsAdding(true)
  }

  const saveEducation = () => {
    if (newEducation.trim()) {
      setEducations([...educations, newEducation.trim()])
    }
    setNewEducation('')
    setIsAdding(false)
  }

  const cancelAddEducation = () => {
    setNewEducation('')
    setIsAdding(false)
  }

  return (
    <Box sx={{ width: '100%', minHeight: 150 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6'>학력</Typography>
        {!isAdding && (
          <Button variant='outlined' onClick={addEducation}>
            추가
          </Button>
        )}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Box sx={{ mt: 2 }} style={{ padding: 10 }}>
        {educations.map((education, index) => (
          <Typography key={index} variant='body1'>
            • {education}
          </Typography>
        ))}
        {isAdding && (
          <>
            <TextField
              fullWidth
              variant='outlined'
              label='학력 추가'
              value={newEducation}
              onChange={e => setNewEducation(e.target.value)}
              margin='normal'
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button sx={{ mr: 1 }} variant='outlined' onClick={cancelAddEducation}>
                취소
              </Button>
              <Button variant='contained' color='primary' onClick={saveEducation}>
                저장
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

const SummarySection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary
}))

const Career = () => {
  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 3 }}>
      <Grid container spacing={2} justifyContent='center'>
        {/* 좌측 상세 정보 섹션 */}
        <Grid item xs={12} md={8}>
          {/* 프로필 섹션 */}
          <ProfileSection />
          <Box sx={{ my: 10 }} />

          {/* 학력 섹션 */}
          <EducationSection />
          <Box sx={{ my: 10 }} />

          {/* 경력 섹션 */}
          <EducationSection />
          <Box sx={{ my: 10 }} />

          {/* 스킬 섹션 */}
          <Box sx={{ my: 10 }} />
          <EducationSection />
        </Grid>
        {/* 우측 요약 정보 섹션 */}
        <Grid item xs={12} md={4}>
          <SummarySection elevation={3}>
            <Typography variant='h5' component='h2' gutterBottom>
              이력서 완성도
            </Typography>

            <Divider sx={{ my: 2 }} />
            <Typography variant='body1' gutterBottom>
              honggildong@example.com
            </Typography>
            <Typography variant='body1' gutterBottom>
              github.com/honggildong
            </Typography>
            {/* 요약 정보에 추가할 내용 */}
          </SummarySection>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Career
