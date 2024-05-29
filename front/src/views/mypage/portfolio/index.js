import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'

const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || []

const CreateDialog = ({ selectedSections, handleSectionChange }) => (
  <DialogContent>
    <FormControlLabel
      control={<Checkbox checked={selectedSections.profile} onChange={handleSectionChange('profile')} />}
      label='프로필'
    />
    <FormControlLabel
      control={<Checkbox checked={selectedSections.certificate} onChange={handleSectionChange('certificate')} />}
      label='자격증 및 면허증'
    />
    <FormControlLabel
      control={<Checkbox checked={selectedSections.sideProject} onChange={handleSectionChange('sideProject')} />}
      label='사이드 프로젝트'
    />
    <FormControlLabel
      control={<Checkbox checked={selectedSections.coverLetter} onChange={handleSectionChange('coverLetter')} />}
      label='커버레터'
    />
    <FormControlLabel
      control={<Checkbox checked={selectedSections.education} onChange={handleSectionChange('education')} />}
      label='학력'
    />
    <FormControlLabel
      control={<Checkbox checked={selectedSections.experience} onChange={handleSectionChange('experience')} />}
      label='경험'
    />
    <FormControlLabel
      control={
        <Checkbox checked={selectedSections.careerDescription} onChange={handleSectionChange('careerDescription')} />
      }
      label='경력 설명'
    />
    <FormControlLabel
      control={<Checkbox checked={selectedSections.careerDetail} onChange={handleSectionChange('careerDetail')} />}
      label='경력 상세'
    />
    <FormControlLabel
      control={<Checkbox checked={selectedSections.developField} onChange={handleSectionChange('developField')} />}
      label='개발 분야'
    />
    <FormControlLabel
      control={<Checkbox checked={selectedSections.skill} onChange={handleSectionChange('skill')} />}
      label='기술 스택'
    />
  </DialogContent>
)

const ShowPortfolioSection = ({ selectedSections, portfolioData, renderList }) => (
  <Box sx={{ marginTop: 4 }}>
    {selectedSections.profile && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>프로필</Typography>
        <Typography variant='body1'>이름: {portfolioData.profile.name}</Typography>
        <Typography variant='body1'>이메일: {portfolioData.profile.email}</Typography>
        <Typography variant='body1'>GitHub: {portfolioData.profile.github}</Typography>
        <Typography variant='body1'>자기소개: {portfolioData.profile.bio}</Typography>
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.certificate && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>자격증 및 면허증</Typography>
        {renderList(portfolioData.certificate, cert => (
          <>
            <Typography variant='body1'>자격증명: {cert.qualName}</Typography>
            <Typography variant='body1'>발행처: {cert.issuingOrganization}</Typography>
            <Typography variant='body1'>취득일: {cert.acquiredDate}</Typography>
          </>
        ))}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.sideProject && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>사이드 프로젝트</Typography>
        {renderList(portfolioData.sideProject, project => (
          <>
            <Typography variant='body1'>프로젝트명: {project.projectName}</Typography>
            <Typography variant='body1'>제작년도: {project.projectYear}</Typography>
            <Typography variant='body1'>설명: {project.projectDescription}</Typography>
          </>
        ))}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.coverLetter && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>커버레터</Typography>
        {renderList(portfolioData.coverLetter, letter => (
          <Typography variant='body1'>{letter.description}</Typography>
        ))}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.education && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>학력</Typography>
        {renderList(portfolioData.education, education => (
          <>
            <Typography variant='body1'>학교명: {education.name}</Typography>
            <Typography variant='body1'>전공: {education.major}</Typography>
            <Typography variant='body1'>입학: {education.startDate}</Typography>
            <Typography variant='body1'>졸업: {education.endDate}</Typography>
          </>
        ))}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.experience && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>경험</Typography>
        {renderList(portfolioData.experience, experience => (
          <>
            <Typography variant='body1'>경험명: {experience.name}</Typography>
            <Typography variant='body1'>설명: {experience.description}</Typography>
          </>
        ))}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.careerDescription && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>경력 설명</Typography>
        {renderList(portfolioData.careerDescription, description => (
          <Typography variant='body1'>{description.description}</Typography>
        ))}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.careerDetail && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>경력 상세</Typography>
        {renderList(portfolioData.careerDetail, career => (
          <>
            <Typography variant='body1'>회사명: {career.companyName}</Typography>
            <Typography variant='body1'>직책: {career.position}</Typography>
            <Typography variant='body1'>
              기간: {career.joinDate} ~ {career.leaveDate}
            </Typography>
          </>
        ))}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.developField && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>개발 분야</Typography>
        {portfolioData.developField.length > 0 ? (
          <Typography variant='body1'>{portfolioData.developField.join(', ')}</Typography>
        ) : (
          <Typography variant='body1'>개발 분야 정보가 없습니다.</Typography>
        )}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}

    {selectedSections.skill && (
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant='h5'>기술 스택</Typography>
        {portfolioData.skill.length > 0 ? (
          <Typography variant='body1'>{portfolioData.skill.join(', ')}</Typography>
        ) : (
          <Typography variant='body1'>기술 스택 정보가 없습니다.</Typography>
        )}
        <Divider sx={{ marginY: 2 }} />
      </Box>
    )}
  </Box>
)

const Portfolio = () => {
  const [selectedSections, setSelectedSections] = useState({
    profile: true,
    certificate: true,
    sideProject: true,
    coverLetter: true,
    education: true,
    experience: true,
    careerDescription: true,
    careerDetail: true,
    developField: true,
    skill: true
  })

  const [portfolioData, setPortfolioData] = useState({
    profile: {},
    certificate: [],
    sideProject: [],
    coverLetter: [],
    education: [],
    experience: [],
    careerDescription: [],
    careerDetail: [],
    developField: [],
    skill: []
  })
  const [open, setOpen] = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)

  useEffect(() => {
    setPortfolioData({
      profile: loadLocalStorage('profileData'),
      certificate: loadLocalStorage('certificateData'),
      sideProject: loadLocalStorage('sideProjects'),
      coverLetter: loadLocalStorage('coverLetters'),
      education: loadLocalStorage('educationDetails'),
      experience: loadLocalStorage('experienceData'),
      careerDescription: loadLocalStorage('careerDescriptions'),
      careerDetail: loadLocalStorage('careerDetails'),
      developField: loadLocalStorage('developFields'),
      skill: loadLocalStorage('skills')
    })
  }, [])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSectionChange = section => event => {
    setSelectedSections({
      ...selectedSections,
      [section]: event.target.checked
    })
  }

  const handleGeneratePortfolio = () => {
    setShowPortfolio(true)
    setOpen(false)
  }

  const renderList = (items, renderItem) =>
    items.length > 0 ? (
      items.map((item, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
          {renderItem(item)}
        </Box>
      ))
    ) : (
      <Typography variant='body1'>해당 항목이 없습니다.</Typography>
    )

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant='h4' gutterBottom>
        포트폴리오
      </Typography>
      <Button variant='contained' onClick={handleClickOpen}>
        포트폴리오 생성
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>포트폴리오 생성</DialogTitle>
        <CreateDialog selectedSections={selectedSections} handleSectionChange={handleSectionChange} />
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button onClick={handleGeneratePortfolio} variant='contained'>
            생성
          </Button>
        </DialogActions>
      </Dialog>

      {showPortfolio && (
        <ShowPortfolioSection
          selectedSections={selectedSections}
          portfolioData={portfolioData}
          renderList={renderList}
        />
      )}
    </Box>
  )
}

export default Portfolio