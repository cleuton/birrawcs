export async function fetchNotes() {
    const res = await fetch('/notes', { credentials: 'include' });
    return res.json();
  }
  
  export async function login(email, password) {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return res.json();
  }
  
  export async function fetchSummary() {
    const res = await fetch('/summary', { credentials: 'include' });
    return res.json();
  }
  