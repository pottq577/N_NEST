import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProblemsList() {
  const [problems, setProblems] = useState([]);

  const fetchProblems = async () => {
    const response = await fetch('http://localhost:8000/problems/');
    const data = await response.json();
    setProblems(data);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  return (
    <div>
      <h1>Problems List</h1>
      <ul>
        {problems.map(problem => (
          <li key={problem._id}>
            <Link href={`/codetest/${problem._id}`}>
              <a>{problem.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}