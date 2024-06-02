import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import axios from 'axios'

import Header from '../components/Header'
import EmptyMessage from '../components/EmptyMessage'

const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const recommendedSkills = [
  'Vue.js',
  'Java',
  'JSP',
  'JavaScript',
  'jQuery',
  'PHP',
  'Ajax',
  'HTML5',
  'iBATIS',
  'Spring Boot'
] // 예시 스킬 리스트

const SkillsSection = ({ onComplete }) => {
  const [skill, setSkill] = useState('') // 선택하거나 입력한 스킬
  const [skills, setSkills] = useState(loadLocalStorage('skills'))
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    setSkills(loadLocalStorage('skills'))
  }, [])

  const handleAddClick = () => {
    setIsAdding(true)
    setIsEditing(false)
  }

  const handleAddSkill = (event, newValue) => {
    if (newValue && !skills.includes(newValue)) {
      const updatedSkills = [...skills, newValue]
      setSkills(updatedSkills)
      saveToLocalStorage('skills', updatedSkills)
    }
  }

  const handleSaveSkills = async () => {
    setIsAdding(false)
    setIsEditing(true)

    try {
      const response = await axios.post('http://localhost:8000/user-profile/skills', {
        user_id: userId,
        skills: skills
      })
      if (response.status === 201) {
        console.log('Skills saved successfully')
      }
    } catch (error) {
      console.error('Error saving skills:', error)
    }

    onComplete('skills', true)
    localStorage.setItem('skills', JSON.stringify(skills))
  }

  const handleDeleteSkill = skillToDelete => async () => {
    const updatedSkills = skills.filter(skill => skill !== skillToDelete)
    setSkills(updatedSkills)
    saveToLocalStorage('skills', updatedSkills)

    try {
      const response = await axios.delete('http://localhost:8000/user-profile/skills', {
        data: {
          user_id: userId,
          skills: updatedSkills
        }
      })
      if (response.status === 200) {
        console.log('Skills deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting skills:', error)
    }
  }

  const handleCancelInput = () => {
    setIsAdding(false)
    setSkill('')
  }

  const InputForm = () => (
    <Grid container spacing={2} columns={3} alignItems='flex-end'>
      <Grid item xs={12}>
        <Autocomplete
          freeSolo
          options={recommendedSkills}
          value={skill}
          onChange={handleAddSkill}
          onInputChange={(event, newInputValue) => {
            setSkill(newInputValue)
          }}
          renderInput={params => (
            <TextField {...params} label='툴/소프트스킬을 입력해주세요' variant='outlined' fullWidth />
          )}
        />
      </Grid>

      {/* 추천 스킬 */}
      <Grid item xs={12} sx={{ mb: 5 }}>
        <Typography variant='subtitle1' fontWeight={'bold'}>
          추천 스킬
        </Typography>
        <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mt: 2, flexWrap: 'wrap' }}>
          {recommendedSkills.map((recommendedSkill, index) => (
            <Chip
              key={index}
              label={recommendedSkill}
              clickable
              onClick={() => handleAddSkill(null, recommendedSkill)}
            />
          ))}
        </Stack>
      </Grid>

      {/* 나의 스킬 */}
      {skills.length > 0 && (
        <Grid item xs={12}>
          <Typography variant='subtitle1' fontWeight={'bold'}>
            나의 스킬
          </Typography>
          <Stack direction='row' spacing={1} sx={{ mt: 2, mb: 5, flexWrap: 'wrap' }}>
            {skills.map((skill, index) => (
              <Chip key={index} label={skill} color='secondary' onDelete={handleDeleteSkill(skill)} />
            ))}
          </Stack>
        </Grid>
      )}

      {/* 저장/취소 버튼 */}
      <Grid item xs={12} sx={{ mb: 10 }}>
        <Button variant='contained' onClick={handleSaveSkills} style={{ marginRight: 10 }}>
          저장
        </Button>
        <Button variant='contained' onClick={handleCancelInput}>
          취소
        </Button>
      </Grid>
    </Grid>
  )

  const RenderList = () => (
    <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mt: 5, ml: 2, flexWrap: 'wrap' }}>
      {skills.map((mySkills, index) => (
        <Chip key={index} label={mySkills} color='primary' />
      ))}
    </Stack>
  )

  // <Box ref={inputFormRef} sx={{ width: '100%' }}>
  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'스킬'} isAdding={isAdding} handleAddClick={handleAddClick} isEditing={isEditing} />
      <Divider sx={{ mb: 2 }} />

      <Box style={{ minHeight: 100 }}>
        {isAdding && <InputForm />}
        {skills.length === 0 ? <EmptyMessage message={`보유 스킬을 선택해주세요.`} /> : <RenderList />}
      </Box>
    </Box>
  )
}

export default SkillsSection
