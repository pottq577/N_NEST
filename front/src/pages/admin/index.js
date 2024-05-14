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
  FormControl
} from '@mui/material'
import axios from 'axios'

const Home = () => {
  const [files, setFiles] = useState([])
  const [data, setData] = useState([])
  const [fileType, setFileType] = useState('수업')
  const [courses, setCourses] = useState([]) // 수업 목록 상태
  const [selectedCourse, setSelectedCourse] = useState('') // 선택한 수업 상태

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

    if (fileType === '학생') {
      fetchCourses()
    }
  }, [fileType])

  const handleInputChange = (e, rowIndex, colIndex) => {
    const newData = [...data]
    newData[rowIndex][colIndex] = e.target.value
    setData(newData)
  }

  const handleSave = async () => {
    const formattedData = data.slice(1).map(row => ({
      name: row[0],
      professor: row[1],
      day: row[2],
      time: row[3],
      code: row[4]
    }))
    try {
      const response = await axios.post('http://localhost:8000/save-courses/', formattedData)
      console.log(response.data)
      alert('저장되었습니다!')
      // 저장 성공 후 화면 초기화
      setFiles([])
      setData([])
    } catch (error) {
      console.error('Error saving data:', error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          엑셀 파일 업로드
        </Typography>
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
      </Box>
    </Container>
  )
}

export default Home
