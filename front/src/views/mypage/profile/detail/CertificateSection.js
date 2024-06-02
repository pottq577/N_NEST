import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'

import DatePicker from '@mui/lab/DatePicker'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'

import axios from 'axios'

import Header from '../components/Header'
import RenderList from '../components/RenderList'

const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const Qualifications = ({ formData, setFormData, handleSaveClick, handleCancelClick }) => (
  <Grid container spacing={2}>
    {/* 자격증명 */}
    <Grid item xs={6} my={3}>
      <TextField
        fullWidth
        label='자격증명'
        name='qualName'
        value={formData.qualName}
        onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
      />
    </Grid>

    {/* 발행처/기관 */}
    <Grid item xs={6} my={3}>
      <TextField
        fullWidth
        label='발행처/기관'
        name='issuingOrganization'
        value={formData.issuingOrganization}
        onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
      />
    </Grid>

    {/* 구분 */}
    <Grid item xs={4}>
      <FormControl fullWidth>
        <InputLabel id='acquire'>합격구분</InputLabel>
        <Select
          id='acquire'
          value={formData.acquire}
          onChange={e => setFormData(prev => ({ ...prev, acquire: e.target.value }))}
        >
          <MenuItem value='1차합격'>1차합격</MenuItem>
          <MenuItem value='2차합격'>2차합격</MenuItem>
          <MenuItem value='필기합격'>필기합격</MenuItem>
          <MenuItem value='실기합격'>실기합격</MenuItem>
          <MenuItem value='최종합격'>최종합격</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    {/* 취득일 */}
    <Grid item xs={4}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label='취득일'
          inputFormat='yyyy-MM-dd'
          value={formData.acquiredDate}
          onChange={newDate => setFormData(prev => ({ ...prev, acquiredDate: newDate }))}
          renderInput={params => <TextField {...params} />}
        />
      </LocalizationProvider>
    </Grid>

    {/* 저장/취소 버튼 */}
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

const Languages = ({ formData, setFormData, handleSaveClick, handleCancelClick }) => (
  <Grid container spacing={2}>
    {/* 언어 선택 */}
    <Grid item xs={4} my={3}>
      <FormControl fullWidth>
        <InputLabel id='language-label'>언어</InputLabel>
        <Select
          id='language-label'
          value={formData.language}
          onChange={e => setFormData(prev => ({ ...prev, language: e.target.value }))}
        >
          <MenuItem value='한국어'>한국어</MenuItem>
          <MenuItem value='영어'>영어</MenuItem>
          <MenuItem value='일본어'>일본어</MenuItem>
          <MenuItem value='중국어'>중국어</MenuItem>
          <MenuItem value='프랑스어'>프랑스어</MenuItem>
          <MenuItem value='독일어'>독일어</MenuItem>
          <MenuItem value='스페인어'>스페인어</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    {/* 어학 시험명 */}
    <Grid item xs={4} my={3}>
      <TextField
        fullWidth
        label='어학시험명'
        name='testName'
        value={formData.testName}
        onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
      />
    </Grid>
    {/* 취득일 */}
    <Grid item xs={4} my={3}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label='취득일'
          inputFormat='yyyy-MM-dd'
          value={formData.acquiredDate}
          onChange={newDate => setFormData(prev => ({ ...prev, acquiredDate: newDate }))}
          renderInput={params => <TextField {...params} />}
        />
      </LocalizationProvider>
    </Grid>
    {/* 점수 입력 */}
    <Grid item xs={2}>
      <TextField
        fullWidth
        label='점수'
        name='score'
        value={formData.score}
        onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
      />
    </Grid>
    {/* 저장/취소 버튼 */}
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

const Awards = ({ formData, setFormData, handleSaveClick, handleCancelClick }) => (
  <Grid container spacing={2}>
    {/* 수상·공모전명 */}
    <Grid item xs={6} my={3}>
      <TextField
        fullWidth
        label='수상·공모전명'
        name='awardName'
        value={formData.awardName}
        onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
      />
    </Grid>

    {/* 수상·공모일 */}
    <Grid item xs={4} my={3}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label='수상일'
          inputFormat='yyyy-MM-dd'
          value={formData.acquiredDate}
          onChange={newDate => setFormData(prev => ({ ...prev, acquiredDate: newDate }))}
          renderInput={params => <TextField {...params} />}
        />
      </LocalizationProvider>
    </Grid>

    {/* 수여·주최기관 */}
    <Grid item xs={4}>
      <TextField
        fullWidth
        label='수여·주최기관'
        name='awardOrg'
        value={formData.awardOrg}
        onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
      />
    </Grid>

    {/* 저장/취소 버튼 */}
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

const InputForm = ({ isAdding, selectedCategory, handleCategoryChange, handleCancelClick }) => {
  return (
    <>
      {isAdding && (
        <Grid container alignItems='center' spacing={5}>
          <Grid item xs={10}>
            <FormControl fullWidth>
              <InputLabel id='category-label'>구분</InputLabel>
              <Select labelId='category-label' value={selectedCategory} onChange={handleCategoryChange}>
                <MenuItem value='qualifications'>자격증·면허증</MenuItem>
                <MenuItem value='languages'>어학시험</MenuItem>
                <MenuItem value='awards'>수상내역/공모전</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {!selectedCategory && (
            <Grid item xs={2}>
              <Button onClick={handleCancelClick} variant='contained'>
                취소
              </Button>
            </Grid>
          )}
        </Grid>
      )}
    </>
  )
}

const CertificateSection = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    qualName: '',
    issuingOrganization: '',
    acquire: '',
    acquiredDate: null,
    language: '',
    testName: '',
    testScore: '',
    score: '',
    awardName: '',
    awardOrg: ''
  })
  const [isAdding, setIsAdding] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [savedData, setSavedData] = useState(loadLocalStorage('certificateData'))
  const [editingIndex, setEditingIndex] = useState(null) // 수정 인덱스 추가
  const [userId, setUserId] = useState('')

  useEffect(() => {
    setSavedData(loadLocalStorage('certificateData'))
  }, [])

  const handleCategoryChange = e => setSelectedCategory(e.target.value)

  const handleAddClick = () => setIsAdding(true)

  const handleSaveClick = async () => {
    const updatedData = editingIndex !== null ? [...savedData] : [...savedData, formData]
    if (editingIndex !== null) {
      updatedData[editingIndex] = formData
    }
    setSavedData(updatedData)
    saveToLocalStorage('certificateData', updatedData)
    setEditingIndex(null)
    setFormData({
      qualName: '',
      issuingOrganization: '',
      acquire: '',
      acquiredDate: null,
      language: '',
      testName: '',
      testScore: '',
      score: '',
      awardName: '',
      awardOrg: ''
    })
    setIsAdding(false)
    setSelectedCategory('')

    // 백엔드에 데이터 저장
    try {
      const response = await axios.post('http://localhost:8000/user-profile/certificate', {
        // user_id: userId,
        certificates: updatedData
      })
      if (response.status === 201) {
        console.log('Certificate saved successfully')
      }
    } catch (error) {
      console.error('Error saving certificate:', error)
    }

    onComplete('certificate', true)
  }

  const handleCancelClick = () => {
    setIsAdding(false)
    setFormData({
      qualName: '',
      issuingOrganization: '',
      acquire: '',
      acquiredDate: null,
      language: '',
      testName: '',
      score: '',
      awardName: '',
      awardOrg: ''
    })
    setSelectedCategory('')
  }

  const handleEditCertificate = index => {
    const item = savedData[index]
    let category = ''

    // 카테고리 결정 로직
    if (item.testName) {
      // 어학 시험
      category = 'languages'
    } else if (item.awardName) {
      // 수상/공모전
      category = 'awards'
    } else {
      // 자격증
      category = 'qualifications'
    }
    setSelectedCategory(category) // 카테고리 선택 업데이트
    setFormData(savedData[index]) // 편집할 데이터로 formData 설정
    setIsAdding(true)
    setEditingIndex(index) // 수정 인덱스 설정
  }

  const handleDeleteCertificate = async index => {
    if (window.confirm('저장된 목록을 삭제하시겠습니까?')) {
      const updatedData = savedData.filter((_, idx) => idx !== index)
      setSavedData(updatedData)
      saveToLocalStorage('certificateData', updatedData)

      // 백엔드에 데이터 삭제 요청
      try {
        const response = await axios.delete('http://localhost:8000/user-profile/certificate', {
          data: {
            user_id: userId,
            certificates: updatedData
          }
        })
        if (response.status === 200) {
          console.log('Certificate deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting certificate:', error)
      }
    }
    setSelectedCategory('')
  }

  const RenderListItemTextPrimary = item => {
    if (item.testName) {
      // 어학 시험의 경우
      return `${item.testName} (${item.language})`
    } else if (item.awardName) {
      // 수상/공모전의 경우
      return `${item.awardName}`
    } else {
      // 자격증의 경우
      return `${item.qualName} (${item.acquire})`
    }
  }

  const RenderListItemTextSecondary = item => {
    const acquiredDate = item.acquiredDate ? new Date(item.acquiredDate) : null

    if (item.testName) {
      // 어학 시험의 경우
      return `${item.score} | ${acquiredDate?.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit'
      })}`
    } else if (item.awardName) {
      // 수상/공모전의 경우
      return `${item.awardOrg} | ${acquiredDate?.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit'
      })}`
    } else {
      // 자격증의 경우
      return `${item.issuingOrganization} | ${acquiredDate?.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit'
      })}`
    }
  }

  const certificateListText = (item, type) => {
    if (type === 'primary') {
      return RenderListItemTextPrimary(item)
    } else {
      return RenderListItemTextSecondary(item)
    }
  }

  const renderForm = () => {
    switch (selectedCategory) {
      case 'qualifications':
        return (
          <Qualifications
            formData={formData}
            setFormData={setFormData}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
          />
        )
      case 'languages':
        return (
          <Languages
            formData={formData}
            setFormData={setFormData}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
          />
        )
      case 'awards':
        return (
          <Awards
            formData={formData}
            setFormData={setFormData}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
          />
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'자격/어학/수상'} isAdding={isAdding} handleAddClick={handleAddClick} />
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ minHeight: 100 }}>
        <InputForm
          isAdding={isAdding}
          selectedCategory={selectedCategory}
          handleCategoryChange={handleCategoryChange}
          handleCancelClick={handleCancelClick}
        />
        {isAdding && renderForm()}

        <RenderList
          items={savedData}
          renderItemText={certificateListText}
          handleEdit={handleEditCertificate}
          handleDelete={handleDeleteCertificate}
          dividerCondition={(items, index) => items.length > 1 && index < items.length - 1}
          isAdding={isAdding}
          message={'자격/어학/수상 내역을 입력해주세요.'}
        />
      </Box>
    </Box>
  )
}

export default CertificateSection
