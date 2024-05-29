import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import TextareaAutosize from '@mui/material/TextareaAutosize'

import DatePicker from '@mui/lab/DatePicker'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'

import Header from '../components/Header'
import RenderList from '../components/RenderList'

const label = { inputProps: { 'aria-label': 'Switch' } }
const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const InputForm = ({
  projectDetails,
  setProjectDetails,
  handleChange,
  handleSwitchChange,
  handleSaveClick,
  handleCancelClick
}) => {
  return (
    <Grid container spacing={2}>
      {/* 프로젝트명 */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          required
          label='프로젝트'
          name='projectName'
          value={projectDetails.projectName}
          onChange={handleChange}
        />
      </Grid>
      {/* 제작년도 */}
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={['year']}
            label='제작 연도'
            value={projectDetails.projectYear}
            onChange={newDate => {
              setProjectDetails(prev => ({ ...prev, projectYear: newDate }))
            }}
            renderInput={props => <TextField {...props} required />}
          />
        </LocalizationProvider>
      </Grid>
      {/* 프로젝트 한줄요약 */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label='프로젝트 1줄 설명'
          name='projectDescription'
          value={projectDetails.projectDescription}
          onChange={handleChange}
        />
      </Grid>
      {/* 팀 구성 */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          select
          label='팀 구성'
          name='teamStructure'
          value={projectDetails.teamStructure}
          onChange={handleChange}
        >
          <MenuItem value='팀'>팀</MenuItem>
          <MenuItem value='개인'>개인</MenuItem>
        </TextField>
      </Grid>
      {/* 팀 구성원 */}
      {projectDetails.teamStructure === '팀' && (
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='팀 구성원'
            name='teamMembers'
            value={projectDetails.teamMembers}
            onChange={handleChange}
          />
        </Grid>
      )}
      {/* 기술 스택 */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label='사용 스택'
          name='techStack'
          value={projectDetails.techStack}
          onChange={handleChange}
        />
      </Grid>
      {/* 상세 업무 및 성과 */}
      <Grid item xs={12}>
        <Typography variant='h6'>상세 업무 및 성과</Typography>
        <TextareaAutosize
          style={{ width: '100%', minHeight: 130, padding: 10 }}
          name='mainTasks'
          value={projectDetails.mainTasks}
          onChange={handleChange}
        />
      </Grid>
      {/* 오픈 여부 */}
      <Grid item xs={12}>
        <Box display='flex' flexDirection='column'>
          <Typography variant='h6'>오픈 여부</Typography>
          <Box display='flex' flexDirection='row' alignItems='center' sx={{ mt: 1 }}>
            <Typography sx={{ marginRight: 2 }}>프로젝트가 웹/마켓에 오픈 되었습니까?</Typography>
            <Switch {...label} checked={projectDetails.isOpen} name='isOpen' onChange={handleSwitchChange} />
          </Box>
        </Box>
      </Grid>
      {/* 안드로이드, iOS, 웹사이트 링크 */}
      {projectDetails.isOpen && (
        <>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Website'
              name='websiteLink'
              value={projectDetails.websiteLink}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label='Android'
              name='androidLink'
              value={projectDetails.androidLink}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label='iOS' name='iosLink' value={projectDetails.iosLink} onChange={handleChange} />
          </Grid>
        </>
      )}
      {/* 깃허브 저장소 링크 */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label='저장소 링크'
          name='repoLink'
          value={projectDetails.repoLink}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={12} mt={5}>
        <Button style={{ marginRight: 10 }} variant='contained' onClick={handleSaveClick}>
          저장
        </Button>
        <Button variant='contained' onClick={handleCancelClick}>
          취소
        </Button>
      </Grid>
    </Grid>
  )
}

const SideProjectSection = ({ onComplete }) => {
  const [projectDetails, setProjectDetails] = useState({
    projectName: '',
    projectYear: null,
    projectDescription: '',
    teamStructure: '',
    teamMembers: '',
    techStack: '',
    mainTasks: '',
    isOpen: false,
    websiteLink: '',
    androidLink: '',
    iosLink: '',
    repoLink: ''
  })
  const [projects, setProjects] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)

  useEffect(() => {
    const storedProjects = loadLocalStorage('sideProjects').map(project => ({
      ...project,
      projectYear: project.projectYear ? new Date(project.projectYear) : null
    }))
    setProjects(storedProjects)
  }, [])

  const handleChange = event => {
    const { name, value } = event.target
    setProjectDetails({
      ...projectDetails,
      [name]: value
    })
  }

  const handleSwitchChange = event => {
    setProjectDetails({
      ...projectDetails,
      isOpen: event.target.checked
    })
  }

  const handleAddClick = () => {
    setIsAdding(true)
  }

  const handleCancelClick = () => {
    setIsAdding(false)
    setProjectDetails({
      projectName: '',
      projectYear: null,
      projectDescription: '',
      teamStructure: '',
      teamMembers: '',
      techStack: '',
      mainTasks: '',
      isOpen: false,
      websiteLink: '',
      androidLink: '',
      iosLink: '',
      repoLink: ''
    })
  }

  const handleSaveClick = () => {
    const updatedProject = {
      ...projectDetails,
      projectYear: projectDetails.projectYear ? projectDetails.projectYear.toISOString() : null
    }
    const updatedProjects = [...projects]
    if (editingIndex !== null) {
      updatedProjects[editingIndex] = updatedProject
    } else {
      updatedProjects.push(updatedProject)
    }
    setProjects(updatedProjects)
    saveToLocalStorage('sideProjects', updatedProjects)
    setEditingIndex(null)
    setIsAdding(false)
    setProjectDetails({
      projectName: '',
      projectYear: null,
      projectDescription: '',
      teamStructure: '',
      teamMembers: '',
      techStack: '',
      mainTasks: '',
      isOpen: false,
      websiteLink: '',
      androidLink: '',
      iosLink: '',
      repoLink: ''
    })
    onComplete('project', true)
  }

  const handleEditProject = index => {
    const projectToEdit = projects[index]
    setProjectDetails({
      ...projectToEdit,
      projectYear: projectToEdit.projectYear ? new Date(projectToEdit.projectYear) : null
    })
    setEditingIndex(index)
    setIsAdding(true)
  }

  const handleDeleteProject = index => {
    if (window.confirm('저장된 프로젝트를 삭제합니다.')) {
      const updatedProjects = projects.filter((_, idx) => idx !== index)
      setProjects(updatedProjects)
      saveToLocalStorage('sideProjects', updatedProjects) // 로컬 저장소에 데이터 저장
    }
  }

  const renderProjectInfo = project => {
    const parts = []

    if (project.teamStructure) {
      parts.push(`${project.teamStructure}`)
    }
    if (project.teamMembers) {
      parts.push(`${project.teamMembers}`)
    }
    if (project.techStack) {
      parts.push(`${project.techStack}`)
    }

    return parts.join(' · ')
  }

  const projectListText = (item, type) => {
    if (type === 'primary') {
      const projectYear = item.projectYear ? new Date(item.projectYear).getFullYear() : 'N/A'

      return `${item.projectName} | ${projectYear}`
    } else if (type === 'secondary') {
      return (
        <>
          {renderProjectInfo(item)}
          <br />
          {item.mainTasks.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </>
      )
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'사이드 프로젝트'} isAdding={isAdding} handleAddClick={handleAddClick} />
      <Divider sx={{ mb: 2 }} />
      <Box style={{ minHeight: 100 }}>
        {isAdding && (
          <InputForm
            projectDetails={projectDetails}
            setProjectDetails={setProjectDetails}
            handleChange={handleChange}
            handleSwitchChange={handleSwitchChange}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
          />
        )}

        <RenderList
          items={projects}
          renderItemText={projectListText}
          handleEdit={handleEditProject}
          handleDelete={handleDeleteProject}
          dividerCondition={(items, index) => items.length > 1 && index < items.length - 1}
          isAdding={isAdding}
          message={`사이드 프로젝트를 자유롭게 작성해보세요!`}
        />
      </Box>
    </Box>
  )
}

export default SideProjectSection