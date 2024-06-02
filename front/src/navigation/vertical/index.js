// ** Icon imports
import Login from 'mdi-material-ui/Login'
import Table from 'mdi-material-ui/Table'
import CubeOutline from 'mdi-material-ui/CubeOutline'
import HomeOutline from 'mdi-material-ui/HomeOutline'
import FormatLetterCase from 'mdi-material-ui/FormatLetterCase'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import AlertCircleOutline from 'mdi-material-ui/AlertCircleOutline'
import GoogleCirclesExtended from 'mdi-material-ui/GoogleCirclesExtended'
import ClipboardListOutline from 'mdi-material-ui/ClipboardListOutline'
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'
import ShieldAccountOutline from 'mdi-material-ui/ShieldAccountOutline'
import GroupIcon from '@mui/icons-material/Group';
import CodeIcon from '@mui/icons-material/Code' // Importing the Code icon
import CreateIcon from '@mui/icons-material/Create' // Importing the Create icon
const navigation = () => {
  return [
    // {
    //   title: 'summary',
    //   icon: HomeOutline,
    //   path: '/summary'
    // },
    /* {
      title: 'generate',
      icon: HomeOutline,
      path: '/generate'
    },
    {
      title: 'Product',
      icon: HomeOutline,
      path: '/summary2'
    }, */
    // {
    //   title: 'Professor',
    //   icon: HomeOutline,
    //   path: '/summaryprofessor'
    // },
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

    // {
    //   title: '상호평가 생성',
    //   icon: HelpCircleOutline,
    //   path: '/evaluation-professor'
    // },
    // {
    //   title: '상호평가',
    //   icon: HelpCircleOutline,
    //   path: '/evaluation-student'
    // },
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
    // {
    //   title: '일정 생성',
    //   icon: HelpCircleOutline,
    //   path: '/schedule-professor'
    // },
    // {
    //   title: '예약',
    //   icon: HelpCircleOutline,
    //   path: '/schedule-student'
    // },
    {
      title: '팀원 모집',
      icon: GroupIcon,
      path: '/teams'
    },
    {
      title: 'Account Settings',
      icon: AccountCogOutline,
      path: '/account-settings'
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
    },

    {
      sectionTitle: 'Administrator page'
    },
    {
      icon: ShieldAccountOutline,
      title: '관리자 페이지',
      path: '/admin'
    }
    // {
    //   icon: ShieldAccountOutline,
    //   title: '수업페이지',
    //   path: '/course'
    // }
  ]
}

export default navigation
