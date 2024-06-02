import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Slide from '@mui/material/Slide'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import RenderList from '../recruit/RenderList'
import TeamInputField from '../TeamInputField'

import PersonIcon from '@mui/icons-material/Person'
import WorkIcon from '@mui/icons-material/Work'
import BuildIcon from '@mui/icons-material/Build'

const exampleApplicants = [
  {
    id: 1,
    name: '김철수',
    desiredRole: '프론트엔드',
    skills: 'JavaScript, React, HTML, CSS'
  },
  {
    id: 2,
    name: '이영희',
    desiredRole: '백엔드',
    skills: 'Java, mongoDB, REST API'
  },
  {
    id: 3,
    name: '박민수',
    desiredRole: 'AI',
    skills: 'Python'
  }
]

const EditTeam = ({ sidebarOpen, editedTeam, setEditedTeam, handleSave, handleSidebarClose }) => (
  <Slide direction='left' in={sidebarOpen} mountOnEnter unmountOnExit>
    <Box
      sx={{
        bgcolor: 'background.paper',
        width: '30%', // 좌우 사이즈 설정
        minWidth: 300, // 최소 너비 설정
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 4,
        boxShadow: 3,
        position: 'fixed', // 화면에 고정
        right: 0, // 오른쪽에 배치
        height: '100%', // 높이를 전체 화면으로 설정
        overflowY: 'auto',
        marginRight: 10
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

const ApplicantList = ({ applicants, handleAccept, handleReject, handleSidebarClose, applicantSidebarOpen }) => (
  <Slide direction='right' in={applicantSidebarOpen} mountOnEnter unmountOnExit>
    <Box
      sx={{
        bgcolor: 'background.paper',
        width: '30%', // 좌우 사이즈 설정
        minWidth: 300, // 최소 너비 설정
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 4,
        boxShadow: 3,
        position: 'fixed', // 화면에 고정
        right: 0, // 오른쪽에 배치
        height: '100%', // 높이를 전체 화면으로 설정
        overflowY: 'auto',
        marginRight: 10
      }}
    >
      <Typography variant='h6'>지원자 목록</Typography>
      <Divider sx={{ mb: 2 }} />
      {applicants.length === 0 ? (
        <Typography variant='body1'>지원자가 없습니다.</Typography>
      ) : (
        applicants.map(applicant => (
          <Card key={applicant.id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant='body1'>{applicant.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant='body1'>{applicant.desiredRole}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant='body1'>{applicant.skills}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={3} container direction='column' justifyContent='center'>
                  <Button variant='contained' color='primary' onClick={() => handleAccept(applicant.id)} sx={{ mb: 1 }}>
                    수락
                  </Button>
                  <Button variant='outlined' color='secondary' onClick={() => handleReject(applicant.id)}>
                    거절
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      )}
      <Button variant='outlined' color='secondary' onClick={handleSidebarClose} sx={{ mt: 2 }}>
        닫기
      </Button>
    </Box>
  </Slide>
)

const Management = () => {
  const [teams, setTeams] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [applicantSidebarOpen, setApplicantSidebarOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [editedTeam, setEditedTeam] = useState({})
  const [applicants, setApplicants] = useState([])

  useEffect(() => {
    const storedTeams = JSON.parse(localStorage.getItem('teams')) || []
    setTeams(storedTeams)
    setApplicants(exampleApplicants) // 예시 지원자 데이터를 설정합니다.
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
    setApplicantSidebarOpen(false) // 다른 패널을 닫음
    setSidebarOpen(prev => !prev) // 토글 기능
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const handleApplicantSidebarClose = () => {
    setApplicantSidebarOpen(false)
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

  const handleShowApplicants = team => {
    setSelectedTeam(team)
    setSidebarOpen(false) // 다른 패널을 닫음
    setApplicantSidebarOpen(prev => !prev) // 토글 기능
  }

  const handleAccept = applicantId => {
    // 수락 로직 구현
    setSnackbarOpen(true)
    setApplicantSidebarOpen(false)
  }

  const handleReject = applicantId => {
    // 거절 로직 구현
    setSnackbarOpen(true)
    setApplicantSidebarOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', padding: 1 }}>
      <Box sx={{ flex: 1, pr: sidebarOpen || applicantSidebarOpen ? 2 : 0 }}>
        <Typography variant='h4' sx={{ my: 4 }}>
          팀관리
        </Typography>
        {teams.length === 0 ? (
          <Typography variant='body1' sx={{ my: 4 }}>
            등록된 팀이 없습니다.
          </Typography>
        ) : (
          teams.map(team => (
            <Box key={team.id} sx={{ mb: 2, display: 'flex', alignItems: 'center', width: '100%' }}>
              <RenderList
                team={team}
                showAppliedTime={false}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onShowApplicants={handleShowApplicants} // 추가된 부분
              />
            </Box>
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
      <ApplicantList
        applicantSidebarOpen={applicantSidebarOpen}
        applicants={applicants}
        handleAccept={handleAccept}
        handleReject={handleReject}
        handleSidebarClose={handleApplicantSidebarClose}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbarOpen(false)} severity='success' sx={{ width: '100%' }}>
          {selectedTeam ? '팀이 수정되었습니다.' : '팀이 삭제되었습니다.'}
        </MuiAlert>
      </Snackbar>
    </Box>
  )
}

export default Management
