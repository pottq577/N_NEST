import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import TextareaAutosize from '@mui/material/TextareaAutosize'

import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import Header from '../components/Header'
import EmptyMessage from '../components/EmptyMessage'

const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const case1 = `1) 프로젝트명:

- 연계/소속회사 : (연계/소속회사가 없을 경우, 해당 항목을 지우고 작성하세요)

- 수행 기간 : YYYY.MM ~ YYYY.MM (약 N개월)

- 주요 역할 : 화면 설계 및 서비스 기획

- 업무 성과 : `

const case2 = `1) 프로젝트명:

- 연계/소속회사 : (연계/소속회사가 없을 경우, 해당 항목을 지우고 작성하세요)

- 주요 업무 : 백엔드 담당

- 담당 역할 :

- 기술 스택 : (운영체제, 개발언어, 데이터베이스 등)

- 업무 기간 : YYYY.MM ~ YYYY.MM (약 N개월)

- 개발 인원 :

- 상세 내용 : `

const case3 = `1) 주요 업무 : 콘텐츠 제작

- 사용 Tool : ex) photoshop

- 업무기간 : YYYY.MM ~ YYYY.MM (약 N개월)

- 포트폴리오 URL :

- 상세내용 : `

const case4 = `1) 프로젝트명:

- 연계/소속회사 : (연계/소속회사가 없을 경우, 해당 항목을 지우고 작성하세요)

- 주요 업무 :

- 수행 기간 : YYYY.MM ~ YYYY.MM (약 N개월)

- 담당 지역 :

- 계약 건수 : 월 평균 _건

- 고객 수 : ex. 인수 30%, 신규개척 70%

- 상세 내용 : `

const casePlaceholder = `최근 경력부터 역순으로 작성하며, 주요업무, 내용 단위로 본인의 역할과 객관적인 성과를 작성해보세요.
(업무 주요내용, 기간, 역할, 기여도, 성과 등을 작성하며 본인의 역량과 업무 능숙도를 어필해보세요.)`

const InputForm = ({
  handleChipClick,
  careerDescription,
  setCareerDescription,
  handleSaveClick,
  handleCancelClick
}) => (
  <Grid container spacing={2}>
    {/* 양식 추천 */}
    <Grid item xs={12} my={2} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant='h6' fontWeight='bold'>
        양식 추천
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, ml: 5 }}>
        <Chip label='프로젝트형' onClick={() => handleChipClick('프로젝트형')} />
        <Chip label='개발 기술형' onClick={() => handleChipClick('개발 기술형')} />
        <Chip label='디자이너형' onClick={() => handleChipClick('디자이너형')} />
        <Chip label='영업 성과형' onClick={() => handleChipClick('영업 성과형')} />
        <Chip label='없음' onClick={() => handleChipClick('기타')} />
      </Box>
    </Grid>

    <Grid item xs={12}>
      <TextareaAutosize
        style={{ width: '100%', padding: 15, minHeight: 200 }}
        value={careerDescription}
        onChange={e => setCareerDescription(e.target.value)}
        placeholder={casePlaceholder}
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

const CareerDescSection = ({ onComplete }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedChip, setSelectedChip] = useState('')
  const [descriptions, setDescriptions] = useState(loadLocalStorage('careerDescriptions'))
  const [careerDescription, setCareerDescription] = useState('')

  useEffect(() => {
    setDescriptions(loadLocalStorage('careerDescriptions'))
  }, [])

  const handleAddClick = () => {
    setIsAdding(true)
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsAdding(false)
    setIsEditing(false)
    setCareerDescription('')
  }

  const handleChipClick = chipLabel => {
    const cases = { 프로젝트형: case1, '개발 기술형': case2, 디자이너형: case3, '영업 성과형': case4, 기타: '' }
    setCareerDescription(cases[chipLabel] || '')
    setSelectedChip(chipLabel)
  }

  const handleSaveClick = () => {
    const updatedDescriptions = [...descriptions, { description: careerDescription }]
    setDescriptions(updatedDescriptions)
    saveToLocalStorage('careerDescriptions', updatedDescriptions) // 로컬 저장소에 데이터 저장
    setIsAdding(false)
    setIsEditing(false)
    setCareerDescription('')
    onComplete('careerDesc', true)
  }

  const handleEditCareerDesc = index => {
    setIsAdding(true)
    setIsEditing(true)
    setCareerDescription(descriptions[index].description)
    setDescriptions(descriptions.filter((_, idx) => idx !== index))
  }

  const handleDeleteCareerDesc = index => {
    if (window.confirm('저장된 경력기술서를 삭제하시겠습니까?')) {
      const updatedDescriptions = descriptions.filter((_, idx) => idx !== index)
      setDescriptions(updatedDescriptions)
      saveToLocalStorage('careerDescriptions', updatedDescriptions)
    }
  }

  const RenderCareerDesc = () => {
    if (isAdding) {
      return null
    }

    return (
      <>
        {descriptions.length === 0 ? (
          <EmptyMessage message={`경력기술서를 작성해주세요.`} />
        ) : (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 5 }}>
            <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
              {descriptions.length > 0
                ? descriptions[descriptions.length - 1].description
                : '경력기술서 내용이 없습니다.'}
            </Typography>
            <Box>
              <IconButton onClick={() => handleEditCareerDesc(descriptions.length - 1)} sx={{ marginRight: 1 }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteCareerDesc(descriptions.length - 1)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Header header={'경력기술서'} isAdding={isAdding} handleAddClick={handleAddClick} />
      <Divider sx={{ mb: 2 }} />

      <Box style={{ minHeight: 100 }}>
        {isAdding && (
          <InputForm
            handleChipClick={handleChipClick}
            careerDescription={careerDescription}
            setCareerDescription={setCareerDescription}
            handleSaveClick={handleSaveClick}
            handleCancelClick={handleCancelClick}
          />
        )}
        <RenderCareerDesc />
      </Box>
    </Box>
  )
}

export default CareerDescSection