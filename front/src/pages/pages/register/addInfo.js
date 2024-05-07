import React, { useState, useEffect } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import { useRouter } from 'next/router' // Next.js의 useRouter import

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

const AddInfoPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    schoolEmail: '',
    age: '', // 숫자 입력 예정이라도 초기값은 문자열로 할 수 있습니다.
    contact: ''
  })

  const [githubInfo, setGithubInfo] = useState({
    githubUsername: '',
    githubName: '',
    githubId: ''
  })

  const router = useRouter() // useRouter 훅 사용

  useEffect(() => {
    // 세션에서 깃허브 정보 가져오기
    const fetchGithubInfo = async () => {
      const response = await fetch('http://localhost:8000/api/session/github-info', {
        credentials: 'include' // 쿠키 포함 설정
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
    console.log(completeInfo) // 로그 출력
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
        router.push('http://localhost:3000/pages/login/') // 로그인 페이지로 리디렉션
      } else {
        alert('추가 정보 저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('추가 정보 저장 중 에러 발생:', error)
    }
  }

  return (
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
        추가 사용자 정보 입력🚀
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label='Name'
          variant='outlined'
          name='name'
          value={userInfo.name}
          onChange={handleChange}
          sx={{ mb: 2, width: '300px' }}
        />
        <TextField
          label='School Email Address'
          variant='outlined'
          name='schoolEmail'
          value={userInfo.schoolEmail}
          onChange={handleChange}
          sx={{ mb: 2, width: '300px' }}
        />
        <TextField
          label='Age'
          variant='outlined'
          name='age'
          type='number'
          value={userInfo.age}
          onChange={handleChange}
          sx={{ mb: 2, width: '300px' }}
        />
        <TextField
          label='Contact Number'
          variant='outlined'
          name='contact'
          value={userInfo.contact}
          onChange={handleChange}
          sx={{ mb: 2, width: '300px' }}
        />
        <TextField
          label='GitHub Username'
          variant='outlined'
          InputProps={{
            readOnly: true
          }}
          value={githubInfo.githubUsername || 'Loading...'}
          sx={{ mt: 2, mb: 2, width: '300px' }}
        />
        <TextField
          label='GitHub Name'
          variant='outlined'
          InputProps={{
            readOnly: true
          }}
          value={githubInfo.githubName || 'Loading...'}
          sx={{ mb: 2, width: '300px' }}
        />
        <TextField
          label='GitHub Id'
          variant='outlined'
          InputProps={{
            readOnly: true
          }}
          value={githubInfo.githubId || 'Loading...'}
          sx={{ mb: 2, width: '300px' }}
        />
        <Button type='submit' variant='contained' color='primary' sx={{ mt: 2 }}>
          정보 저장
        </Button>
      </form>
    </Box>
  )
}

AddInfoPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default AddInfoPage
