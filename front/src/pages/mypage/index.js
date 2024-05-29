import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box } from '@mui/material'
import Overview from '../../views/mypage/overview/index'
import Project from '../../views/mypage/projects/index'
import Portfolio from 'src/views/mypage/portfolio'
import ProfileManage from 'src/views/mypage/profile/'

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
  const router = useRouter()
  const [value, setValue] = useState(0)

  useEffect(() => {
    const tab = router.query.tab
    if (tab === 'overview') setValue(0)
    else if (tab === 'projects') setValue(1)
    else if (tab === 'ProfileManage') setValue(2)
    else if (tab === 'portfolio') setValue(3)
  }, [router.query.tab])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label='basic tabs example'>
          <Tab label='개요' />
          <Tab label='프로젝트' />
          <Tab label='프로필 관리' />
          <Tab label='포트폴리오' />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <Overview />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Project />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ProfileManage />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <Portfolio />
      </TabPanel>
    </Box>
  )
}