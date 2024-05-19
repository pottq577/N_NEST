import React, { useState, useEffect } from 'react'
import { Box, TextField, Button, Typography, Container, Grid, Card, CardContent } from '@mui/material'
import { useRouter } from 'next/router'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

const AddInfoPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    schoolEmail: '',
    studentId: '', // 학번 입력 필드 추가
    age: '',
    contact: ''
  })

  const [githubInfo, setGithubInfo] = useState({
    githubUsername: '',
    githubName: '',
    githubId: ''
  })

  const router = useRouter()

  useEffect(() => {
    const fetchGithubInfo = async () => {
      const response = await fetch('http://localhost:8000/api/session/github-info', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setGithubInfo({
          githubUsername: data.github_username,
          githubName: data.github_name,
          githubId: data.github_id
        })
      }
    }
    fetchGithubInfo()
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setUserInfo({
      ...userInfo,
      [name]: value
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const completeInfo = {
      ...userInfo,
      ...githubInfo
    }
    console.log(completeInfo)
    try {
      const response = await fetch('http://localhost:8000/api/user/additional-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeInfo)
      })

      if (response.ok) {
        alert('추가 정보가 성공적으로 저장되었습니다.')
        router.push('http://localhost:3000/pages/login/')
      } else {
        const errorData = await response.json()
        alert(`추가 정보 저장에 실패했습니다: ${errorData.detail}`)
      }
    } catch (error) {
      console.error('추가 정보 저장 중 에러 발생:', error)
      alert('추가 정보 저장 중 에러가 발생했습니다.')
    }
  }

  return (
    <Container component='main' maxWidth='sm'>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh'
            }}
          >
            <Typography variant='h4' sx={{ mb: 4 }}>
              추가 사용자 정보 입력 🚀
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label='Name'
                    variant='outlined'
                    name='name'
                    value={userInfo.name}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label='School Email Address'
                    variant='outlined'
                    name='schoolEmail'
                    value={userInfo.schoolEmail}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label='Student ID'
                    variant='outlined'
                    name='studentId'
                    value={userInfo.studentId}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label='Age'
                    variant='outlined'
                    name='age'
                    type='number'
                    value={userInfo.age}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label='Contact Number'
                    variant='outlined'
                    name='contact'
                    value={userInfo.contact}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label='GitHub Username'
                    variant='outlined'
                    InputProps={{
                      readOnly: true
                    }}
                    value={githubInfo.githubUsername || 'Loading...'}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label='GitHub Name'
                    variant='outlined'
                    InputProps={{
                      readOnly: true
                    }}
                    value={githubInfo.githubName || 'Loading...'}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label='GitHub Id'
                    variant='outlined'
                    InputProps={{
                      readOnly: true
                    }}
                    value={githubInfo.githubId || 'Loading...'}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Button type='submit' variant='contained' color='primary' sx={{ mt: 3 }}>
                정보 저장
              </Button>
            </form>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}

AddInfoPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default AddInfoPage
