import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from 'mdi-material-ui/Login';
import ClipboardListOutline from 'mdi-material-ui/ClipboardListOutline';
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline';
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline';
import CreateIcon from '@mui/icons-material/Create';
import CodeIcon from '@mui/icons-material/Code';
import GroupIcon from '@mui/icons-material/Group';
import ShieldAccountOutline from 'mdi-material-ui/ShieldAccountOutline';
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline';
import axios from 'axios';

// Firebase 설정을 가져옵니다.
import { firebaseApp } from '../../../lib/firebase'; // firebase 설정 파일을 가져옵니다.

const useNavigation = () => {
  const [navItems, setNavItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;
        try {
          const response = await axios.get('http://localhost:8000/api/check-admin', { params: { email } });
          setIsAdmin(response.data.isAdmin);
        } catch (error) {
          console.error('Failed to check admin status:', error);
        }
      }
    });
  }, []);

  useEffect(() => {
    const items = [
      {
        title: 'Project List',
        icon: ClipboardListOutline,
        path: '/project'
      },
      {
        title: '마이페이지',
        icon: AccountCogOutline,
        path: '/mypage'
      },
      {
        title: 'Q&A',
        icon: HelpCircleOutline,
        path: '/question-answer'
      },
      {
        title: '코딩테스트 생성',
        icon: CreateIcon,
        path: '/code-test-create'
      },
      {
        title: '코딩테스트',
        icon: CodeIcon,
        path: '/code-test-list'
      },
      {
        title: '팀원 모집',
        icon: GroupIcon,
        path: '/teams'
      },
      {
        sectionTitle: 'Pages'
      },
      {
        title: 'Login',
        icon: Login,
        path: '/pages/login',
        openInNewTab: true
      },
      {
        title: 'Register',
        icon: AccountPlusOutline,
        path: '/pages/register',
        openInNewTab: true
      }
    ];

    if (isAdmin) {
      items.push({
        sectionTitle: 'Administrator page'
      });
      items.push({
        icon: ShieldAccountOutline,
        title: '관리자 페이지',
        path: '/admin'
      });
    }

    setNavItems(items);
  }, [isAdmin]);

  return navItems;
};

export default useNavigation;
