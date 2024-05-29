import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from 'lib/firebase'

const StyledProfileSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'left',
  color: theme.palette.text.primary,
  borderRadius: theme.shape.borderRadius * 2
}))

const calculateMonthsBetweenDates = (startDate, endDate = new Date()) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startYear = start.getFullYear()
  const startMonth = start.getMonth()
  const endYear = end.getFullYear()
  const endMonth = end.getMonth()

  let months = (endYear - startYear) * 12 + (endMonth - startMonth)

  return months - 12
}

const ProfileSection = () => {
  const [profileData, setProfileData] = useState({
    name: '홍길동', // 기본값 설정
    email: 'honggildong@example.com' // 기본값 설정
  })
  const router = useRouter()
  const [developFields, setDevelopFields] = useState([])
  const [skills, setSkills] = useState([])
  const [careerDetails, setCareerDetails] = useState([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadData = key => JSON.parse(localStorage.getItem(key)) || []
      setDevelopFields(loadData('developFields'))
      setSkills(loadData('skills'))
      setCareerDetails(loadData('careerDetails'))
    }
    const storedProfileData = JSON.parse(localStorage.getItem('profileData'))
    if (storedProfileData) {
      setProfileData(storedProfileData)
    }

    // Firebase Auth 상태 변경 처리
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        console.log(user)
        const githubUsername = user.reloadUserInfo.screenName
        const githubUrl = `https://github.com/${githubUsername}`
        setProfileData(prevData => ({
          ...prevData,
          name: user.displayName,
          email: user.email,
          github: githubUrl
        }))
      }
    })

    return () => unsubscribe()
  }, [])

  const handleCreateTeamClick = () => {
    router.push('/teams/make-team')
  }

  const handleProfileEnrollClick = () => {
    router.push('/mypage?tab=ProfileManage')
  }

  const totalExperienceMonths = careerDetails.reduce((total, career) => {
    const months = calculateMonthsBetweenDates(career.developStart, career.leaveDate || new Date())

    return total + months
  }, 0)

  return (
    <Grid item xs={4}>
      <StyledProfileSection elevation={3}>
        {/* 상단 프로필 정보 */}
        <Box display='flex' justifyContent='space-between' alignItems='center' mx={5} my={3}>
          <Typography variant='h6' fontWeight='bold'>
            내 프로필
          </Typography>
          <Box display='flex' alignItems='center'>
            <Typography variant='body2' mr={1}>
              포지션 제안받기
            </Typography>
            <Switch />
          </Box>
        </Box>
        <Divider />

        {/* 프로필 데이터 */}
        <Box mx={5} my={5}>
          <Box display='flex' justifyContent='space-between'>
            <Box>
              <Typography variant='h6' gutterBottom>
                {profileData.name}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                {profileData.email}
              </Typography>
            </Box>
            <Box>
              <CircularProgress variant='determinate' value={20} size={60} />
              {/* <Typography variant='body1'>20%</Typography> */}
            </Box>
          </Box>
          <Box mt={2} mb={1}>
            <Typography variant='subtitle1' color='primary' fontWeight='500'>
              희망 직무
            </Typography>
            <Typography variant='body2'>{developFields.length > 0 ? developFields.join(', ') : '-'}</Typography>
          </Box>
          <Divider />
          <Box mb={1}>
            <Typography variant='subtitle1' color='primary' fontWeight='500'>
              주요 기술
            </Typography>
            <Typography variant='body2'>{skills.length > 0 ? skills.join(', ') : '-'}</Typography>
          </Box>
          <Divider />
          <Box mb={1}>
            <Typography variant='subtitle1' color='primary' fontWeight='500'>
              개발 경력
            </Typography>
            <Typography variant='body2'>
              {careerDetails.length > 0 ? (
                <Typography variant='body2'>{totalExperienceMonths}개월</Typography>
              ) : (
                <Typography variant='body2'>-</Typography>
              )}
            </Typography>
          </Box>
        </Box>

        {/* 버튼 */}
        <Box mx={5} mt={6} mb={2} display='flex' justifyContent='space-between'>
          <Button variant='contained'>
            <Typography variant='button' fontSize={15} color='white' onClick={handleProfileEnrollClick}>
              프로필 작성
            </Typography>
          </Button>
          <Button variant='contained'>
            <Typography variant='button' fontSize={15} color='white' onClick={handleCreateTeamClick}>
              팀원 모집하기
            </Typography>
          </Button>
        </Box>
      </StyledProfileSection>
    </Grid>
  )
}

export default ProfileSection