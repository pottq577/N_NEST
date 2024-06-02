import React, { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Avatar from '@mui/material/Avatar'
import { blue, green, orange, purple, red } from '@mui/material/colors'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import WorkIcon from '@mui/icons-material/Work'
import CodeIcon from '@mui/icons-material/Code'
import AssignmentIcon from '@mui/icons-material/Assignment'
import DescriptionIcon from '@mui/icons-material/Description'
import ProjectIcon from '@mui/icons-material/FolderSpecial'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import ListIcon from '@mui/icons-material/List'
import BuildIcon from '@mui/icons-material/Build'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import EmailIcon from '@mui/icons-material/Email'
import GitHubIcon from '@mui/icons-material/GitHub'
import InfoIcon from '@mui/icons-material/Info'
import BusinessIcon from '@mui/icons-material/Business'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import FolderIcon from '@mui/icons-material/Folder'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import LabelIcon from '@mui/icons-material/Label'

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

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
      label='자기소개서'
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

const renderList = (items, renderItem) =>
  items.length > 0 ? (
    items.map((item, index) => (
      <Box key={index} sx={{ marginBottom: 2 }}>
        {renderItem(item)}
      </Box>
    ))
  ) : (
    <Typography variant='body1'>입력된 정보가 없습니다.</Typography>
  )

const ShowPortfolioSection = ({ selectedSections, portfolioData }) => (
  <Box sx={{ marginTop: 4 }}>
    {selectedSections.profile && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: blue[500] }}>
              <PersonIcon />
            </Avatar>
          }
          title='프로필'
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <AccountCircleIcon sx={{ marginRight: 1 }} />
            <Typography variant='body1'>{portfolioData.profile.name || '입력된 정보가 없습니다.'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <EmailIcon sx={{ marginRight: 1 }} />
            <Typography variant='body1'>{portfolioData.profile.email || '입력된 정보가 없습니다.'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <GitHubIcon sx={{ marginRight: 1 }} />
            <Typography variant='body1'>{portfolioData.profile.github || '입력된 정보가 없습니다.'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ marginRight: 1 }} />
            <Typography variant='body1'>{portfolioData.profile.bio || '입력된 정보가 없습니다.'}</Typography>
          </Box>
        </CardContent>
      </Card>
    )}

    {selectedSections.certificate && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: green[500] }}>
              <AssignmentIcon />
            </Avatar>
          }
          title='자격증 및 면허증'
        />
        <CardContent>
          {renderList(portfolioData.certificate, cert => (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <AssignmentIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{cert.qualName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <BusinessIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{cert.issuingOrganization}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{cert.acquiredDate}</Typography>
              </Box>
            </>
          ))}
        </CardContent>
      </Card>
    )}

    {selectedSections.sideProject && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: purple[500] }}>
              <ProjectIcon />
            </Avatar>
          }
          title='사이드 프로젝트'
        />
        <CardContent>
          {renderList(portfolioData.sideProject, project => (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <FolderIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>프로젝트명: {project.projectName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <CalendarTodayIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>제작년도: {project.projectYear}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>설명: {project.projectDescription}</Typography>
              </Box>
            </>
          ))}
        </CardContent>
      </Card>
    )}

    {selectedSections.coverLetter && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }}>
              <DescriptionIcon />
            </Avatar>
          }
          title='자기소개서'
        />
        <CardContent>
          {renderList(portfolioData.coverLetter, letter => (
            <Typography variant='body1'>{letter.description}</Typography>
          ))}
        </CardContent>
      </Card>
    )}

    {selectedSections.education && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: orange[500] }}>
              <SchoolIcon />
            </Avatar>
          }
          title='학력'
        />
        <CardContent>
          {renderList(portfolioData.education, education => (
            <Box sx={{ marginBottom: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <AccountBalanceIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{education.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <MenuBookIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{education.major}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <CalendarTodayIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>
                  {education.startDate} ~ {education.endDate}
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    )}

    {selectedSections.experience && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: blue[500] }}>
              <WorkIcon />
            </Avatar>
          }
          title='경험'
        />
        <CardContent>
          {renderList(portfolioData.experience, experience => (
            <Box sx={{ marginBottom: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <LabelIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{experience.name}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DescriptionIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{experience.description}</Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    )}

    {selectedSections.careerDescription && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: green[500] }}>
              <BusinessCenterIcon />
            </Avatar>
          }
          title='경력 설명'
        />
        <CardContent>
          {renderList(portfolioData.careerDescription, description => (
            <Typography variant='body1'>{description.description}</Typography>
          ))}
        </CardContent>
      </Card>
    )}

    {selectedSections.careerDetail && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: purple[500] }}>
              <ListIcon />
            </Avatar>
          }
          title='경력 상세'
        />
        <CardContent>
          {renderList(portfolioData.careerDetail, career => (
            <Box sx={{ marginBottom: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <BusinessIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{career.companyName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                <WorkIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>{career.position}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ marginRight: 1 }} />
                <Typography variant='body1'>
                  {career.joinDate} ~ {career.leaveDate}
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    )}

    {selectedSections.developField && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: orange[500] }}>
              <CodeIcon />
            </Avatar>
          }
          title='개발 분야'
        />
        <CardContent>
          {portfolioData.developField.length > 0 ? (
            <Typography variant='body1'>{portfolioData.developField.join(', ')}</Typography>
          ) : (
            <Typography variant='body1'>입력된 정보가 없습니다.</Typography>
          )}
        </CardContent>
      </Card>
    )}

    {selectedSections.skill && (
      <Card sx={{ marginBottom: 4 }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }}>
              <BuildIcon />
            </Avatar>
          }
          title='기술 스택'
        />
        <CardContent>
          {portfolioData.skill.length > 0 ? (
            <Typography variant='body1'>{portfolioData.skill.join(', ')}</Typography>
          ) : (
            <Typography variant='body1'>입력된 정보가 없습니다.</Typography>
          )}
        </CardContent>
      </Card>
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
  const portfolioRef = useRef(null)

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

  const handleSaveAsPDF = async () => {
    const element = portfolioRef.current
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('portfolio.pdf')
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
      <Button variant='contained' onClick={handleClickOpen}>
        포트폴리오 생성
      </Button>
      <Button variant='contained' onClick={handleSaveAsPDF} sx={{ ml: 2 }}>
        포트폴리오 저장
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
        <Box ref={portfolioRef}>
          <ShowPortfolioSection selectedSections={selectedSections} portfolioData={portfolioData} />
        </Box>
      )}
    </Box>
  )
}

export default Portfolio
