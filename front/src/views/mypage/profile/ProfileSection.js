import React, { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'

import { styled } from '@mui/material/styles'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import EditNoteIcon from '@mui/icons-material/EditNote'
import EmailIcon from '@mui/icons-material/Email'
import GitHubIcon from '@mui/icons-material/GitHub'

import { auth } from 'lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 100,
  height: 100,
  border: '10'
}))

const loadLocalStorage = key => JSON.parse(localStorage.getItem(key)) || null
const saveToLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const PersonalDetail = ({ profileData }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      minHeight: 150
    }}
  >
    <Typography variant='h4' fontWeight='bold' sx={{ mb: 2 }}>
      {profileData.name}
    </Typography>
    <Box sx={{ flexDirection: 'row', display: 'flex', mb: 2 }}>
      <EmailIcon sx={{ mr: 2 }} />
      <Typography variant='body1'>{profileData.email}</Typography>
    </Box>
    <Box sx={{ flexDirection: 'row', display: 'flex' }}>
      <GitHubIcon sx={{ mr: 2 }} />
      <Link
        href={profileData.github}
        target='_blank'
        rel='noopener noreferrer'
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          '&:hover': {
            color: 'primary.main',
            textDecoration: 'underline'
          }
        }}
      >
        <Typography variant='body1'>{profileData.github}</Typography>
      </Link>
    </Box>
  </Box>
)

const PersonalPic = ({ imgSrc, onPicChange, fileInputRef, onEditClick, onDeleteClick }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
      mb: 10
    }}
  >
    <ImgStyled src={imgSrc} alt='프로필 사진' />
    <IconButton onClick={onEditClick}>
      <EditIcon />
    </IconButton>
    <IconButton onClick={onDeleteClick}>
      <DeleteIcon />
    </IconButton>
    <input
      type='file'
      onChange={onPicChange}
      style={{ display: 'none' }}
      ref={fileInputRef}
      accept='image/*' // 파일 선택기에 이미지만 표시
    />
  </Box>
)

const ProfileEditDialog = ({
  open,
  handleDialogClose,
  imgSrc,
  onPicChange,
  fileInputRef,
  onEditClick,
  onDeleteClick,
  profileFields,
  handleProfileChange,
  handleDialogSave
}) => (
  <Dialog open={open} onClose={handleDialogClose}>
    <DialogTitle>기본 정보</DialogTitle>
    <DialogContent sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
      {/* 프로필 사진 */}
      <PersonalPic
        imgSrc={imgSrc}
        onPicChange={onPicChange}
        fileInputRef={fileInputRef}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
      />
      {/* 사용자 정보 수정 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: 350 }}>
        {profileFields.map(field => (
          <TextField
            key={field.key}
            label={field.label}
            value={field.value}
            onChange={e => handleProfileChange(field.key, e.target.value)}
            fullWidth
            required={field.required}
            placeholder={field.placeholder}
          />
        ))}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleDialogClose}>취소</Button>
      <Button onClick={handleDialogSave} variant='contained'>
        저장
      </Button>
    </DialogActions>
  </Dialog>
)

const ProfileSection = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    github: '',
    bio: ''
  })

  const [tempProfileData, setTempProfileData] = useState({
    name: '홍길동',
    email: 'honggildong@example.com',
    github: 'https://github.com/example',
    bio: ''
  })
  const defaultImg = '/images/avatars/1.png'
  const [imgSrc, setImgSrc] = useState(defaultImg)
  const [tempImgSrc, setTempImgSrc] = useState(defaultImg)
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef(null)

  const profileFields = [
    { label: '이름', value: tempProfileData.name, key: 'name', required: true },
    { label: '깃허브 주소', value: tempProfileData.github, key: 'github', required: true },
    { label: '이메일', value: tempProfileData.email, key: 'email', required: true },
    { label: '간단 소개', value: tempProfileData.bio, key: 'bio', placeholder: '입력' }
  ]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const githubUsername = user.reloadUserInfo.screenName
        const githubUrl = `https://github.com/${githubUsername}`
        setProfileData({
          name: user.displayName,
          email: user.email,
          github: githubUrl,
          bio: ''
        })
        setImgSrc(user.photoURL || defaultImg)
        setTempImgSrc(user.photoURL || defaultImg)
      }
    })

    return () => unsubscribe()
  }, [])

  const onPicChange = event => {
    const reader = new FileReader()
    const { files } = event.target
    if (files && files.length !== 0) {
      reader.onload = () => setTempImgSrc(reader.result)
      reader.readAsDataURL(files[0])
    }
  }

  const onEditClick = () => {
    fileInputRef.current.click()
  }

  const onDeleteClick = () => {
    if (window.confirm('프로필 사진을 기본값으로 초기화합니다.')) {
      setTempImgSrc(defaultImg)
    }
  }

  const handleDialogOpen = () => {
    setTempProfileData(profileData)
    setTempImgSrc(imgSrc)
    setOpen(true)
  }

  const handleDialogClose = () => {
    setOpen(false)
  }

  const handleDialogSave = () => {
    setProfileData(tempProfileData)
    setImgSrc(tempImgSrc)
    saveToLocalStorage('profileData', tempProfileData)
    saveToLocalStorage('imgSrc', tempImgSrc)
    setOpen(false)
  }

  const handleProfileChange = (field, value) => {
    setTempProfileData(prevData => ({
      ...prevData,
      [field]: value
    }))
  }

  return (
    <>
      <Grid container spacing={2} alignItems='center'>
        <Grid item xs={9}>
          <PersonalDetail profileData={profileData} />
        </Grid>
        <Grid item xs={2}>
          <ImgStyled src={imgSrc} alt='프로필 사진' />
        </Grid>
        <Grid item xs={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: -15 }}>
            <IconButton onClick={handleDialogOpen}>
              <EditNoteIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <ProfileEditDialog
        open={open}
        profileFields={profileFields}
        handleDialogClose={handleDialogClose}
        handleDialogSave={handleDialogSave}
        handleProfileChange={handleProfileChange}
        imgSrc={tempImgSrc}
        onPicChange={onPicChange}
        fileInputRef={fileInputRef}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
      />
    </>
  )
}

export default ProfileSection