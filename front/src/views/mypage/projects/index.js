import React, { useEffect, useState } from 'react'
import {
  List,
  ListItem,
  Card,
  CardContent,
  Typography,
  IconButton,
  Link,
  Modal,
  Box,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../../lib/firebase'

const UserProjectsPage = () => {
  const [userLogins, setUserLogins] = useState({})
  const [userRepos, setUserRepos] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [currentUsername, setCurrentUsername] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')
  const [currentStudentId, setCurrentStudentId] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [userCourses, setUserCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const githubUsername = user.reloadUserInfo.screenName
        if (githubUsername) {
          try {
            const response = await fetch(`http://localhost:8000/get-user-name/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ githubUsername })
            })
            if (response.ok) {
              const { name, githubId, studentId } = await response.json()
              setCurrentUsername(name)
              setCurrentUserId(githubId)
              setCurrentStudentId(studentId)
              setUserLogins(prev => ({ ...prev, [githubId]: { name, studentId } }))
              fetchUserRepos(githubUsername)
              fetchUserCourses(studentId)
            } else {
              throw new Error('Failed to fetch user name')
            }
          } catch (error) {
            console.error('Error fetching user name:', error.message)
          }
        }
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          providerData: user.providerData,
          username: githubUsername
        })
      } else {
        setCurrentUser(null)
        setCurrentUsername('')
      }
    })

    return () => unsubscribe()
  }, [auth])

  const fetchUserRepos = username => {
    fetch(`https://api.github.com/users/${username}/repos`)
      .then(response => response.json())
      .then(repos => {
        Promise.all(
          repos.map(repo =>
            fetch(repo.contributors_url)
              .then(resp => (resp.ok ? resp.json() : Promise.reject('Failed to load contributors')))
              .then(contributors => ({ ...repo, contributors }))
              .catch(error => {
                console.error('Error fetching contributors:', error)
                return { ...repo, contributors: [] }
              })
          )
        )
          .then(reposWithContributors => setUserRepos(reposWithContributors))
          .catch(error => console.error('Error processing repos:', error))
      })
      .catch(error => console.error('Error fetching user repos:', error))
  }

  const fetchUserCourses = studentId => {
    fetch(`http://localhost:8000/api/user-courses/${studentId}`)
      .then(response => response.json())
      .then(data => setUserCourses(data.courses))
      .catch(error => console.error('Error fetching user courses:', error))
  }

  const handleClickUsername = username => {
    fetchUserRepos(username)
  }

  const handleOpenModal = repo => {
    setSelectedRepo(repo)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleNavigateToDocumentGeneration = () => {
    handleCloseModal()
    router.push({
      pathname: '/document/generation',
      query: {
        name: selectedRepo.name,
        description: selectedRepo.description || 'No description',
        language: selectedRepo.language || 'No info',
        stars: selectedRepo.stargazers_count,
        updatedAt: selectedRepo.updated_at,
        license: selectedRepo.license ? selectedRepo.license.name : 'No license',
        forks: selectedRepo.forks_count,
        watchers: selectedRepo.watchers_count,
        contributors: selectedRepo.contributors
          ? selectedRepo.contributors.map(c => c.login).join(', ')
          : 'No contributors info',
        private: selectedRepo.private ? 'Yes' : 'No',
        html_url: selectedRepo.html_url,
        defaultBranch: selectedRepo.default_branch,
        userId: currentUserId,
        username: currentUsername,
        studentId: currentStudentId,
        course: selectedCourse
      }
    })
  }

  const handleNavigateToDocumentUpload = () => {
    handleCloseModal()
    router.push({
      pathname: '/document/upload',
      query: {
        name: selectedRepo.name,
        description: selectedRepo.description || 'No description',
        language: selectedRepo.language || 'No info',
        stars: selectedRepo.stargazers_count,
        updatedAt: selectedRepo.updated_at,
        license: selectedRepo.license ? selectedRepo.license.name : 'No license',
        forks: selectedRepo.forks_count,
        watchers: selectedRepo.watchers_count,
        contributors: selectedRepo.contributors
          ? selectedRepo.contributors.map(c => c.login).join(', ')
          : 'No contributors info',
        private: selectedRepo.private ? 'Yes' : 'No',
        html_url: selectedRepo.html_url,
        defaultBranch: selectedRepo.default_branch,
        userId: currentUserId,
        username: currentUsername,
        studentId: currentStudentId,
        course: selectedCourse
      }
    })
  }

  return (
    <div>
      <h1>User Projects Page</h1>
      <List>
        {Object.entries(userLogins).map(([githubId, userInfo]) => (
          <ListItem key={githubId} onClick={() => handleClickUsername(userInfo.name)} button>
            <Card
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 2,
                marginBottom: 2,
                backgroundColor: '#f5f5f5',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              <Avatar sx={{ bgcolor: 'primary.main', marginRight: 2 }}>{userInfo.name.charAt(0).toUpperCase()}</Avatar>
              <CardContent>
                <Typography variant='h6'>{userInfo.name}</Typography>
                <Typography variant='body2' color='textSecondary'>
                  <strong>GitHub ID:</strong> {githubId}
                </Typography>
                <Typography variant='body2' color='textSecondary'>
                  <strong>Student ID:</strong> {userInfo.studentId}
                </Typography>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>

      <h2>User Repositories</h2>
      {userRepos.map(repo => (
        <Card key={repo.id} style={{ marginBottom: '10px', position: 'relative' }}>
          <CardContent>
            <Typography variant='h6'>{repo.name}</Typography>
            <Typography>{repo.description || 'No description'}</Typography>
            <Typography>
              Language: {repo.language || 'No info'}, Stars: {repo.stargazers_count}
            </Typography>
            <Typography>Last Updated: {new Date(repo.updated_at).toLocaleDateString()}</Typography>
            <Typography>
              Contributors:{' '}
              {repo.contributors && repo.contributors.length > 0
                ? repo.contributors.map(c => c.login).join(', ')
                : 'No contributors info'}
            </Typography>
            <Typography>
              Watchers: {repo.watchers_count}, Forks: {repo.forks_count}
            </Typography>
            <Typography>Licence: {repo.license ? repo.license.name : 'No license'}</Typography>
            <Typography>Default Branch: {repo.default_branch}</Typography>
            <Typography>Private: {repo.private ? 'Yes' : 'No'}</Typography>
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
            onClick={() => handleOpenModal(repo)}
          >
            <Add />
          </IconButton>
        </Card>
      ))}

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
            borderRadius: '8px',
            boxShadow: 24,
            p: 4
          }}
        >
          <Typography variant='h5' gutterBottom align='center'>
            Repository: {selectedRepo?.name} Web Registration
            <br />
            <Typography variant='body2' component='span' color='error'>
              등록한 해당 정보는 모든 웹 사용자에게 보여집니다.
            </Typography>
          </Typography>
          <FormControl fullWidth sx={{ my: 2 }}>
            <InputLabel id='course-select-label'>Select Course</InputLabel>
            <Select
              labelId='course-select-label'
              value={selectedCourse}
              label='Select Course'
              onChange={e => setSelectedCourse(e.target.value)}
            >
              {userCourses && userCourses.length > 0 ? (
                userCourses.map(course => (
                  <MenuItem key={course.code} value={course.code}>
                    {course.name} - {course.professor} ({course.day}, {course.time})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No courses available</MenuItem>
              )}
              <MenuItem value='none'>선택 안함</MenuItem>
            </Select>
          </FormControl>
          <Grid container spacing={2} justifyContent='center'>
            <Grid item>
              <Button
                variant='contained'
                onClick={handleNavigateToDocumentGeneration}
                sx={{ mr: 2 }}
                disabled={!selectedCourse}
              >
                문서 생성
              </Button>
            </Grid>
            <Grid item>
              <Button variant='contained' onClick={handleNavigateToDocumentUpload} disabled={!selectedCourse}>
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
