import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Editor from '@monaco-editor/react';

export default function SolveProblem() {
  const router = useRouter();
  const { id } = router.query;
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const fetchProblem = async () => {
    if (id) {
      const response = await fetch(`http://localhost:8000/problems/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProblem(data);
      } else {
        console.error('Failed to fetch problem', response.statusText);
      }
    }
  };

  const submitCode = async () => {
    const response = await fetch('http://localhost:8000/submissions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_id: id,
        user_id: 'example_user_id', // 실제로는 인증된 사용자 ID를 사용해야 합니다.
        code,
        language,
      }),
    });
    const data = await response.json();
    if (data.error) {
      setError(data.error);
    } else {
      setResult(data);
      setError('');
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  if (!problem) return <div>Loading...</div>;

  return (
    <div>
      <h1>{problem.title}</h1>
      <p>{problem.description}</p>
      <h2>Input Description</h2>
      <p>{problem.input_description}</p>
      <h2>Output Description</h2>
      <p>{problem.output_description}</p>
      <h2>Sample Input</h2>
      <pre>{problem.sample_input}</pre>
      <h2>Sample Output</h2>
      <pre>{problem.sample_output}</pre>
      <Editor
        height="50vh"
        language={language}
        value={code}
        onChange={(value) => setCode(value)}
      />
      <select onChange={(e) => setLanguage(e.target.value)} value={language}>
        <option value="python">Python</option>
        <option value="javascript">JavaScript</option>
        {/* 필요한 다른 언어도 추가할 수 있습니다. */}
      </select>
      <button onClick={submitCode}>Submit</button>
      <h2>Result:</h2>
      {result ? (
        <div>
          <p><strong>Status:</strong> {result.is_correct ? "성공" : "실패"}</p>
          <p><strong>Stdout:</strong> {result.stdout}</p>
          <p><strong>Time:</strong> {result.time} seconds</p>
          <p><strong>Memory:</strong> {result.memory} bytes</p>
          {result.stderr && <p><strong>Stderr:</strong> {result.stderr}</p>}
          {result.compile_output && <p><strong>Compile Output:</strong> {result.compile_output}</p>}
          {result.message && <p><strong>Message:</strong> {result.message}</p>}
        </div>
      ) : (
        <p>No result yet</p>
      )}
      {error && (
        <>
          <h2>Error:</h2>
          <pre>{error}</pre>
        </>
      )}
    </div>
  );
}
