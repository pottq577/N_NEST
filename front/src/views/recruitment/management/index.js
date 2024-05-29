import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Slide from '@mui/material/Slide'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'

import RenderList from '../recruit/RenderList'
import TeamInputField from '../TeamInputField'

const EditTeam = ({ sidebarOpen, editedTeam, setEditedTeam, handleSave, handleSidebarClose }) => (
  <Slide direction='left' in={sidebarOpen} mountOnEnter unmountOnExit>
    <Box
      sx={{
        width: '30%',
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 4,
        boxShadow: 3
      }}
    >
      <Typography variant='h6'>팀 정보 수정</Typography>
      <Divider sx={{ mb: 2 }} />
      <TeamInputField teamData={editedTeam} setTeamData={setEditedTeam} />
      <Button variant='contained' color='primary' onClick={handleSave} sx={{ mt: 2 }}>
        저장
      </Button>
      <Button variant='outlined' color='secondary' onClick={handleSidebarClose} sx={{ mt: 2, ml: 2 }}>
        취소
      </Button>
    </Box>
  </Slide>
)

const Management = () => {
  const [teams, setTeams] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [editedTeam, setEditedTeam] = useState({})

  useEffect(() => {
    const storedTeams = JSON.parse(localStorage.getItem('teams')) || []
    setTeams(storedTeams)
  }, [])

  const handleDelete = id => {
    if (window.confirm('정말로 이 팀을 삭제하시겠습니까?')) {
      const updatedTeams = teams.filter(team => team.id !== id)
      setTeams(updatedTeams)
      localStorage.setItem('teams', JSON.stringify(updatedTeams))
      setSnackbarOpen(true)
    }
  }

  const handleEdit = team => {
    setSelectedTeam(team)
    setEditedTeam(team)
    setSidebarOpen(true)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setEditedTeam({ ...editedTeam, [name]: value })
  }

  const handleSave = () => {
    const updatedTeams = teams.map(team => (team.id === editedTeam.id ? editedTeam : team))
    setTeams(updatedTeams)
    localStorage.setItem('teams', JSON.stringify(updatedTeams))
    setSidebarOpen(false)
    setSnackbarOpen(true)
  }

  return (
    <Box sx={{ display: 'flex', padding: 1 }}>
      <Box sx={{ flex: 1, pr: sidebarOpen ? 2 : 0 }}>
        <Typography variant='h4' sx={{ my: 4 }}>
          팀관리
        </Typography>
        {teams.length === 0 ? (
          <Typography variant='body1' sx={{ my: 4 }}>
            등록된 팀이 없습니다.
          </Typography>
        ) : (
          teams.map(team => (
            <RenderList key={team.id} team={team} showAppliedTime={false} onDelete={handleDelete} onEdit={handleEdit} />
          ))
        )}
      </Box>
      <EditTeam
        sidebarOpen={sidebarOpen}
        editedTeam={editedTeam}
        setEditedTeam={setEditedTeam}
        handleSave={handleSave}
        handleSidebarClose={handleSidebarClose}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity='success' sx={{ width: '100%' }}>
          팀이 {selectedTeam ? '수정' : '삭제'}되었습니다.
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default Management