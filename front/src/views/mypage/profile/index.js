import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import SwipeableViews from 'react-swipeable-views'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

import IconButton from '@mui/material/IconButton'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import { styled } from '@mui/material/styles'

import SkillsSection from './extra/SkillsSection'
import CareerSection from './extra/CareerSection'
import ProfileSection from './ProfileSection'
import EducationSection from './detail/EducationSection'
import ExperienceSection from './detail/ExperienceSection'
import CareerDescSection from './extra/CareerDescSection'
import CoverLetterSection from './detail/CoverLetterSection'
import CertificateSection from './detail/CertificateSection'
import SideProjectSection from './extra/SideProjectSection'
import DevelopFieldSection from './extra/DevelopFieldSection'

const categories = [
  { name: '학력', id: 'education' },
  { name: '자기소개서', id: 'coverletter' },
  { name: '경험/활동/교육', id: 'experience' },
  { name: '자격/어학/수상', id: 'certificate' }
]

const extraCategories = [
  { name: '스킬', id: 'skills' },
  { name: '개발 분야', id: 'develop-field' },
  { name: '경력', id: 'career' },
  { name: '사이드 프로젝트', id: 'side-project' },
  { name: '경력기술서', id: 'career-desc' }
]

const StyledSummarySection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary
}))

const Progress = ({ completionRate }) => (
  <Box>
    <Box display='flex' justifyContent='space-between' alignItems='center' padding={2}>
      <Typography variant='subtitle1' fontWeight={'bold'} component='h2' gutterBottom>
        프로필 완성도
      </Typography>
      <Typography variant='subtitle1' fontWeight={'bold'} color='textSecondary'>
        {`${completionRate}%`}
      </Typography>
    </Box>

    <Box display='flex' alignItems='center'>
      <Box width='100%' mr={1}>
        <LinearProgress variant='determinate' value={completionRate} />
      </Box>
    </Box>
  </Box>
)

const DetailSections = ({ extraSections, onComplete }) => (
  <Box sx={{ width: '100%' }}>
    <EducationSection id='education' onComplete={onComplete} />
    <Box sx={{ my: 10 }} />

    <CoverLetterSection id='coverletter' onComplete={onComplete} />
    <Box sx={{ my: 10 }} />

    {extraSections.includes('experience') && (
      <>
        <ExperienceSection id='experience' onComplete={onComplete} />
        <Box sx={{ my: 10 }} />
      </>
    )}
    {extraSections.includes('certificate') && (
      <>
        <CertificateSection id='certificate' onComplete={onComplete} />
        <Box sx={{ my: 10 }} />
      </>
    )}
  </Box>
)

const ExtraSections = ({ onComplete }) => (
  <Box sx={{ width: '100%' }}>
    <SkillsSection id='skills' onComplete={onComplete} />
    <Box sx={{ my: 10 }} />

    <DevelopFieldSection id='develop-field' onComplete={onComplete} />
    <Box sx={{ my: 10 }} />

    <CareerSection id='career' onComplete={onComplete} />
    <Box sx={{ my: 10 }} />

    <SideProjectSection id='side-project' onComplete={onComplete} />
    <Box sx={{ my: 10 }} />

    <CareerDescSection id='career-desc' onComplete={onComplete} />
    <Box sx={{ my: 10 }} />
  </Box>
)

const ResumeList = ({ addSection, removeSection, extraSections }) => (
  <List sx={{ padding: 3 }}>
    {categories.map(category => (
      <React.Fragment key={category.name}>
        <ListItem
          disableGutters
          sx={{ py: 0.5 }}
          secondaryAction={
            !['학력', '자기소개서'].includes(category.name) &&
            (extraSections.includes(category.id) ? (
              <IconButton edge='end' aria-label='remove' onClick={() => removeSection(category.id)}>
                <RemoveCircleOutlineIcon />
              </IconButton>
            ) : (
              <IconButton edge='end' aria-label='add' onClick={() => addSection(category.id)}>
                <AddCircleOutlineIcon />
              </IconButton>
            ))
          }
        >
          <ListItemText
            primary={category.name}
            sx={{
              '.MuiTypography-body1': {
                fontSize: extraSections.includes(category.id) ? 'bold' : 'normal',
                color: extraSections.includes(category.id) ? '#007bff' : '#495057',
                fontWeight: 'bold'
              }
            }}
          />
        </ListItem>
      </React.Fragment>
    ))}
  </List>
)

