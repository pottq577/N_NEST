import React, { useState } from 'react'

export default function EvaluationSettings() {
  const [criteria, setCriteria] = useState(['Teamwork', 'Code Quality', 'Communication'])
  const [newCriterion, setNewCriterion] = useState('')

  const addNewCriterion = () => {
    if (newCriterion) {
      setCriteria([...criteria, newCriterion])
      setNewCriterion('')
    }
  }

  return (
    <div className='container'>
      <h1>Evaluation Criteria Settings</h1>
      <ul>
        {criteria.map((criterion, index) => (
          <li key={index}>{criterion}</li>
        ))}
      </ul>
      <input
        type='text'
        value={newCriterion}
        onChange={e => setNewCriterion(e.target.value)}
        placeholder='New Criterion'
      />
      <button onClick={addNewCriterion}>Add Criterion</button>
      {/* Style and functionality omitted for brevity */}
    </div>
  )
}
