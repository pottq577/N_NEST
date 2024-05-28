const API_URL = 'http://localhost:8000';

export async function executeCode(code, language) {
    const response = await fetch(`${API_URL}/execute/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
    });
    return await response.json();
}