const ExtraList = () => (
  <List sx={{ padding: 3 }}>
    {extraCategories.map(category => (
      <React.Fragment key={category.name}>
        <ListItem disableGutters sx={{ py: 0.5 }}>
          <ListItemText
            primary={category.name}
            sx={{
              '.MuiTypography-body1': {
                color: '#007bff',
                fontWeight: 'bold'
              }
            }}
          />
        </ListItem>
      </React.Fragment>
    ))}
  </List>
)

const SummarySections = ({ addSection, removeSection, extraSections, completionRate, tab, setTab }) => (
  <Grid item xs={12} md={3.5}>
    <StyledSummarySection elevation={3}>
      <Progress completionRate={completionRate} />
      <Divider sx={{ mt: 3, mb: 2 }} />

      <SwipeableViews index={tab} onChangeIndex={setTab}>
        <ResumeList addSection={addSection} removeSection={removeSection} extraSections={extraSections} />
        <ExtraList />
      </SwipeableViews>

      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <IconButton disabled={tab === 0} onClick={() => setTab(tab - 1)}>
          <ArrowBackIcon />
        </IconButton>
        <IconButton disabled={tab === 1} onClick={() => setTab(tab + 1)}>
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </StyledSummarySection>
  </Grid>
)

const ProfileManage = () => {
  const [sectionCompletion, setSectionCompletion] = useState({
    education: false,
    career: false,
    skills: false,
    coverLetter: false,
    experience: false,
    certificate: false,
    careerDesc: false
  })
  const [extraSections, setExtraSections] = useState([])
  const [tab, setTab] = useState(0)

  const addSection = sectionId => {
    if (!extraSections.includes(sectionId)) {
      setExtraSections([...extraSections, sectionId])
    }
  }

  const removeSection = sectionId => {
    setExtraSections(extraSections.filter(id => id !== sectionId))
  }

  const handleSectionComplete = (sectionId, isComplete) => {
    setSectionCompletion(prev => ({
      ...prev,
      [sectionId]: isComplete
    }))
  }

  const calculateCompletion = () => {
    const requiredSections = ['education', 'career', 'skills', 'coverLetter']
    const optionalSections = ['experience', 'certificate', 'careerDesc']

    const requiredWeight = 70 / requiredSections.length
    const optionalWeight = 30 / optionalSections.length

    const completedRequired = requiredSections.filter(sec => sectionCompletion[sec]).length
    const completedOptional = optionalSections.filter(sec => sectionCompletion[sec]).length

    let rate = Math.floor(completedRequired * requiredWeight + completedOptional * optionalWeight)

    const roundTo = rate % 10 === 0 ? 10 : 5
    rate = Math.round(rate / roundTo) * roundTo

    return rate
  }

  const compRate = calculateCompletion()

  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 3 }}>
      <Grid container spacing={10} justifyContent='center'>
        <Grid item xs={12} md={8}>
          <ProfileSection />
          {tab === 0 ? (
            <DetailSections extraSections={extraSections} onComplete={handleSectionComplete} />
          ) : (
            <Box sx={{ width: '100%' }}>
              <ExtraSections onComplete={handleSectionComplete} />
            </Box>
          )}
        </Grid>
        <SummarySections
          addSection={addSection}
          removeSection={removeSection}
          extraSections={extraSections}
          completionRate={compRate}
          tab={tab}
          setTab={setTab}
        />
      </Grid>
    </Box>
  )
}

export default ProfileManage