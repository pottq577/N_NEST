import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import axios from 'axios'

import Header from '../components/Header'
import RenderList from '../components/RenderList'
import CommonDatePicker from '../components/CommonDatePicker'

const label = { inputProps: { 'aria-label': 'Switch' } }
const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const InputForm = ({
  careerDetails,
  setCareerDetails,
  handleChange,
  handleSwitchChange,
  handleSaveClick,
  handleCancelClick,
  inputFormRef
}) => {
  const mainTasksPlaceholder = `담당업무를 입력해주세요.
  - 진행한 업무를 다 적기보다는 경력사항 별로 중요한 내용만 엄선해서 작성하는 것이 중요합니다!
  - 담당한 업무 내용을 요약해서 작성해보세요!
  - 경력별 프로젝트 내용을 적을 경우, 역할/팀구성/기여도/성과를 기준으로 요약해서 작성해보세요! `

  // <div ref={inputFormRef}>
  // </div>
  return (
    <Grid container spacing={2}>
      {/* 회사명 */}
      <Grid item xs={6} md={4}>
        <TextField
          fullWidth
          label='회사명'
          name='companyName'
          value={careerDetails.companyName}
          onChange={handleChange}
        />
      </Grid>
      {/* 입사년월 */}
      <Grid item xs={6} md={3}>
        <CommonDatePicker
          views={['year', 'month']}
          label='입사년월'
          value={careerDetails.joinDate}
          onChange={newDate => setCareerDetails(prev => ({ ...prev, joinDate: newDate }))}
          format={'yyyy-MM'}
        />
      </Grid>
      {/* 퇴사년월 */}
      <Grid item xs={6} md={3}>
        <CommonDatePicker
          views={['year', 'month']}
          label='퇴사년월'
          value={careerDetails.leaveDate}
          onChange={newDate => setCareerDetails(prev => ({ ...prev, leaveDate: newDate }))}
          format={'yyyy-MM'}
        />
      </Grid>
      {/* 재직중? */}
      <Grid item xs={6} md={2}>
        <Box display='flex' alignItems='center' height='100%'>
          <Switch {...label} checked={careerDetails.isWorking} name='isWorking' onChange={handleSwitchChange} />
          <Typography>재직중</Typography>
        </Box>
      </Grid>
      {/* 직무 */}
      <Grid item xs={6} md={4}>
        <TextField fullWidth label='직무' name='task' value={careerDetails.task} onChange={handleChange} />
      </Grid>
      {/* 근무부서 */}
      <Grid item xs={6} md={4}>
        <TextField fullWidth label='근무 부서' name='depart' value={careerDetails.depart} onChange={handleChange} />
      </Grid>
      {/* 직급/직책 */}
      <Grid item xs={6} md={4}>
        <TextField fullWidth label='직급/직책' name='position' value={careerDetails.position} onChange={handleChange} />
      </Grid>
      <Grid item xs={12} md={6}>
        <CommonDatePicker
          views={['year', 'month']}
          label='개발 경력 (개발 시작일)'
          value={careerDetails.developStart}
          onChange={newDate => setCareerDetails(prev => ({ ...prev, developStart: newDate }))}
          format={'yyyy-MM'}
        />
      </Grid>
      {/* 담당업무 */}
      <Grid item xs={12}>
        <Typography variant='h6'>담당업무</Typography>
        <TextareaAutosize
          style={{ width: '100%', minHeight: 130, padding: 10 }}
          placeholder={mainTasksPlaceholder}
          name='mainTasks'
          value={careerDetails.mainTasks}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
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

const CareerSection = ({ onComplete }) => {
  const [careerDetails, setCareerDetails] = useState({
    companyName: '',
    joinDate: null,
    leaveDate: null,
    isWorking: false,
    task: '',
    depart: '',
    position: '',
    mainTasks: '',
    developStart: null
  })
  const [careers, setCareers] = useState(loadLocalStorage('careerDetails'))
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    setCareerDetails(loadLocalStorage('careerDetails'))
  }, [])

  const handleChange = event => {
    const { name, value } = event.target
    setCareerDetails({
      ...careerDetails,
      [name]: value
    })
  }

  const handleSwitchChange = event => {
    setCareerDetails({
      ...careerDetails,
      isWorking: event.target.checked
    })
  }

  const handleAddClick = () => {
    setIsAdding(true)
  }

  const handleCancelClick = () => {
    setIsAdding(false)
    setCareerDetails({
      companyName: '',
      joinDate: '',
      leaveDate: '',
      isWorking: false,
      task: '',
      depart: '',
      position: '',
      mainTasks: '',
      developStart: null
    })
  }

  const handleSaveClick = async () => {
    const updatedCareers = editingIndex !== null ? [...careers] : [...careers, careerDetails]
    if (editingIndex !== null) {
      updatedCareers[editingIndex] = careerDetails
    }
    setCareers(updatedCareers)
    saveToLocalStorage('careerDetails', updatedCareers)
    setEditingIndex(null)
    setIsAdding(false)
    setCareerDetails({
      companyName: '',
      joinDate: '',
      leaveDate: '',
      isWorking: false,
      task: '',
      depart: '',
      position: '',
      mainTasks: '',
      developStart: null
    })

    console.log('Sending careers data to backend:', updatedCareers) // 데이터 확인 로그

    try {
      const response = await axios.post('http://localhost:8000/user-profile/careers', {
        user_id: userId,
        careers: updatedCareers
      })
      if (response.status === 201) {
        console.log('Careers saved successfully')
      }
    } catch (error) {
      console.error('Error saving careers:', error)
    }
    onComplete('career', true)
  }

  const handleEditCareer = index => {
    setCareerDetails({ ...careers[index] })
    setEditingIndex(index)
    setIsAdding(true)
  }

  const handleDeleteCareer = async index => {
    if (window.confirm('저장된 경력을 삭제합니다.')) {
      const updatedCareers = careers.filter((_, idx) => idx !== index)
      setCareers(updatedCareers)
      saveToLocalStorage('careerDetails', updatedCareers)
      try {
        const response = await axios.delete('http://localhost:8000/user-profile/careers', {
          data: {
            user_id: userId,
            careers: updatedCareers
          }
        })
        if (response.status === 200) {
          console.log('Careers deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting careers:', error)
      }
    }
  }

  const formatDate = date => {
    if (!date) return ''

    const dateObj = new Date(date)
    const localeDate = dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' })

    return localeDate
  }

  const renderCareerInfo = career => {
    const parts = []

    if (career.task) {
      parts.push(career.task)
    }
    if (career.depart) {
      parts.push(career.depart)
    }
    if (career.position) {
      parts.push(career.position)
    }

    return parts.join(' · ')
  }

  const careerListText = (item, type) => {
    if (type === 'primary') {
      return `${item.companyName} | ${formatDate(item.joinDate)} ~ ${formatDate(item.leaveDate)} ${
        item.isWorking ? '(재직중)' : ''
      }`
    } else if (type === 'secondary') {
      return (
        <>
          {renderCareerInfo(item)}
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

  // <Box ref={inputFormRef} sx={{ width: '100%' }}>
  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'경력'} isAdding={isAdding} handleAddClick={handleAddClick} />

      <Divider sx={{ mb: 2 }} />
      <Box style={{ minHeight: 100 }}>
        {isAdding && (
          <InputForm
            careerDetails={careerDetails}
            setCareerDetails={setCareerDetails}
            handleChange={handleChange}
            handleSwitchChange={handleSwitchChange}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}

            // inputFormRef={inputFormRef}
          />
        )}

        <RenderList
          items={careers}
          renderItemText={careerListText}
          handleEdit={handleEditCareer}
          handleDelete={handleDeleteCareer}
          dividerCondition={(items, index) => items.length > 1 && index < items.length - 1}
          isAdding={isAdding}
          message={`경력사항 또는 인턴, 현장실습 등 급여를 받은 업무경험이 있다면 자유롭게 작성해보세요!`}
        />
      </Box>
    </Box>
  )
}

export default CareerSection
