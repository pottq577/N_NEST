import React, { useState, useEffect } from 'react'

function SummaryPage() {
  const [summaries, setSummaries] = useState([]) // 요약 정보를 저장할 상태

  useEffect(() => {
    // 서버에서 요약 정보를 불러오는 함수
    const fetchSummaries = async () => {
      try {
        const response = await fetch('http://127.0.0.2:8000/api/summaries') // 서버 API 주소
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        setSummaries(data) // 상태 업데이트
      } catch (error) {
        console.error('Error fetching summaries:', error)
      }
    }

    fetchSummaries()
  }, [])

  return (
    <div>
      <h1>Summary Information</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridGap: '20px',
          marginBottom: '20px'
        }}
      >
        {summaries.map(summary => (
          <div
            key={summary._id}
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <img
              src={`data:image/png;base64,${summary.imageData}`}
              alt='Summary'
              style={{ width: '100%', height: 'auto', maxWidth: '200px' }}
            />
            <p>{summary.finalSummary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SummaryPage
