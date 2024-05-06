// pages/index.js
import { useState } from 'react';

export default function Home() {
    const [input, setInput] = useState('');
    const [category, setCategory] = useState('');  // 변수 이름을 category로 변경

    const handleSubmit = async () => {
        const response = await fetch('http://localhost:8000/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: input })
        });
        const data = await response.json();
        setCategory(data.category);  // 결과를 'category'로 설정
    };

    return (
        <div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your text"
            />
            <button onClick={handleSubmit}>Submit</button>
            <p>Category: {category}</p>  // 결과를 표시할 때 'category'를 사용
        </div>
    );
}
