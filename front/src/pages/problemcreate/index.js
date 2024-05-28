import { useState } from 'react';

export default function CreateProblem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [outputDescription, setOutputDescription] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = {
      title,
      description,
      input_description: inputDescription,
      output_description: outputDescription,
      sample_input: sampleInput,
      sample_output: sampleOutput,
    };

    const response = await fetch('http://localhost:8000/problems/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problem),
    });

    if (response.ok) {
      alert('Problem created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setInputDescription('');
      setOutputDescription('');
      setSampleInput('');
      setSampleOutput('');
    } else {
      alert('Failed to create problem.');
    }
  };

  return (
    <div>
      <h1>Create a Problem</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Input Description</label>
          <textarea
            value={inputDescription}
            onChange={(e) => setInputDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Output Description</label>
          <textarea
            value={outputDescription}
            onChange={(e) => setOutputDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sample Input</label>
          <textarea
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sample Output</label>
          <textarea
            value={sampleOutput}
            onChange={(e) => setSampleOutput(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Problem</button>
      </form>
    </div>
  );
}
