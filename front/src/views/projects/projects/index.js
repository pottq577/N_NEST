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
  const [selectedRepo, setSelectedRepo] = useState(null)
  const router = useRouter() // Next.js Router instance

  useEffect(() => {
    fetch('http://localhost:8000/user-logins')
      .then(response => response.json())
      .then(data => {
        setUserLogins(data)
        // Assume the first user's username is usable and call fetchUserRepos automatically
        if (data && Object.keys(data).length > 0) {
          const defaultUsername = Object.values(data)[0] // Use the first username found in the user logins
          fetchUserRepos(defaultUsername)
        }
      })
      .catch(error => console.error('Error fetching user logins:', error))
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
        defaultBranch: selectedRepo.default_branch
      }
    })
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
              Upon registration, this content will be visible to everyone.
            </Typography>
          </Typography>
          <Grid container spacing={2} justifyContent='center'>
            <Grid item>
              <Button variant='contained' onClick={handleNavigateToDocumentUpload} sx={{ mr: 2 }}>
                Create Document
              </Button>
            </Grid>
            <Grid item>
              <Button variant='contained' onClick={handleNavigateToDocumentUpload}>
                Register Existing Document
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  )
}

export default UserProjectsPage
