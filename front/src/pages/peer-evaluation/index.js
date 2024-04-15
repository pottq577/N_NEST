import React, { useState, useEffect } from 'react'

const initialProjects = [
  { id: 1, title: 'Project Alpha', evaluated: false },
  { id: 2, title: 'Project Beta', evaluated: false },
  { id: 3, title: 'Project Gamma', evaluated: false }

  // ... more projects
]

const criteria = ['Teamwork', 'Code Quality', 'Communication'] // This should be fetched or passed from the settings page

export default function PeerEvaluation() {
  const [projects, setProjects] = useState([])
  const [evaluations, setEvaluations] = useState({})

  useEffect(() => {
    // Simulate fetching projects excluding the user's own
    // In a real scenario, fetch from API and exclude based on user
    const assignedProjects = initialProjects.sort(() => 0.5 - Math.random()).slice(0, 3)
    setProjects(assignedProjects)

    // Initialize evaluations state
    const initialEvaluations = {}
    assignedProjects.forEach(project => {
      initialEvaluations[project.id] = {}
      criteria.forEach(criterion => {
        initialEvaluations[project.id][criterion] = 0
      })
    })
    setEvaluations(initialEvaluations)
  }, [])

  const handleEvaluationChange = (projectId, criterion, score) => {
    setEvaluations({
      ...evaluations,
      [projectId]: {
        ...evaluations[projectId],
        [criterion]: score
      }
    })
  }

  const submitEvaluations = () => {
    console.log('Submitting Evaluations: ', evaluations)
  }

  return (
    <div className='container'>
      <h1>Peer Evaluation</h1>
      {projects.map(project => (
        <div key={project.id}>
          <h2>{project.title}</h2>
          {criteria.map(criterion => (
            <div key={criterion}>
              <label>{criterion}: </label>
              {[1, 2, 3, 4, 5].map(score => (
                <label key={score}>
                  <input
                    type='radio'
                    name={`project-${project.id}-criterion-${criterion}`}
                    checked={evaluations[project.id][criterion] === score}
                    onChange={() => handleEvaluationChange(project.id, criterion, score)}
                  />
                  {score}
                </label>
              ))}
            </div>
          ))}
        </div>
      ))}
      <button onClick={submitEvaluations}>Submit Evaluations</button>
      {/* Style and functionality omitted for brevity */}
    </div>
  )
}
