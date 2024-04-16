import React, { useState } from 'react'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const AddButton = ({ onClick }) => {
  const baseStyle = {
    backgroundColor: 'transparent',
    border: '1px solid #ccc',
    padding: '5px 10px',
    cursor: 'pointer',
    outline: 'none'
  }

  const [style, setStyle] = React.useState(baseStyle)

  return (
    <button
      style={style}
      onMouseEnter={() => setStyle({ ...style, backgroundColor: '#f0f0f0' })}
      onMouseLeave={() => setStyle(baseStyle)}
      onClick={onClick}
    >
      추가
    </button>
  )
}

const Career = () => {
  const [imgSrc, setImgSrc] = useState('../../../../public/images/avatars/1.png')

  return (
    <div
      style={{
        flexDirection: 'row',
        display: 'flex',
        padding: 30,
        marginRight: 100
      }}
    >
      {/* 이력서 세부 내용 div */}
      <div
        style={{
          // backgroundColor: 'orange',
          width: '70%',
          padding: '20px', // Add padding
          marginRight: '10px', // Add margin between the divs
          boxSizing: 'border-box' // Ensure padding does not affect overall width
          // boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)' // Shadow effect
        }}
      >
        {/* Profile Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '24px', marginBottom: '8px' }}>홍길동</div>
            <div style={{ marginBottom: '4px' }}>honggildong@example.com</div>
            <div>github.com/honggildong</div>
          </div>
          <div>
            <img src='imgSrc' alt='프로필 사진' style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
            <button style={{ marginLeft: '10px' }}>수정</button>
          </div>
        </div>
        <hr />

        {/* Education Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>학력</div>
            <AddButton onClick={() => console.log('추가 clicked')} />
          </div>
          {/* Education List */}
          <ul>
            <li>서울대학교 컴퓨터 과학과 - 학사</li>
            {/* More items */}
          </ul>
        </div>
        <hr />

        {/* Experience Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>경력</div>
            <AddButton onClick={() => console.log('추가 clicked')} />
          </div>
          {/* Experience List */}
          <ul>
            <li>NAVER - 소프트웨어 엔지니어</li>
            {/* More items */}
          </ul>
        </div>
        <hr />
        {/* Skills Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>스킬</div>
            <AddButton onClick={() => console.log('추가 clicked')} />
          </div>
          {/* Skills List */}
          <ul>
            <li>자바스크립트</li>
            {/* More items */}
          </ul>
        </div>
      </div>
      <Divider />
      {/* 이력서 요약 내용 div */}
      <div
        style={{
          // backgroundColor: 'violet',
          width: '30%',
          padding: '20px', // Add padding
          boxSizing: 'border-box', // Ensure padding does not affect overall width
          boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)', // Shadow effect
          height: '500px'
        }}
      >
        hi
      </div>
    </div>
  )
}

export default Career
