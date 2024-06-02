import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'

import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

import Header from '../components/Header'
import RenderList from '../components/RenderList'
import CommonDatePicker from '../components/CommonDatePicker'
import axios from 'axios'

const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const educationType = type => {
  const types = {
    college: '대학 (2,3년)',
    university: '대학교 (4년)',
    masters: '대학원(석사)',
    phd: '대학원(박사)'
  }

  return types[type] || ''
}

const graduationStatus = status => {
  const statuses = {
    graduated: '졸업',
    enrolled: '재학',
    leaveOfAbsence: '휴학',
    completion: '수료',
    dropOut: '중퇴',
    withdrawal: '자퇴',
    expectedGraduation: '졸업예정'
  }

  return statuses[status] || ''
}

// <div ref={inputFormRef}>
// </div>
const InputForm = ({ educationDetails, handleChange, handleSaveEducation, handleCancelInput, inputFormRef }) => (
  <Grid container spacing={2}>
    {/* 대학 구분 선택 */}
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth>
        <InputLabel id='type-label'>대학 구분</InputLabel>
        <Select
          labelId='type-label'
          id='type'
          name='type'
          value={educationDetails.type}
          label='대학 구분'
          onChange={handleChange}
        >
          <MenuItem value={'college'}>대학 (2,3년)</MenuItem>
          <MenuItem value={'university'}>대학교 (4년)</MenuItem>
          <MenuItem value={'masters'}>대학원(석사)</MenuItem>
          <MenuItem value={'phd'}>대학원(박사)</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    {/* 학교명 입력 */}
    <Grid item xs={12} sm={6}>
      <TextField fullWidth id='name' name='name' label='학교명' value={educationDetails.name} onChange={handleChange} />
    </Grid>
    {/* 전공 입력 */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        id='major'
        name='major'
        label='전공'
        value={educationDetails.major}
        onChange={handleChange}
      />
    </Grid>
    {/* 졸업 여부 */}
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth>
        <InputLabel id='status-label'>졸업 여부</InputLabel>
        <Select
          labelId='status-label'
          id='status'
          name='status'
          value={educationDetails.status}
          label='졸업 여부'
          onChange={handleChange}
        >
          <MenuItem value={'graduated'}>졸업</MenuItem>
          <MenuItem value={'enrolled'}>재학</MenuItem>
          <MenuItem value={'leaveOfAbsence'}>휴학</MenuItem>
          <MenuItem value={'completion'}>수료</MenuItem>
          <MenuItem value={'dropOut'}>중퇴</MenuItem>
          <MenuItem value={'withdrawal'}>자퇴</MenuItem>
          <MenuItem value={'expectedGraduation'}>졸업예정</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={4} mt={2}>
      <CommonDatePicker
        label='입학년월'
        value={educationDetails.startDate}
        onChange={newDate => handleChange('startDate', newDate)}
        format={'yyyy-MM'}
        views={['year', 'month']}
      />
    </Grid>
    <Grid item xs={4} sm={6} mt={2}>
      <CommonDatePicker
        label='졸업년월'
        value={educationDetails.endDate}
        onChange={newDate => handleChange('endDate', newDate)}
        format={'yyyy-MM'}
        views={['year', 'month']}
      />
    </Grid>

    <Grid item xs={12}>
      <Button variant='contained' onClick={handleSaveEducation} style={{ marginRight: 10 }}>
        저장
      </Button>
      <Button variant='contained' onClick={handleCancelInput}>
        취소
      </Button>
    </Grid>
  </Grid>
)

const EducationSection = ({ onComplete }) => {
  const [educationDetails, setEducationDetails] = useState({
    type: '',
    name: '',
    major: '',
    status: '',
    startDate: null,
    endDate: null
  })
  const [isAdding, setIsAdding] = useState(false)
  const [educations, setEducations] = useState(loadLocalStorage('educationDetails'))
  const [editingIndex, setEditingIndex] = useState(null)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    setEducations(loadLocalStorage('educationDetails'))
  }, [])

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get('/api/get-user-id', { withCredentials: true })
        setUserId(response.data.user_id)
      } catch (error) {
        console.error('Error fetching user ID:', error)
      }
    }

    fetchUserId()
    setEducations(JSON.parse(localStorage.getItem('educationDetails')) || [])
  }, [])

  const handleAddClick = () => {
    setEducationDetails({
      type: '',
      name: '',
      major: '',
      status: '',
      startDate: null,
      endDate: null
    })
    setEditingIndex(null)
    setIsAdding(true)
  }

  const handleChange = (eventOrName, value = null) => {
    if (typeof eventOrName === 'string') {
      // DatePicker의 날짜 변경 처리를 위한 분기
      const name = eventOrName
      setEducationDetails({
        ...educationDetails,
        [name]: value
      })
    } else {
      // 일반 텍스트 입력을 처리
      const { name, value } = eventOrName.target
      setEducationDetails({
        ...educationDetails,
        [name]: value
      })
    }
  }

  const handleSaveEducation = async () => {
    const updatedEducations = editingIndex !== null ? [...educations] : [...educations, educationDetails]
    if (editingIndex !== null) {
      updatedEducations[editingIndex] = educationDetails
    }
    setEducations(updatedEducations)
    saveToLocalStorage('educationDetails', updatedEducations)
    setEditingIndex(null)
    setIsAdding(false)
    setEducationDetails({
      type: '',
      name: '',
      major: '',
      status: '',
      startDate: null,
      endDate: null
    })

    // 백엔드에 데이터 저장
    try {
      console.log('dbtest')

      const response = await axios.post('http://localhost:8000/user-profile/education', {
        user_id: userId,
        education: updatedEducations
      })
      if (response.status === 201) {
        console.log('Education data saved successfully')
      }
    } catch (error) {
      console.error('Error saving education data:', error)
    }

    onComplete('education', true)
  }

  const handleCancelInput = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setEducationDetails({
      type: '',
      name: '',
      major: '',
      status: '',
      startDate: null,
      endDate: null
    })
  }

  const handleEditEducation = index => {
    setEducationDetails({ ...educations[index] })
    setEditingIndex(index) // 현재 수정 중인 학력의 인덱스 설정
    setIsAdding(true)
  }

  const handleDeleteEducation = index => {
    if (window.confirm('저장된 학력을 삭제합니다.')) {
      const updatedEducations = educations.filter((_, idx) => idx !== index)
      setEducations(updatedEducations)
      saveToLocalStorage('educationDetails', updatedEducations)
    }
  }

  const formatDate = date => {
    if (!date) return 'N/A' // 날짜가 없는 경우 처리
    const options = { year: 'numeric', month: '2-digit' }

    return new Date(date).toLocaleDateString('ko-KR', options).replace(/\./g, '.').slice(0, -1) // 2021.05 형식으로 변경
  }

  const educationListText = (education, type) => {
    if (type === 'primary') {
      const startDateFormatted = formatDate(education.startDate)
      const endDateFormatted = formatDate(education.endDate)

      return `${educationType(education.type)} | ${startDateFormatted} ~ ${endDateFormatted} (${graduationStatus(
        education.status
      )})`
    } else {
      return `${education.name} / ${education.major}`
    }
  }

  // <Box ref={inputFormRef} sx={{ width: '100%' }}>
  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'학력'} isAdding={isAdding} handleAddClick={handleAddClick} />
      <Divider sx={{ mb: 2 }} />

      <Box style={{ minHeight: 100 }}>
        {isAdding && (
          <InputForm
            educationDetails={educationDetails}
            handleChange={handleChange}
            handleSaveEducation={handleSaveEducation}
            handleCancelInput={handleCancelInput}

            // inputFormRef={inputFormRef}
          />
        )}

        <RenderList
          items={educations}
          renderItemText={educationListText}
          handleEdit={handleEditEducation}
          handleDelete={handleDeleteEducation}
          dividerCondition={(items, index) => items.length > 1 && index < items.length - 1}
          isAdding={isAdding}
          message={`학력을 입력해주세요.`}
        />
      </Box>
    </Box>
  )
}

export default EducationSection
