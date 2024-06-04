// ** MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Icons Imports
import Menu from 'mdi-material-ui/Menu'

// ** Components
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'

const AppBarContent = props => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  // ** Hook
  const hiddenSm = useMediaQuery(theme => theme.breakpoints.down('sm'))

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
    <Box sx={{ width: '100%', mb: 2 }}>
      <img src="/banner3.png" alt="Banner" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
    </Box>
      {/* <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
        <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
          {hidden ? (
            <IconButton
              color='inherit'
              onClick={toggleNavVisibility}
              sx={{ ml: -2.75, ...(hiddenSm ? {} : { mr: 3.5 }) }}
            >
              <Menu />
            </IconButton>
          ) : null}
        </Box>
        <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
          {hiddenSm ? null : (
            <Box
              component='a'
              target='_blank'
              rel='noreferrer'
              sx={{ mr: 4, display: 'flex' }}
              href='https://github.com/themeselection/materio-mui-react-nextjs-admin-template-free'
            >
              <img
                height={24}
                alt='github stars'
                src='https://img.shields.io/github/stars/themeselection/materio-mui-react-nextjs-admin-template-free?style=social'
              />
            </Box>
          )}
          <ModeToggler settings={settings} saveSettings={saveSettings} />
          <NotificationDropdown />
          <UserDropdown />
        </Box>
      </Box> */}
    </Box>
  )
}

export default AppBarContent
