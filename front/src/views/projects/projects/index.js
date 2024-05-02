import React, { useEffect, useState } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Typography,
  IconButton,
  Link,
  Modal,
  Box,
  Button,
  Grid
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useRouter } from 'next/router' // Next.js Router import

const UserProjectsPage = () => {
  const [userLogins, setUserLogins] = useState({})
  const [userRepos, setUserRepos] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [selectedRepoName, setSelectedRepoName] = useState('')
  const router = useRouter() // Next.js Router instance

  useEffect(() => {
    // 사용자 로그인 정보 가져오기
    fetch('http://localhost:8000/user-logins')
      .then(response => response.json())
      .then(data => {
        setUserLogins(data)
      })
      .catch(error => console.error('Error fetching user logins:', error))
  }, [])

  // 사용자 레포지토리 가져오기
  const fetchUserRepos = username => {
    fetch(`https://api.github.com/users/${username}/repos`)
      .then(response => response.json())
      .then(data => {
        setUserRepos(data)
      })
      .catch(error => console.error('Error fetching user repos:', error))
  }

  // 유저네임을 클릭했을 때 해당 유저의 레포지토리 가져오기
  const handleClickUsername = username => {
    fetchUserRepos(username)
  }

  // 모달 열기
  const handleOpenModal = () => {
    setOpenModal(true)
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setOpenModal(false)
  }

  // 레포지토리 추가 모달 열기
  const handleOpenRepoModal = repoName => {
    setSelectedRepoName(repoName)
    setOpenModal(true)
  }

  // 문서 생성 페이지로 이동
  const handleNavigateToDocumentUpload = () => {
    handleCloseModal() // 모달 닫기
    router.push('/document/upload') // 문서 업로드 페이지로 이동
  }

  return (
    <div>
      <h1>User Projects Page</h1>
      <List>
        {Object.entries(userLogins).map(([id, username]) => (
          <ListItem key={id} onClick={() => handleClickUsername(username)} button>
            <ListItemText primary={`ID: ${id}, Username: ${username}`} />
          </ListItem>
        ))}
      </List>

      <h2>User Repositories</h2>
      {userRepos.map(repo => (
        <Card key={repo.id} style={{ marginBottom: '10px', position: 'relative' }}>
          <CardContent>
            <Typography variant='h6'>{repo.name}</Typography>
            <Typography>{repo.description}</Typography>
            <Typography>
              Language: {repo.language}, Stars: {repo.stargazers_count}
            </Typography>
            <Typography>Last Updated: {new Date(repo.updated_at).toLocaleDateString()}</Typography>
            <Typography>
              URL:{' '}
              <Link href={repo.html_url} target='_blank' rel='noopener noreferrer' color='primary'>
                {repo.html_url}
              </Link>
            </Typography>
          </CardContent>
          <IconButton
            style={{ position: 'absolute', top: '5px', right: '5px' }}
            aria-label='Add'
            onClick={() => handleOpenRepoModal(repo.name)}
          >
            <Add />
          </IconButton>
        </Card>
      ))}

      {/* 모달 */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 600,
            bgcolor: 'background.paper',
            borderRadius: '8px', // 둥근 모서리 적용
            boxShadow: 24,
            p: 4
          }}
        >
          <Typography variant='h5' gutterBottom align='center'>
            Repository: {selectedRepoName} 웹에 등록하기
            <br />
            <Typography variant='body2' component='span' color='error'>
              등록시 모두가 해당 내용을 볼 수 있습니다.
            </Typography>
          </Typography>
          <Grid container spacing={2} justifyContent='center'>
            <Grid item>
              <Button
                variant='contained'
                onClick={handleNavigateToDocumentUpload} // 문서 업로드 페이지로 이동
                sx={{ mr: 2 }}
              >
                문서 생성
              </Button>
            </Grid>
            <Grid item>
              <Button variant='contained' onClick={handleNavigateToDocumentUpload}>
                기존 문서 등록
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  )
}

export default UserProjectsPage
