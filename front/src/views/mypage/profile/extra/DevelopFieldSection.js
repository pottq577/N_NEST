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

import Header from '../components/Header'
import EmptyMessage from '../components/EmptyMessage'

const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const recommendedDevelopFields = [
  '서버/백엔드',
  '프론트엔드',
  '인공지능',
  '안드로이드',
  'iOS',
  '머신러닝',
  '사물인터넷(IoT)',
  '크로스 플랫폼'
] // 예시 개발 분야 리스트

const DevelopFieldSection = ({ onComplete }) => {
  const [developField, setDevelopField] = useState('') // 선택하거나 입력한 개발 분야
  const [developFields, setDevelopFields] = useState(loadLocalStorage('developFields'))
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setDevelopFields(loadLocalStorage('developFields'))
  }, [])

  const handleAddClick = () => {
    setIsAdding(true)
    setIsEditing(false)
  }

  const handleAddDevelopField = (event, newValue) => {
    if (newValue && !developFields.includes(newValue)) {
      const updatedDevelopFields = [...developFields, newValue]
      setDevelopFields(updatedDevelopFields)
      saveToLocalStorage('developFields', updatedDevelopFields)
    }
  }

  const handleSaveDevelopFields = () => {
    // 백엔드 개발 분야 저장 로직 구현 필요
    setIsAdding(false)
    setIsEditing(true)
    onComplete('developFields', true)
    localStorage.setItem('developFields', JSON.stringify(developFields))
  }

  const handleDeleteDevelopField = fieldToDelete => () => {
    const updatedDevelopFields = developFields.filter(field => field !== fieldToDelete)
    setDevelopFields(updatedDevelopFields)
    saveToLocalStorage('developFields', updatedDevelopFields)
  }

  const handleCancelInput = () => {
    setIsAdding(false)
    setDevelopField('')
  }

  const InputForm = () => (
    <Grid container spacing={2} columns={3} alignItems='flex-end'>
      <Grid item xs={12}>
        <Autocomplete
          freeSolo
          options={recommendedDevelopFields}
          value={developField}
          onChange={handleAddDevelopField}
          onInputChange={(event, newInputValue) => {
            setDevelopField(newInputValue)
          }}
          renderInput={params => (
            <TextField {...params} label='개발 분야를 입력해주세요' variant='outlined' fullWidth />
          )}
        />
      </Grid>

      {/* 추천 개발 분야 */}
      <Grid item xs={12} sx={{ mb: 5 }}>
        <Typography variant='subtitle1' fontWeight={'bold'}>
          추천 개발 분야
        </Typography>
        <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mt: 2, flexWrap: 'wrap' }}>
          {recommendedDevelopFields.map((recommendedField, index) => (
            <Chip
              key={index}
              label={recommendedField}
              clickable
              onClick={() => handleAddDevelopField(null, recommendedField)}
            />
          ))}
        </Stack>
      </Grid>

      {/* 나의 개발 분야 */}
      {developFields.length > 0 && (
        <Grid item xs={12}>
          <Typography variant='subtitle1' fontWeight={'bold'}>
            나의 개발 분야
          </Typography>
          <Stack direction='row' spacing={1} sx={{ mt: 2, mb: 5, flexWrap: 'wrap' }}>
            {developFields.map((field, index) => (
              <Chip key={index} label={field} color='secondary' onDelete={handleDeleteDevelopField(field)} />
            ))}
          </Stack>
        </Grid>
      )}

      {/* 저장/취소 버튼 */}
      <Grid item xs={12} sx={{ mb: 10 }}>
        <Button variant='contained' onClick={handleSaveDevelopFields} style={{ marginRight: 10 }}>
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
      {developFields.map((myFields, index) => (
        <Chip key={index} label={myFields} color='primary' />
      ))}
    </Stack>
  )

  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'개발 분야'} isAdding={isAdding} handleAddClick={handleAddClick} isEditing={isEditing} />
      <Divider sx={{ mb: 2 }} />

      <Box style={{ minHeight: 100 }}>
        {isAdding && <InputForm />}
        {developFields.length === 0 ? <EmptyMessage message={`보유 개발 분야를 선택해주세요.`} /> : <RenderList />}
      </Box>
    </Box>
  )
}

export default DevelopFieldSection
