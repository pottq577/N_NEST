import { useState } from 'react'
import { useRouter } from 'next/router'
import { auth } from '../../../../lib/firebase'
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  GithubAuthProvider, 
  signInWithPopup 
} from 'firebase/auth'
import axios from 'axios'

// MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard from '@mui/material/Card'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
// Icons Imports
import Github from 'mdi-material-ui/Github'
import EyeOutline from 'mdi-material-ui/EyeOffOutline'
import EyeOffOutline from 'mdi-material-ui/EyeOutline'

// Configs
import themeConfig from 'src/configs/themeConfig'

// Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration'

// Styled Components
const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}))

const LinkStyled = styled('a')(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(4),
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [professorId, setProfessorId] = useState('') // 교수 번호 상태 추가
  const [showPassword, setShowPassword] = useState(false)
  const theme = useTheme()
  const router = useRouter()

  const saveUserToDB = async (userId) => {
    try {
      await axios.post('http://localhost:8000/professors/', {
        name,
        email,
        professor_id: professorId, // 교수 번호 추가
        
      })
      console.log('Professor registered successfully')
    } catch (error) {
      console.error('Error saving professor to DB:', error)
    }
  }

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log('User created:', userCredential.user)
      // 이메일 인증 메일 발송
      await sendEmailVerification(userCredential.user)
      console.log('Verification email sent.')
      // Save user ID to DB
      saveUserToDB(userCredential.user.uid)
      // Redirect to login page
      router.push('/pages/login')
    } catch (error) {
      console.error('Signup error:', error.message)
    }
  }

  const handleGitHubLogin = () => {
    const provider = new GithubAuthProvider()
    signInWithPopup(auth, provider)
      .then(result => {
        console.log('GitHub login successful', result.user)
        saveUserToDB(result.user.uid)
        router.push('/pages/register/addInfo')
      })
      .catch(error => {
        console.error('GitHub login failed', error)
      })
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1 }}>
        <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={35} height={29} version='1.1' viewBox='0 0 30 23' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink'>
              <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                <g id='Artboard' transform='translate(-95.000000, -51.000000)'>
                  <g id='logo' transform='translate(95.000000, 50.000000)'>
                    <path id='Combined-Shape' fill={theme.palette.primary.main} d='M30,21.3918362 C30,21.7535219 29.9019196,22.1084381 29.7162004,22.4188007 C29.1490236,23.366632 27.9208668,23.6752135 26.9730355,23.1080366 L26.9730355,23.1080366 L23.714971,21.1584295 C23.1114106,20.7972624 22.7419355,20.1455972 22.7419355,19.4422291 L22.7419355,19.4422291 L22.741,12.7425689 L15,17.1774194 L7.258,12.7425689 L7.25806452,19.4422291 C7.25806452,20.1455972 6.88858935,20.7972624 6.28502902,21.1584295 L3.0269645,23.1080366 C2.07913318,23.6752135 0.850976404,23.366632 0.283799571,22.4188007 C0.0980803893,22.1084381 2.0190442e-15,21.7535219 0,21.3918362 L0,3.58469444 L0.00548573643,3.43543209 L0.00548573643,3.43543209 L0,3.5715689 C3.0881846e-16,2.4669994 0.8954305,1.5715689 2,1.5715689 C2.36889529,1.5715689 2.73060353,1.67359571 3.04512412,1.86636639 L15,9.19354839 L26.9548759,1.86636639 C27.2693965,1.67359571 27.6311047,1.5715689 28,1.5715689 C29.1045695,1.5715689 30,2.4669994 30,3.5715689 L30,3.5715689 Z' />
                    <polygon id='Rectangle' opacity='0.077704' fill={theme.palette.common.black} points='0 8.58870968 7.25806452 12.7505183 7.25806452 16.8305646' />
                    <polygon id='Rectangle' opacity='0.077704' fill={theme.palette.common.black} points='0 8.58870968 7.25806452 12.6445567 7.25806452 15.1370162' />
                    <polygon id='Rectangle' opacity='0.077704' fill={theme.palette.common.black} points='22.7419355 8.58870968 30 12.7417372 30 16.9537453' transform='translate(26.370968, 12.771227) scale(-1, 1) translate(-26.370968, -12.771227)' />
                    <polygon id='Rectangle' opacity='0.077704' fill={theme.palette.common.black} points='22.7419355 8.58870968 30 12.6409734 30 15.2601969' transform='translate(26.370968, 11.924453) scale(-1, 1) translate(-26.370968, -11.924453)' />
                    <path id='Rectangle' fillOpacity='0.15' fill={theme.palette.common.white} d='M3.04512412,1.86636639 L15,9.19354839 L15,9.19354839 L15,17.1774194 L0,8.58649679 L0,3.5715689 C3.0881846e-16,2.4669994 0.8954305,1.5715689 2,1.5715689 C2.36889529,1.5715689 2.73060353,1.67359571 3.04512412,1.86636639 Z' />
                    <path id='Rectangle' fillOpacity='0.35' fill={theme.palette.common.white} transform='translate(22.500000, 8.588710) scale(-1, 1) translate(-22.500000, -8.588710)' d='M18.0451241,1.86636639 L30,9.19354839 L30,9.19354839 L30,17.1774194 L15,8.58649679 L15,3.5715689 C15,2.4669994 15.8954305,1.5715689 17,1.5715689 C17.3688953,1.5715689 17.7306035,1.67359571 18.0451241,1.86636639 Z' />
                  </g>
                </g>
              </g>
            </svg>
            <Typography
              variant='h6'
              sx={{
                ml: 3,
                lineHeight: 1,
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '1.5rem !important'
              }}
            >
              {themeConfig.templateName}
            </Typography>
          </Box>

          <Box sx={{ mb: 6 }}>
            <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
              Adventure starts here 🚀
            </Typography>
            <Typography variant='body2'>Make your app management easy and fun!</Typography>
          </Box>

          <TextField
            fullWidth
            label='Name'
            variant='outlined'
            value={name}
            onChange={e => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='Email'
            variant='outlined'
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label='Professor ID'
            variant='outlined'
            value={professorId}
            onChange={e => setProfessorId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant='outlined' sx={{ mb: 2 }}>
            <InputLabel htmlFor='outlined-adornment-password'>Password</InputLabel>
            <OutlinedInput
              id='outlined-adornment-password'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='toggle password visibility'
                    onClick={() => setShowPassword(!showPassword)}
                    edge='end'
                  >
                    {showPassword ? <EyeOffOutline /> : <EyeOutline />}
                  </IconButton>
                </InputAdornment>
              }
              label='Password'
            />
          </FormControl>
          <Button fullWidth size='large' variant='contained' onClick={handleSignUp} sx={{ mb: 2 }}>
            Sign up with Email
          </Button>
          <Divider sx={{ mb: 2 }}>or</Divider>
          <Button
            startIcon={<Github />}
            fullWidth
            size='large'
            variant='contained'
            onClick={handleGitHubLogin}
            sx={{ mb: 2 }}
          >
            Sign up with GitHub
          </Button>
        </CardContent>
      </Card>
      <FooterIllustrationsV1 />
    </Box>
  )
}

RegisterPage.getLayout = page => <BlankLayout>{page}</BlankLayout>

export default RegisterPage
