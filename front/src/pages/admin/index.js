import React, { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Tabs,
  Tab,
  Divider,
  IconButton
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import axios from 'axios'

const Home = () => {
  const [files, setFiles] = useState([])
  const [data, setData] = useState([])
  const [fileType, setFileType] = useState('수업')
  const [courses, setCourses] = useState([]) // 수업 목록 상태
  const [students, setStudents] = useState([]) // 학생 목록 상태
  const [selectedCourse, setSelectedCourse] = useState('') // 선택한 수업 상태
  const [errorMessage, setErrorMessage] = useState('') // 에러 메시지 상태
  const [tabValue, setTabValue] = useState(0) // 현재 탭 상태

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.xlsx, .xls',
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles)
      acceptedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onabort = () => console.log('file reading was aborted')
        reader.onerror = () => console.log('file reading has failed')
        reader.onload = () => {
          const binaryStr = reader.result
          const workbook = XLSX.read(binaryStr, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
          setData(jsonData)
        }
        reader.readAsBinaryString(file)
      })
    }
  })

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:8000/courses/')
        setCourses(response.data)
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }

    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/students/')
        setStudents(response.data)
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    }

    if (fileType === '학생') {
      fetchCourses()
      fetchStudents()
    }

    // 파일 유형이 변경될 때 데이터 초기화
    setFiles([])
    setData([])
    setSelectedCourse('')
  }, [fileType])

  const handleInputChange = (e, rowIndex, colIndex) => {
    const newData = [...data]
    newData[rowIndex][colIndex] = e.target.value
    setData(newData)
  }

  const handleSave = async () => {
    if (fileType === '학생' && !selectedCourse) {
      alert('학생 파일 유형을 선택한 경우 수업을 선택해야 합니다.')
      return
    }
  
    let formattedData = []
    if (fileType === '수업') {
      formattedData = data.slice(1).map(row => ({
        name: row[0],
        professor: row[1],
        day: row[2], // 수정: 교수 ID가 아니라 요일
        time: row[3], // 수정: 요일이 아니라 시간
        code: row[4], // 수정: 시간이 아니라 코드
        professor_id: String(row[5]) // 수정: 코드가 아니라 교수 ID
      }))
    } else if (fileType === '학생') {
      formattedData = data.slice(1).map(row => ({
        name: row[0],
        student_id: row[1],
        department: row[2],
        course_code: selectedCourse
      }))
    }
  
    console.log('Formatted data:', formattedData) // 추가
  
    try {
      let response
      if (fileType === '수업') {
        response = await axios.post('http://localhost:8000/save-courses/', formattedData)
      } else if (fileType === '학생') {
        response = await axios.post('http://localhost:8000/save-students/', formattedData)
      }
      console.log(response.data)
  
      // 서버 응답 메시지에 따라 사용자에게 알림 표시
      alert(response.data.message)
  
      // 저장 성공 후 화면 초기화
      setFiles([])
      setData([])
      setSelectedCourse('')
      setErrorMessage('') // 에러 메시지 초기화
    } catch (error) {
      console.error('Error saving data:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }
  
  

  const handleDelete = async id => {
    try {
      let response
      if (fileType === '수업') {
        response = await axios.post('http://localhost:8000/delete-courses/', [{ code: id }])
      } else if (fileType === '학생') {
        response = await axios.post('http://localhost:8000/delete-students/', [
          { student_id: id, course_code: selectedCourse }
        ])
      }
      console.log(response.data)

      // 서버 응답 메시지에 따라 사용자에게 알림 표시
      alert(response.data.message)

      // 삭제 성공 후 데이터 갱신
      if (fileType === '수업') {
        setCourses(courses.filter(course => course.code !== id))
      } else if (fileType === '학생') {
        setStudents(students.filter(student => student.student_id !== id))
      }
    } catch (error) {
      console.error('Error deleting data:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    // 탭이 변경될 때 데이터 초기화
    setFiles([])
    setData([])
    setSelectedCourse('')
  }

  const handleCourseChange = async event => {
    setSelectedCourse(event.target.value)
    // 선택한 수업에 대한 학생 목록을 가져오기 (삭제 탭에서만)
    if (fileType === '학생') {
      try {
        const response = await axios.get(`http://localhost:8000/students/?course_code=${event.target.value}`)
        setStudents(response.data)
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    }
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          엑셀 파일 업로드
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label='추가' />
          <Tab label='삭제' />
        </Tabs>
        <Divider sx={{ my: 2 }} /> {/* Tabs와 파일 유형 선택 드롭다운 사이에 간격 추가 */}
        {errorMessage && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id='file-type-label'>파일 유형</InputLabel>
          <Select
            labelId='file-type-label'
            value={fileType}
            label='파일 유형'
            onChange={e => setFileType(e.target.value)}
          >
            <MenuItem value='수업'>수업</MenuItem>
            <MenuItem value='학생'>학생</MenuItem>
          </Select>
        </FormControl>
        {tabValue === 0 && (
          <>
            {fileType === '학생' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id='course-label'>수업</InputLabel>
                <Select
                  labelId='course-label'
                  value={selectedCourse}
                  label='수업'
                  onChange={e => setSelectedCourse(e.target.value)}
                >
                  {courses.map(course => (
                    <MenuItem key={course.id} value={course.code}>
                      {course.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed grey',
                p: 2,
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <input {...getInputProps()} />
              <Typography variant='h6'>파일을 여기로 드래그 앤 드롭 하거나 클릭하여 파일을 선택하세요.</Typography>
              <Button variant='contained' color='primary' sx={{ mt: 2 }}>
                파일 선택
              </Button>
              <Box>
                {files.map(file => (
                  <Typography key={file.path}>{file.path}</Typography>
                ))}
              </Box>
            </Box>
            {data.length > 0 && (
              <>
                <TableContainer component={Paper} sx={{ mt: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {data[0].map((col, index) => (
                          <TableCell key={index}>{col}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.slice(1).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, colIndex) => (
                            <TableCell key={colIndex}>
                              <TextField
                                value={cell}
                                onChange={e => handleInputChange(e, rowIndex + 1, colIndex)}
                                fullWidth
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button variant='contained' color='primary' sx={{ mt: 2 }} onClick={handleSave}>
                  저장
                </Button>
              </>
            )}
          </>
        )}
        {tabValue === 1 && (
          <>
            <Typography variant='h6' component='h2' gutterBottom>
              삭제할 항목 선택
            </Typography>
            {fileType === '학생' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id='course-label'>수업</InputLabel>
                <Select labelId='course-label' value={selectedCourse} label='수업' onChange={handleCourseChange}>
                  <MenuItem value=''>모든 수업</MenuItem> {/* '모든 수업' 옵션 추가 */}
                  {courses.map(course => (
                    <MenuItem key={course.id} value={course.code}>
                      {course.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {fileType === '수업' ? (
              <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>수업 이름</TableCell>
                      <TableCell>교수명</TableCell>
                      <TableCell>교수 ID</TableCell> {/* 추가 */}
                      <TableCell>요일</TableCell>
                      <TableCell>시간</TableCell>
                      <TableCell>코드</TableCell>
                      <TableCell>삭제</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map(course => (
                      <TableRow key={course.id}>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.professor}</TableCell>
                        <TableCell>{course.professor_id}</TableCell> {/* 추가 */}
                        <TableCell>{course.day}</TableCell>
                        <TableCell>{course.time}</TableCell>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleDelete(course.code)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <>
                {students.length > 0 && (
                  <TableContainer component={Paper} sx={{ mt: 4 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>이름</TableCell>
                          <TableCell>학번</TableCell>
                          <TableCell>학과</TableCell>
                          <TableCell>수강 코드</TableCell>
                          <TableCell>삭제</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map(student => (
                          <TableRow key={student.id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.student_id}</TableCell>
                            <TableCell>{student.department}</TableCell>
                            <TableCell>{student.course_codes.join(', ')}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => handleDelete(student.student_id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </>
        )}
      </Box>
    </Container>
  )
}

export default Home
