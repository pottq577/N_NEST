import React, { useEffect, useState } from 'react'
import router, { useRouter } from 'next/router'

const Space = padding => {
  return <div style={{ padding: padding }} />
}

const projects = [
  { id: 1, name: 'N_NEST', language: 'Python', stars: 1, updated: '4 days ago', desc: 'nnest' },
  {
    id: 2,
    name: 'AGPT',
    language: 'JavaScript',
    license: 'MIT License',
    updated: 'last week',
    desc: 'AutoGPT list test'
  }
]

const Overview = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProjects, setFilteredProjects] = useState(projects)
  const router = useRouter()

  useEffect(() => {
    const filtered = projects.filter(project => project.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredProjects(filtered)
  }, [searchTerm])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '30px 50px 0px 40px'
      }}
    >
      {/* 검색 / 정렬 div */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          marginBottom: 20,
          height: 40
        }}
      >
        <input
          type='text'
          placeholder='  검색 ...'
          style={{ flex: 1, marginRight: 20, borderRadius: 7, borderWidth: 1, padding: '8px' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button style={{ flexBasis: '100px', padding: '8px 16px ' }}>정렬</button>
        <Space />
        <button
          style={{
            flexBasis: '100px',
            padding: '8px 16px ',
            backgroundColor: '#9155FD',
            borderRadius: 5,
            borderWidth: 0,
            color: 'white',
            fontWeight: '600',
            marginLeft: 10,
            fontSize: '0.875rem'
          }}
          onClick={() => router.push('/new/')}
        >
          새 프로젝트
        </button>
      </div>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {filteredProjects.map(project => (
          <div
            key={project.id}
            style={{
              width: '100%',
              border: '1px solid #e1e4e8',
              borderRadius: 6,
              padding: '16px',
              margin: '8px 0',
              textAlign: 'left',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontWeight: 'bold', color: '#347deb', fontSize: 20 }}>{project.name}</div>
            <Space />
            <div style={{ width: '50%' }}>{project.desc}</div>
            <Space />
            <div style={{ color: '#586069' }}>
              {project.language && <span>{project.language}</span>}
              {project.stars && <span> • {project.stars} stars</span>}
              {project.license && <span> • {project.license}</span>}
              <span> • Updated {project.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Overview
