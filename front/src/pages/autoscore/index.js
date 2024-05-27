import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Typography, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';

const initialCriteria = ['Completeness', 'Presentation', 'Idea'];

const generateEvaluationTeams = (studentTeam) => {
    const allTeams = ['Team A', 'Team B', 'Team C', 'Team D', 'Team E', 'Team F', 'Team G', 'Team H'];
    const availableTeams = allTeams.filter(team => team !== studentTeam);
    const selectedTeams = [];
    while (selectedTeams.length < 5) {
        const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        if (!selectedTeams.includes(randomTeam)) {
            selectedTeams.push(randomTeam);
        }
    }
    return selectedTeams;
};

export default function Home() {
    const [students, setStudents] = useState([]);
    const [criteria, setCriteria] = useState(initialCriteria);
    const [newCriteria, setNewCriteria] = useState('');
    const [totalScores, setTotalScores] = useState([]);
    const [courseCode, setCourseCode] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [courseCodes, setCourseCodes] = useState([]);

    const loadCourseCodes = async () => {
        try {
            const response = await axios.get('/api/course-codes');
            setCourseCodes(response.data);
        } catch (error) {
            console.error("Failed to load course codes:", error);
        }
    };

    const loadStudents = async () => {
        try {
            const response = await axios.get(`/api/course-students/${courseCode}`);
            const studentsWithEvaluations = response.data.map(student => {
                const evaluations = generateEvaluationTeams(student.team).reduce((acc, team) => {
                    acc[team] = { Completeness: 0, Presentation: 0, Idea: 0 };
                    return acc;
                }, {});
                return { ...student, evaluations };
            });
            setStudents(studentsWithEvaluations);
            setIsLoaded(true);
        } catch (error) {
            console.error("Failed to load students:", error);
        }
    };

    useEffect(() => {
        loadCourseCodes();
    }, []);

    useEffect(() => {
        if (courseCode) {
            loadStudents();
        }
    }, [courseCode]);

    const handleChange = (studentIndex, team, field, value) => {
        const updatedStudents = [...students];
        updatedStudents[studentIndex].evaluations[team][field] = parseInt(value) || 0;
        setStudents(updatedStudents);
    };

    const calculateScores = () => {
        const scores = students.map(student => {
            const total = Object.values(student.evaluations).reduce((acc, evals) => {
                return acc + criteria.reduce((subAcc, crit) => subAcc + (evals[crit] || 0), 0);
            }, 0);
            return { ...student, total };
        });
        scores.sort((a, b) => b.total - a.total);
        setTotalScores(scores);
    };

    const addCriteria = () => {
        if (newCriteria && !criteria.includes(newCriteria)) {
            setCriteria([...criteria, newCriteria]);
            setStudents(students.map(student => {
                const updatedEvaluations = { ...student.evaluations };
                Object.keys(updatedEvaluations).forEach(team => {
                    updatedEvaluations[team][newCriteria] = 0;
                });
                return { ...student, evaluations: updatedEvaluations };
            }));
            setNewCriteria('');
        }
    };

    const removeCriteria = (crit) => {
        const updatedCriteria = criteria.filter(c => c !== crit);
        setCriteria(updatedCriteria);
        setStudents(students.map(student => {
            const updatedEvaluations = { ...student.evaluations };
            Object.keys(updatedEvaluations).forEach(team => {
                delete updatedEvaluations[team][crit];
            });
            return { ...student, evaluations: updatedEvaluations };
        }));
    };

    const exportToExcel = () => {
        const worksheetData = [
            ['Name', 'Team', ...criteria, 'Total'],
            ...totalScores.map(student => [
                student.name,
                student.team,
                ...criteria.map(crit => student.evaluations[student.team][crit] || 0),
                student.total
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluation Results');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'evaluation_results.xlsx');
    };

    return (
        <Container>
            <Head>
                <title>Student Evaluation</title>
            </Head>
            <Typography variant="h4" gutterBottom>Student Evaluation</Typography>
            <FormControl fullWidth margin="normal">
                <InputLabel>Course Code</InputLabel>
                <Select
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                >
                    {courseCodes.map((code) => (
                        <MenuItem key={code} value={code}>{code}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={loadStudents}>Load Students</Button>
            {isLoaded && (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Team</TableCell>
                                    {criteria.map((crit, index) => (
                                        <TableCell key={index}>
                                            {crit}
                                            <IconButton size="small" onClick={() => removeCriteria(crit)}><DeleteIcon fontSize="small" /></IconButton>
                                        </TableCell>
                                    ))}
                                    <TableCell>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student, studentIndex) => (
                                    Object.keys(student.evaluations).map((team, teamIndex) => (
                                        <TableRow key={`${studentIndex}-${teamIndex}`}>
                                            {teamIndex === 0 && (
                                                <>
                                                    <TableCell rowSpan={Object.keys(student.evaluations).length}>{student.name}</TableCell>
                                                    <TableCell rowSpan={Object.keys(student.evaluations).length}>{student.team}</TableCell>
                                                </>
                                            )}
                                            <TableCell>{team}</TableCell>
                                            {criteria.map((crit, critIndex) => (
                                                <TableCell key={critIndex}>
                                                    <TextField
                                                        type="number"
                                                        value={student.evaluations[team][crit]}
                                                        onChange={(e) => handleChange(studentIndex, team, crit, e.target.value)}
                                                    />
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                {criteria.reduce((acc, crit) => acc + (student.evaluations[team][crit] || 0), 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TextField label="New Criteria" value={newCriteria} onChange={(e) => setNewCriteria(e.target.value)} />
                    <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={addCriteria}>Add Criteria</Button>
                    <Button variant="contained" color="secondary" onClick={calculateScores}>Calculate Scores</Button>
                    <Button variant="contained" color="primary" onClick={exportToExcel}>Export to Excel</Button>
                    <Typography variant="h6" gutterBottom>Total Scores</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Rank</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Team</TableCell>
                                    <TableCell>Total Score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {totalScores.map((student, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.team}</TableCell>
                                        <TableCell>{student.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Container>
    );
}
