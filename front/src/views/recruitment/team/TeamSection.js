import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import MuiAlert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'

import IconButton from '@mui/material/IconButton'
import BookmarksIcon from '@mui/icons-material/Bookmarks'

import ProjectDetailModal from './ProjectDetailModal'

const ProjectList = ({ project, handleProjectClick, toggleBookmark, bookmarks }) => {
  useEffect(() => {
    console.log('Project object:', project)
  }, [project])

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        width: '100%',
        aspectRatio: '2',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        transition: '0.3s',
        '&:hover': {
          borderColor: 'primary.main',
          borderWidth: '2px',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)'
        }
      }}
      onClick={() => handleProjectClick(project)}
    >
      {/* 좌측 이미지 */}
      <Box component='img' src={project.image} alt='Project Logo' sx={{ width: '25%', mx: 2 }} />

      {/* 우측 세부 정보 */}
      <Box
        sx={{
          flexGrow: 1,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%'
        }}
      >
        <Box sx={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
            {project.title}
          </Typography>
          <IconButton
            onClick={e => {
              e.stopPropagation()
              toggleBookmark(project.id)
            }}
          >
            <BookmarksIcon color={bookmarks.includes(project.id) ? 'primary' : 'disabled'} />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant='subtitle2' color='textSecondary' gutterBottom>
            {project.teamName}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant='body2' color='textSecondary' gutterBottom>
            {project.subject} / {project.professor}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {project.techStack.map((tech, index) => (
              <Chip key={index} label={tech} size='small' />
            ))}
          </Box>
          <Typography variant='body2' color='textSecondary' gutterBottom sx={{ mr: 3 }}>
            0/{project.maxHead}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

const TeamSection = () => {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [isBookmarkView, setIsBookmarkView] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false) // Snackbar의 표시 상태
  const [snackbarMessage, setSnackbarMessage] = useState('') // Snackbar의 메시지
  const router = useRouter()
  const [alertOpen, setAlertOpen] = useState(false)

  useEffect(() => {
    if (router.query.alert === 'success') {
      setAlertOpen(true)
    }
  }, [router.query])

  useEffect(() => {
    const storedTeams = JSON.parse(localStorage.getItem('teams')) || []
    setProjects(storedTeams)

    const storedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || []
    setBookmarks(storedBookmarks)
  }, [])

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const handleProjectClick = project => {
    setSelectedProject(project)
  }

  const handleCloseModal = () => {
    setSelectedProject(null)
  }

  const toggleBookmark = projectId => {
    setBookmarks(prev => {
      if (prev.includes(projectId)) {
        setSnackbarMessage('북마크에서 제거되었습니다.')

        return prev.filter(id => id !== projectId) // 북마크 제거
      } else {
        setSnackbarMessage('북마크에 추가되었습니다.')

        return [...prev, projectId] // 북마크 추가
      }
    })
    setSnackbarOpen(true) // Snackbar 표시
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  const handleApplicationSuccess = message => {
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  const handleApplicationError = message => {
    setSnackbarMessage(message)
    setSnackbarOpen(true)
  }

  const handleClearLocalStorage = () => {
    localStorage.removeItem('teams')
    setSnackbarMessage('로컬 저장소의 팀 목록이 지워졌습니다.')
    setSnackbarOpen(true)
  }

  const handleTeamApplySnackbarClose = () => {
    setAlertOpen(false)
    router.replace('/teams', undefined, { shallow: true })
  }

  const filteredProjects = isBookmarkView ? projects.filter(project => bookmarks.includes(project.id)) : projects

  return (
    <Grid xs={12} md={8} item>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={4} justifyContent='space-between'>
          <Grid xs={12} item sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
              팀 목록
            </Typography>
            <Switch checked={isBookmarkView} onChange={e => setIsBookmarkView(e.target.checked)} />
          </Grid>
          {filteredProjects.length === 0 ? (
            <Grid
              item
              xs={12}
              md={8}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
            >
              <Typography variant='h6'>현재 등록된 팀이 없습니다.</Typography>
            </Grid>
          ) : (
            filteredProjects.map(project => (
              <Grid item xs={12} md={6} sm={6} key={project.id}>
                <ProjectList
                  project={project}
                  handleProjectClick={handleProjectClick}
                  toggleBookmark={toggleBookmark}
                  bookmarks={bookmarks}
                />
              </Grid>
            ))
          )}

          {/* <Button variant='contained' color='secondary' onClick={handleClearLocalStorage} sx={{ ml: 2 }}>
            팀 목록 초기화
          </Button> */}

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          />
        </Grid>
      </Box>
      {selectedProject && (
        <ProjectDetailModal
          open={Boolean(selectedProject)}
          onClose={handleCloseModal}
          project={selectedProject}
          onApplicationSuccess={handleApplicationSuccess} // 콜백 함수 전달
          onApplicationError={handleApplicationError}
        />
      )}
      <Snackbar
        open={alertOpen}
        autoHideDuration={2000}
        onClose={handleTeamApplySnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleTeamApplySnackbarClose} severity='success' sx={{ width: '100%' }}>
          팀이 등록되었습니다.
        </MuiAlert>
      </Snackbar>
    </Grid>
  )
}

export default TeamSection