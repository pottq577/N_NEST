import React, { useState } from 'react'
import { Container, Tab, Tabs, Box, Typography, TextField, Button, CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'

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

function RepositoryInfo() {
  const router = useRouter()
  const {
    name,
    description,
    language,
    stars,
    updatedAt,
    license,
    forks,
    watchers,
    contributors,
    private: isPrivate,
    html_url: htmlUrl,
    defaultBranch,
    userId,
    username
  } = router.query

  return (
    <Box>
      <Typography variant='h6' gutterBottom>
        User Information
      </Typography>
      <Typography>
        <strong>User ID:</strong> {userId}
      </Typography>
      <Typography>
        <strong>Username:</strong> {username}
      </Typography>
      <Typography variant='h6' gutterBottom>
        Repository Information
      </Typography>
      <Typography>
        <strong>Name:</strong> {name}
      </Typography>
      <Typography>
        <strong>Description:</strong> {description || 'No description'}
      </Typography>
      <Typography>
        <strong>Language:</strong> {language || 'No info'}
      </Typography>
      <Typography>
        <strong>Stars:</strong> {stars}
      </Typography>
      <Typography>
        <strong>Last Updated:</strong> {new Date(updatedAt).toLocaleDateString()}
      </Typography>
      <Typography>
        <strong>License:</strong> {license || 'No license'}
      </Typography>
      <Typography>
        <strong>Forks:</strong> {forks}
      </Typography>
      <Typography>
        <strong>Watchers:</strong> {watchers}
      </Typography>
      <Typography>
        <strong>Contributors:</strong> {contributors}
      </Typography>
      <Typography>
        <strong>Private:</strong> {isPrivate}
      </Typography>
      <Typography>
        <strong>Default Branch:</strong> {defaultBranch}
      </Typography>
      <Typography>
        <strong>Repository URL:</strong>{' '}
        <a href={htmlUrl} target='_blank' rel='noopener noreferrer'>
          {htmlUrl}
        </a>
      </Typography>
    </Box>
  )
}

function CreateDocumentForm({ projectInfo, setProjectInfo, summary, setSummary }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    const url = `http://localhost:8001/summarize/Gen/${encodeURIComponent(
      projectInfo.projectTitle
    )}/${encodeURIComponent(projectInfo.technologiesUsed)}/${encodeURIComponent(projectInfo.problemToSolve)}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setSummary(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to fetch the project summary. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label='Project Title'
        fullWidth
        variant='outlined'
        value={projectInfo.projectTitle}
        onChange={e => setProjectInfo({ ...projectInfo, projectTitle: e.target.value })}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label='Technologies Used'
        fullWidth
        variant='outlined'
        value={projectInfo.technologiesUsed}
        onChange={e => setProjectInfo({ ...projectInfo, technologiesUsed: e.target.value })}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        label='Problem to Solve'
        fullWidth
        multiline
        minRows={4}
        variant='outlined'
        value={projectInfo.problemToSolve}
        onChange={e => setProjectInfo({ ...projectInfo, problemToSolve: e.target.value })}
        required
        sx={{ mb: 2 }}
      />
      <Button type='submit' variant='contained' color='primary' disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} /> : 'Generate Summary'}
      </Button>
      {error && <Typography color='error'>{error}</Typography>}
      {summary.project_title && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>Generated Summary:</Typography>
          <Typography>
            <strong>Project Title:</strong> {summary.project_title}
          </Typography>
          <Typography>
            <strong>Background:</strong> {summary.background}
          </Typography>
          <Typography>
            <strong>Development Content:</strong> {summary.development_content}
          </Typography>
          <Typography>
            <strong>Expected Effects:</strong> {summary.expected_effects}
          </Typography>
        </Box>
      )}
    </form>
  )
}

function SummaryAndImage({ summary, setSummary }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [combinedSummary, setCombinedSummary] = useState('') // 요약된 내용을 저장할 상태

  const handleSummarizeAll = async () => {
    setIsLoading(true)
    setError('')

    const sections = {
      background: summary.background,
      development_content: summary.development_content,
      expected_effects: summary.expected_effects
    }

    try {
      const summaries = await Promise.all(
        Object.entries(sections).map(([key, text]) =>
          fetch('http://localhost:8001/summarize/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          }).then(response => (response.ok ? response.json() : Promise.reject(`Failed to summarize ${key}`)))
        )
      )

      const newSummary = summaries.reduce((acc, data, index) => {
        const sectionKey = Object.keys(sections)[index]
        acc[sectionKey] = data.summary // 개별 요약 결과를 저장
        return acc
      }, {})

      setCombinedSummary(summaries.map(s => s.summary).join(' ')) // 모든 요약 결과를 하나의 문자열로 합칩니다.
      setIsLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to summarize one or more sections. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant='h6'>Original Content and Summaries:</Typography>
      <Typography>
        <strong>Project Title:</strong> {summary.project_title}
      </Typography>
      <Typography>
        <strong>Background:</strong> {summary.background}
      </Typography>
      <Typography>
        <strong>Development Content:</strong> {summary.development_content}
      </Typography>
      <Typography>
        <strong>Expected Effects:</strong> {summary.expected_effects}
      </Typography>
      <Button onClick={handleSummarizeAll} disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} /> : 'Summarize All Sections'}
      </Button>
      {error && <Typography color='error'>{error}</Typography>}
      {combinedSummary && (
        <Box sx={{ mt: 2 }}>
          <Typography variant='h6'>Combined Summary:</Typography>
          <Typography>{combinedSummary}</Typography>
        </Box>
      )}
    </Box>
  )
}

export default function ProjectGenerator() {
  const [tabIndex, setTabIndex] = useState(0)
  const [projectInfo, setProjectInfo] = useState({
    projectTitle: '',
    technologiesUsed: '',
    problemToSolve: ''
  })
  const [summary, setSummary] = useState({})

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  return (
    <Container maxWidth='md'>
      <Tabs value={tabIndex} onChange={handleTabChange} aria-label='project tabs'>
        <Tab label='Repository Info' />
        <Tab label='Create Document' />
        <Tab label='Summary and Image' />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
        <RepositoryInfo />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <CreateDocumentForm
          projectInfo={projectInfo}
          setProjectInfo={setProjectInfo}
          summary={summary}
          setSummary={setSummary}
        />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <SummaryAndImage summary={summary} setSummary={setSummary} />
      </TabPanel>
    </Container>
  )
}
