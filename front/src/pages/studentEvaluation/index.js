import Head from 'next/head';
import { useState } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Home() {
    const initialCriteria = ['Completeness', 'Presentation', 'Idea'];
    const [students, setStudents] = useState([
        { name: 'Student 1', team: 'Team A', Completeness: 0, Presentation: 0, Idea: 0 },
        { name: 'Student 2', team: 'Team B', Completeness: 0, Presentation: 0, Idea: 0 }
    ]);
    const [criteria, setCriteria] = useState(initialCriteria);
    const [newCriteria, setNewCriteria] = useState('');
    const [totalScores, setTotalScores] = useState([]);

    const handleChange = (index, field, value) => {
        const updatedStudents = [...students];
        updatedStudents[index][field] = parseInt(value) || 0;
        setStudents(updatedStudents);
    };

    const calculateScores = () => {
        const scores = students.map(student => {
            const total = criteria.reduce((acc, crit) => acc + (student[crit] || 0), 0);
            return { ...student, total };
        });
        scores.sort((a, b) => b.total - a.total);
        setTotalScores(scores);
    };

    const addCriteria = () => {
        if (newCriteria && !criteria.includes(newCriteria)) {
            setCriteria([...criteria, newCriteria]);
            setStudents(students.map(student => ({ ...student, [newCriteria]: 0 })));
            setNewCriteria('');
        }
    };

    const removeCriteria = (crit) => {
        const updatedCriteria = criteria.filter(c => c !== crit);
        setCriteria(updatedCriteria);
        setStudents(students.map(student => {
            const updatedStudent = { ...student };
            delete updatedStudent[crit];
            return updatedStudent;
        }));
    };

    const exportToExcel = () => {
        const worksheetData = [
            ['Name', 'Team', ...criteria, 'Total'],
            ...totalScores.map(student => [
                student.name,
                student.team,
                ...criteria.map(crit => student[crit] || 0),
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
                        {students.map((student, index) => (
                            <TableRow key={index}>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.team}</TableCell>
                                {criteria.map((crit, critIndex) => (
                                    <TableCell key={critIndex}>
                                        <TextField type="number" value={student[crit]} onChange={(e) => handleChange(index, crit, e.target.value)} />
                                    </TableCell>
                                ))}
                                <TableCell>{criteria.reduce((acc, crit) => acc + (student[crit] || 0), 0)}</TableCell>
                            </TableRow>
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
        </Container>
    );
}
