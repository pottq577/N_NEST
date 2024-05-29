import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import Home from '../../views/recruitment/home'
import Recruit from 'src/views/recruitment/recruit'
import Management from 'src/views/recruitment/management'

import { TeamProvider } from 'src/context/TeamContext'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const Teams = ({ Component, pageProps }) => {
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <TeamProvider>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label='basic tabs example'>
            <Tab label='홈' />
            <Tab label='지원한 포지션' />
            <Tab label='받은 제안' />
            <Tab label='팀 관리' />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Home />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Recruit />
        </TabPanel>
        <TabPanel value={value} index={2}>
          {/* <Career /> */}
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Management />
        </TabPanel>
      </Box>
    </TeamProvider>
  )
}

export default Teams