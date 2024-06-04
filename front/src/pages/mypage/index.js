import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Tabs, Tab, Box } from '@mui/material';
import Overview from '../../views/mypage/overview/index';
import Project from '../../views/mypage/projects/index';
import Portfolio from 'src/views/mypage/portfolio';
import ProfileManage from 'src/views/mypage/profile/';
import AvailabilitySettings from '/src/pages/schedule-student';
import ReservationPage from '/src/pages/schedule-professor';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

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
  );
}

export default function TabsContainer() {
  const router = useRouter();
  const [value, setValue] = useState(0);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserRole = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const isEmailUser = !user.providerData.some((provider) => provider.providerId === 'github.com');
          setUserRole(isEmailUser ? 'professor' : 'student');
        } else {
          setUserRole('');
          console.error('No user is signed in');
        }
      });
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const tab = router.query.tab;

    const tabsMap = {
      overview: 0,
      projects: 1,
      profileManage: 2,
      portfolio: 3,
      availability: 4,
      reservation: 5,
    };
    if (tab && tabsMap.hasOwnProperty(tab)) {
      setValue(tabsMap[tab]);
    }
  }, [router.query.tab]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabs = [
    { label: '개요', component: <Overview /> },
    { label: '프로젝트', component: <Project /> },
    { label: '프로필 관리', component: <ProfileManage /> },
    { label: '포트폴리오', component: <Portfolio /> },
  ];

  if (userRole === 'professor') {
    tabs.push({ label: '일정 생성', component: <ReservationPage />  });
  }

  if (userRole === 'student') {
    tabs.push({ label: '예약', component: <AvailabilitySettings />});
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label='basic tabs example'>
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
}
