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

const navigation = () => {
  return [
    // {
    //   title: 'Dashboard',
    //   icon: HomeOutline,
    //   path: '/'
    // },
    {
      title: 'studentEvaluation',
      icon: HomeOutline,
      path: '/studentEvaluation'
    },
    {
      title: 'ProfessorAvaliability',
      icon: HomeOutline,
      path: '/professorAvaliability'
    },
    {
      title: 'studentBooking',
      icon: HomeOutline,
      path: '/studentBooking'
    },
    {
      title: 'corseinfo',
      icon: HomeOutline,
      path: '/corseinfo'
    },
    {
      title: 'courseinfostudent',
      icon: HomeOutline,
      path: '/courseinfostudent'
    },

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
    {
      title: 'Professor',
      icon: HomeOutline,
      path: '/summaryprofessor'
    },
    {
      title: 'Project List',
      icon: ClipboardListOutline,
      path: '/project'
    },
    {
      title: 'Q&A',
      icon: HelpCircleOutline,
      path: '/qa'
    },
    {
      title: 'Account Settings',
      icon: AccountCogOutline,
      path: '/account-settings'
    },
    {
      title: '마이페이지',
      icon: AccountCogOutline,
      path: '/projects'
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
    // {
    //   title: 'Error',
    //   icon: AlertCircleOutline,
    //   path: '/pages/error',
    //   openInNewTab: true
    // },
    {
      sectionTitle: 'User Interface'
    },
    // {
    //   title: 'Typography',
    //   icon: FormatLetterCase,
    //   path: '/typography'
    // },
    // {
    //   title: 'Icons',
    //   path: '/icons',
    //   icon: GoogleCirclesExtended
    // },
    // {
    //   title: 'Cards',
    //   icon: CreditCardOutline,
    //   path: '/cards'
    // },
    // {
    //   title: 'Tables',
    //   icon: Table,
    //   path: '/tables'
    // },
    // {
    //   icon: CubeOutline,
    //   title: 'Form Layouts',
    //   path: '/form-layouts'
    // },
    // {
    //   sectionTitle: 'Administrator page'
    // },
    {
      icon: ShieldAccountOutline,
      title: '관리자 페이지',
      path: '/admin'
    }
  ]
}

export default navigation
