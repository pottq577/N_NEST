import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import TextareaAutosize from '@mui/material/TextareaAutosize'

import axios from 'axios'

import Header from '../components/Header'
import RenderList from '../components/RenderList'
import CommonDatePicker from '../components/CommonDatePicker'

const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const activityType = type => {
  const types = {
    inSchool: '교내활동',
    intern: '인턴',
    volunteer: '자원봉사',
    club: '동아리',
    partTime: '아르바이트',
    social: '사회활동',
    task: '수행과제',
    overseasStudy: '해외연수',
    training: '교육이수내역'
  }

  return types[type] || ''
}

const InputForm = ({ handleInputChange, expData, setExpData, handleSaveClick, handleCancelClick }) => (
  <Grid container spacing={2}>
    {/* 활동구분 선택 */}
    <Grid item xs={6}>
      <FormControl fullWidth>
        <InputLabel id='classification-label'>활동구분 선택</InputLabel>
        <Select value={expData.type} name='type' labelId='classification-label' onChange={handleInputChange}>
          <MenuItem value={'inSchool'}>교내활동</MenuItem>
          <MenuItem value={'intern'}>인턴</MenuItem>
          <MenuItem value={'volunteer'}>자원봉사</MenuItem>
          <MenuItem value={'club'}>동아리</MenuItem>
          <MenuItem value={'partTime'}>아르바이트</MenuItem>
          <MenuItem value={'social'}>사회활동</MenuItem>
          <MenuItem value={'task'}>수행과제</MenuItem>
          <MenuItem value={'overseasStudy'}>해외연수</MenuItem>
          <MenuItem value={'training'}>교육이수내역</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    {/* 기관/장소명 입력 */}
    <Grid item xs={6}>
      <TextField
        fullWidth
        id='name'
        name='name'
        label='기관/장소명'
        value={expData.name}
        onChange={handleInputChange}
      />
    </Grid>
    {/* 시작일 입력 */}
    <Grid item xs={6}>
      <CommonDatePicker
        label='시작일'
        value={expData.startDate}
        onChange={newDate => setExpData(prev => ({ ...prev, startDate: newDate }))}
        format={'yyyy-MM-dd'}
        views={['year', 'month', 'day']}
      />
    </Grid>
    {/* 종료일 입력 */}
    <Grid item xs={6}>
      <CommonDatePicker
        label='종료일'
        inputFormat='yyyy-MM-dd'
        value={expData.endDate}
        onChange={newDate => setExpData(prev => ({ ...prev, endDate: newDate }))}
        format={'yyyy-MM-dd'}
        views={['year', 'month', 'day']}
      />
    </Grid>
    {/* 활동내역 입력 */}
    <Grid item xs={12}>
      <TextareaAutosize
        style={{ width: '100%', minHeight: 130, padding: 10 }}
        placeholder='경험했던 내용을 상세하게 작성하세요'
        name='description'
        value={expData.description}
        onChange={handleInputChange}
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

const ExperienceSection = ({ onComplete }) => {
  const [expData, setExpData] = useState({
    type: '',
    name: '',
    startDate: null,
    endDate: null,
    description: ''
  })
  const [Experiences, setExperiences] = useState(loadLocalStorage('experienceData'))
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    setExperiences(loadLocalStorage('experienceData'))
  }, [])

  const handleAddClick = () => {
    setIsAdding(true)
    setEditingIndex(null)
    setExpData({ type: '', name: '', startDate: null, endDate: null, description: '' })
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setExpData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveClick = async () => {
    const updatedData = editingIndex !== null ? [...Experiences] : [...Experiences, expData]
    if (editingIndex !== null) {
      updatedData[editingIndex] = expData
    }
    setExperiences(updatedData)
    saveToLocalStorage('experienceData', updatedData)
    setIsAdding(false)
    setExpData({ type: '', name: '', startDate: null, endDate: null, description: '' })
    setEditingIndex(null)

    // 백엔드에 데이터 저장
    try {
      const response = await axios.post('http://localhost:8000/user-profile/experience', {
        user_id: userId,
        experiences: updatedData
      })
      if (response.status === 201) {
        console.log('Experience saved successfully')
      }
    } catch (error) {
      console.error('Error saving experience:', error)
    }

    onComplete('experience', true)
  }

  const handleCancelClick = () => {
    setIsAdding(false)
    setExpData({ type: '', name: '', startDate: null, endDate: null, description: '' })
    setEditingIndex(null)
  }

  const handleEditItem = idx => {
    setExpData(Experiences[idx])
    setIsAdding(true)
    setEditingIndex(idx)
  }

  const handleDeleteItem = async idx => {
    if (window.confirm('저장된 목록을 삭제합니다.')) {
      const updatedExp = Experiences.filter((_, i) => i !== idx)
      setExperiences(updatedExp)
      saveToLocalStorage('experienceData', updatedExp)

      // 백엔드에 데이터 삭제 요청
      try {
        const response = await axios.delete('http://localhost:8000/user-profile/experience', {
          data: {
            user_id: userId,
            experiences: updatedExp
          }
        })
        if (response.status === 200) {
          console.log('Experience deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting experience:', error)
      }
    }
  }

  const experienceListText = (item, type) => {
    const startDate = item.startDate ? new Date(item.startDate) : null
    const endDate = item.endDate ? new Date(item.endDate) : null

    if (type === 'secondary') {
      return (
        <>
          <Typography variant='h6'>{activityType(item.type)}</Typography>
          <Typography variant='body1'>{item.name}</Typography>
          <Typography variant='body1'>
            {startDate ? startDate.toLocaleDateString() : 'N/A'} - {endDate ? endDate.toLocaleDateString() : 'N/A'}
          </Typography>
          <Typography variant='body1'>{item.description}</Typography>
        </>
      )
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'경험/활동/교육'} isAdding={isAdding} handleAddClick={handleAddClick} />
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ minHeight: 100 }}>
        {isAdding && (
          <InputForm
            handleInputChange={handleInputChange}
            expData={expData}
            setExpData={setExpData}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
          />
        )}
        <RenderList
          items={Experiences}
          renderItemText={experienceListText}
          handleEdit={handleEditItem}
          handleDelete={handleDeleteItem}
          dividerCondition={(items, idx) => items.length > 1 && idx < items.length - 1}
          isAdding={isAdding}
          message={`교육이수내역, 해외연수, 대내외활동 등의 경험을 작성해보세요!`}
        />
      </Box>
    </Box>
  )
}

export default ExperienceSection
