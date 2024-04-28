import React, { useEffect, useState } from 'react'
import { List, ListItem, ListItemText, Card, CardContent, Typography, IconButton, Link } from '@mui/material'
import { Add } from '@mui/icons-material'

const UserProjectsPage = () => {
  const [userLogins, setUserLogins] = useState({})
  const [userRepos, setUserRepos] = useState([])

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
            onClick={() => {
              // Add your functionality here
            }}
          >
            <Add />
          </IconButton>
        </Card>
      ))}
    </div>
  )
}

export default UserProjectsPage
