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
import { Add, Star, ForkRight, Visibility } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../../lib/firebase'

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
  const [userProjects, setUserProjects] = useState([]) // 기본값을 빈 배열로 설정
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
              fetchUserRepos(user.reloadUserInfo.screenName)
              fetchUserCourses(studentId)
              fetchUserProjects(studentId) // 추가된 부분
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
  }, [])

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

                return { ...repo, contributors: [] } // Handle errors by setting contributors to an empty array
              })
          )
        )
          .then(reposWithContributors => setUserRepos(reposWithContributors))
          .catch(error => console.error('Error processing repos:', error))
      })
      .catch(error => console.error('Error fetching user repos:', error))
  }

  const fetchUserProjects = studentId => {
    console.log(studentId)
    fetch(`http://localhost:8000/api/user-projects/${studentId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user projects')
        }

        return response.json()
      })
      .then(data => {
        setUserProjects(data)
      })
      .catch(error => console.error('Error fetching user projects:', error))
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
        course: selectedCourse === 'none' ? 'None' : selectedCourse // 선택된 수업
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
        course: selectedCourse === 'none' ? 'None' : selectedCourse // 선택된 수업
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
            <Avatar sx={{ bgcolor: 'primary.main', marginRight: 2 }}>
              {userInfo.name.charAt(0).toUpperCase()}
            </Avatar>
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
        <Box sx={{ mx: 1 }} />
        {icon}
        <Typography variant='subtitle2' component='span' sx={{ ml: 0.5 }}>
          {value}
        </Typography>
      </>
    )

  const ModalContents = ({
    selectedRepo,
    selectedCourse,
    setSelectedCourse,
    userCourses,
    handleNavigateToDocumentGeneration
  }) => (
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
          <MenuItem value='none'>선택 안함</MenuItem>
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
  )

  return (
    <Box>
      <RenderUserInfo />

      <h2>원격 저장소 목록</h2>
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

      <h2>내가 등록한 프로젝트</h2>
      {Array.isArray(userProjects) && userProjects.length > 0 ? (
        userProjects.map(project => (
          <Card key={project.id} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant='h6'>{project.project_name}</Typography>
              <Typography variant='body2' color='textSecondary'>
                {project.description}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                By: {project.username}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                Views: {project.views ?? 0}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant='body2' color='textSecondary'>
          No projects found.
        </Typography>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <ModalContents
          selectedRepo={selectedRepo}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          userCourses={userCourses}
          handleNavigateToDocumentGeneration={handleNavigateToDocumentGeneration}
        />
      </Modal>
    </Box>
  )
}

export default UserProjectsPage
