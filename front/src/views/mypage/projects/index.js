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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar
} from '@mui/material'
import { Add, Star, ForkRight, Visibility } from '@mui/icons-material'
import { useRouter } from 'next/router' // Next.js Router import
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../../lib/firebase'
import GITHUB_TOKEN_IGNORE from '../../../../ignore'

const languageColors = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c'
}

const UserProjectsPage = () => {
  const [userLogins, setUserLogins] = useState({})
  const [userRepos, setUserRepos] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [currentUsername, setCurrentUsername] = useState('') // 현재 선택된 사용자 이름 저장
  const [currentUserId, setCurrentUserId] = useState('') // 현재 선택된 사용자 ID 저장
  const [currentStudentId, setCurrentStudentId] = useState('') // 현재 선택된 사용자 학번 저장
  const [currentUser, setCurrentUser] = useState(null)
  const [userCourses, setUserCourses] = useState([]) // 사용자의 수업 목록
  const [selectedCourse, setSelectedCourse] = useState('') // 선택된 수업
  const router = useRouter() // Next.js Router instance

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const githubUsername = user.reloadUserInfo.screenName // 예를 들어 GitHub username
        if (githubUsername) {
          // GitHub 사용자 이름으로 MongoDB에서 사용자의 실제 이름을 조회
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
              setCurrentUsername(name) // 응답으로 받은 이름을 상태에 설정
              setCurrentUserId(githubId) // 응답으로 받은 githubId를 상태에 설정
              setCurrentStudentId(studentId) // 응답으로 받은 학번을 상태에 설정
              setUserLogins(prev => ({ ...prev, [githubId]: { name, studentId } }))
              fetchUserRepos(user.reloadUserInfo.screenName)
              fetchUserCourses(studentId) // 수업 목록 가져오기
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

    return () => unsubscribe() // 클린업 함수
  }, [auth])

  const fetchUserRepos = username => {
    const GITHUB_TOKEN = GITHUB_TOKEN_IGNORE

    fetch(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user repos')
        }

        return response.json()
      })
      .then(repos => {
        if (!Array.isArray(repos)) {
          throw new Error('Repos is not an array')
        }

        return Promise.all(
          repos.map(repo =>
            fetch(repo.contributors_url, {
              headers: {
                Authorization: `token ${GITHUB_TOKEN}`
              }
            })
              .then(resp => (resp.ok ? resp.json() : Promise.reject('Failed to load contributors')))
              .then(contributors => ({ ...repo, contributors }))
              .catch(error => {
                console.error('Error fetching contributors:', error)

                return { ...repo, contributors: [] }
              })
          )
        )
      })
      .then(reposWithContributors => setUserRepos(reposWithContributors))
      .catch(error => console.error('Error processing repos:', error))
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
        userId: currentUserId, // 사용자 ID
        username: currentUsername, // 사용자 이름
        studentId: currentStudentId, // 사용자 학번
        course: selectedCourse // 선택된 수업
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
        userId: currentUserId, // 사용자 ID
        username: currentUsername, // 사용자 이름
        studentId: currentStudentId, // 사용자 학번
        course: selectedCourse // 선택된 수업
      }
    })
  }

  const RenderUserInfo = () => (
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
  )

  const RenderRepoDetail = ({ repo }) => (
    <Box>
      <Typography variant='h6' component='div' sx={{ mb: 2, fontWeight: '600', color: '#0072E5' }}>
        {repo.name}
      </Typography>
      <Typography variant='body2' color='textSecondary' component='p' sx={{ mb: 2 }}>
        {repo.description || 'No description'}
      </Typography>
      <Typography
        variant='body2'
        color='textSecondary'
        component='p'
        sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}
      >
        {/* 언어 아이콘 Box */}
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: languageColors[repo.language] || '#000',
            display: 'inline-block',
            mr: 1
          }}
        />
        <Typography variant='subtitle2' component='span'>
          {repo.language || 'No info'}
        </Typography>
        {renderRepoDetailIcons('Stars', <Star sx={{ verticalAlign: 'middle' }} />, repo.stargazers_count)}
        {renderRepoDetailIcons('Forks', <ForkRight sx={{ verticalAlign: 'middle' }} />, repo.forks_count)}
        {renderRepoDetailIcons('Watchers', <Visibility sx={{ verticalAlign: 'middle' }} />, repo.watchers_count)}
        <Box sx={{ mx: 1 }} />

        {repo.license && (
          <>
            <Box sx={{ mx: 1 }} />
            <Typography variant='subtitle2' component='span'>
              {repo.license.name}
            </Typography>
          </>
        )}
        <Box sx={{ mx: 2 }} />
        <Typography variant='subtitle2' component='span'>
          Updated
        </Typography>
        <Typography variant='subtitle2' component='span' sx={{ ml: 2 }}>
          {new Date(repo.updated_at).toLocaleDateString()}
        </Typography>
      </Typography>
      <Typography variant='body2' sx={{ mb: 2 }}>
        <Link href={repo.html_url} target='_blank' rel='noopener noreferrer' color='primary'>
          GitHub로 이동
        </Link>
      </Typography>
    </Box>
  )

  const renderRepoDetailIcons = (label, icon, value) =>
    value > 0 && (
      <>
        <Box sx={{ mx: 1 }}> | </Box>
        {icon}
        <Typography variant='subtitle2' component='span' sx={{ ml: 0.5 }}>
          {value}
        </Typography>
      </>
    )

  return (
    <div>
      <h1>사용자 정보</h1>
      <RenderUserInfo />

      <h2>사용자 레포지토리 목록</h2>
      {userRepos.map(repo => (
        <Card key={repo.id} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
          <Avatar
            src={repo.owner.avatar_url}
            alt={`${repo.owner.login} avatar`}
            sx={{ width: 60, height: 60, mx: 2 }}
          />
          <CardContent sx={{ flex: 1 }}>
            <RenderRepoDetail repo={repo} />
          </CardContent>

          <IconButton sx={{ alignSelf: 'flex-start', mt: 1 }} aria-label='Add' onClick={() => handleOpenModal(repo)}>
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
