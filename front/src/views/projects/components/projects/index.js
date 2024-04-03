import React from 'react'

const projects = [
  { id: 1, name: '프로젝트 1' },
  { id: 2, name: '프로젝트 2' }
]

const Overview = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 800,
        marginTop: 30,
        marginLeft: 30
      }}
    >
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginBottom: 20, height: 33 }}>
        <input type='text' placeholder='검색...' style={{ flex: 1, marginRight: 10 }} />
        <button style={{ flexBasis: '100px' }}>정렬</button>
      </div>
      <ul
        style={{
          listStyle: 'none',
          width: '100%',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {projects.map(project => (
          <li key={project.id} style={{ width: '90%', textAlign: 'center', marginBottom: 10 }}>
            {project.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Overview
