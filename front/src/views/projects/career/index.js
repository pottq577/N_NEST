import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'

import { styled } from '@mui/material/styles'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'

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
            minHeight: 150
          }}
        >
          <Typography variant='h4'>홍길동</Typography>
          <Typography variant='body1'>honggildong@example.com</Typography>
          <Typography variant='body1'>github.com/honggildong</Typography>
        </Box>
      </Grid>
      <Grid item xs={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <ImgStyled src={imgSrc} alt='프로필 사진' />
          <IconButton id='edit' color='primary' aria-label='edit profile'>
            <EditIcon />
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  )
}

const EducationSection = () => {
  const [educationDetails, setEducationDetails] = useState({
    type: '',
    name: '',
    major: '',
    status: '',
    startDate: null,
    endDate: null
  })
  const [educations, setEducations] = useState([])
  const [isAdding, setIsAdding] = useState(false)

  const handleAddClick = () => {
    setIsAdding(true)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setEducationDetails({
      ...educationDetails,
      [name]: value
    })
  }

  const saveEducation = () => {
    setEducations([...educations, educationDetails])
    setIsAdding(false)
    setEducationDetails({
      type: '',
      name: '',
      major: '',
      status: '',
      startDate: null,
      endDate: null
    })
    console.log(educationDetails)
  }

  const cancelEducation = () => {
    setIsAdding(false)
    setEducationDetails({
      type: '',
      name: '',
      major: '',
      status: '',
      startDate: null,
      endDate: null
    })
  }

  const educationType = type => {
    const types = {
      college: '대학 (2,3년)',
      university: '대학교 (4년)',
      masters: '대학원(석사)',
      phd: '대학원(박사)'
    }

    return types[type] || ''
  }

  const graduationStatus = status => {
    const statuses = {
      graduated: '졸업',
      enrolled: '재학',
      leaveOfAbsence: '휴학',
      completion: '수료',
      dropOut: '중퇴',
      withdrawal: '자퇴',
      expectedGraduation: '졸업예정'
    }

    return statuses[status] || ''
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6'>학력</Typography>
        <Button variant='outlined' onClick={handleAddClick}>
          추가
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box style={{ minHeight: 100 }}>
        {isAdding && (
          <Grid container spacing={2}>
            {/* 대학 구분 선택 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='type-label'>대학 구분</InputLabel>
                <Select
                  labelId='type-label'
                  id='type'
                  name='type'
                  value={educationDetails.type}
                  label='대학 구분'
                  onChange={handleChange}
                >
                  <MenuItem value={'college'}>대학 (2,3년)</MenuItem>
                  <MenuItem value={'university'}>대학교 (4년)</MenuItem>
                  <MenuItem value={'masters'}>대학원(석사)</MenuItem>
                  <MenuItem value={'phd'}>대학원(박사)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* 학교명 입력 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id='name'
                name='name'
                label='학교명'
                value={educationDetails.name}
                onChange={handleChange}
              />
            </Grid>
            {/* 전공 입력 */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id='major'
                name='major'
                label='전공'
                value={educationDetails.major}
                onChange={handleChange}
              />
            </Grid>
            {/* 졸업 여부 */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id='status-label'>졸업 여부</InputLabel>
                <Select
                  labelId='status-label'
                  id='status'
                  name='status'
                  value={educationDetails.status}
                  label='졸업 여부'
                  onChange={handleChange}
                >
                  <MenuItem value={'graduated'}>졸업</MenuItem>
                  <MenuItem value={'enrolled'}>재학</MenuItem>
                  <MenuItem value={'leaveOfAbsence'}>휴학</MenuItem>
                  <MenuItem value={'completion'}>수료</MenuItem>
                  <MenuItem value={'dropOut'}>중퇴</MenuItem>
                  <MenuItem value={'withdrawal'}>자퇴</MenuItem>
                  <MenuItem value={'expectedGraduation'}>졸업예정</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={{ mt: 12 }}>
              <Button variant='contained' onClick={saveEducation}>
                저장
              </Button>

              <Button variant='contained' onClick={cancelEducation}>
                취소
              </Button>
            </Grid>
          </Grid>
        )}

        <List style={{ justifyContent: 'flex-start' }}>
          {educations.map((education, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${educationType(education.type)} | ${education.startDate} ~ ${
                  education.endDate
                } (${graduationStatus(education.status)})`}
                secondary={`${education.name} / ${education.major}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge='end' aria-label='edit'>
                  <EditIcon />
                </IconButton>
                <IconButton edge='end' aria-label='delete'>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
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
          <EducationSection />
          <Box sx={{ my: 10 }} />
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
