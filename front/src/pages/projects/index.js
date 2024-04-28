import React, { useState } from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import Overview from '../../views/projects/overview/index'
import Project from '../../views/projects/projects/index'
import Portfolio from 'src/views/projects/portfolio'
import Career from 'src/views/projects/career'

/**
 * 탭 UI 및 상태 관리 로직 구현
 * 해당 파일에서 Tabs와 Tab 컴포넌트를 사용하여 탭을 구성하고, 각 탭 클릭 시 보여줄 컨텐츠의 상태를 변경하는 로직을 구현함
 * @param {*} props
 * @returns
 */
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

export default function TabsContainer() {
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label='basic tabs example'>
          <Tab label='개요' />
          <Tab label='프로젝트' />
          <Tab label='경력 관리' />
          <Tab label='포트폴리오 생성' />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Overview />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Project />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Career />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Portfolio />
      </TabPanel>
    </Box>
  )
}
