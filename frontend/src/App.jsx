import { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import StatusMessage from './components/StatusMessage';

// ─── API base URL from environment variable ───
// In dev mode with Vite proxy, we can just use "/api" (proxy handles forwarding).
// In production, VITE_API_URL points to the deployed backend.
const API_URL = import.meta.env.VITE_API_URL || '';

const App = () => {
  // ─── State: tracks current status and message for the StatusMessage component ───
  const [status, setStatus] = useState(null);    // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  // ─── Handle form submission ───
  // Called by FileUpload when the user clicks "Generate & Send Report"
  const handleSubmit = async (file, email) => {
    // Show loading state
    setStatus('loading');
    setMessage('Parsing file, generating AI summary, and sending email...');

    try {
      // ─── Build FormData (required for file uploads) ───
      const formData = new FormData();
      formData.append('file', file);     // the CSV/XLSX file
      formData.append('email', email);   // the recipient email

      // ─── Send POST request to backend ───
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // ─── Success! ───
      setStatus('success');
      setMessage(response.data.message || 'Report sent successfully! Check your inbox.');

    } catch (error) {
      // ─── Error ───
      setStatus('error');

      // Try to show the server's error message, otherwise show a generic one
      const errMsg =
        error.response?.data?.error ||
        error.message ||
        'Something went wrong. Please try again.';
      setMessage(errMsg);
    }
  };

  return (
    <div className="app">
      {/* ─── Header ─── */}
      <header className="header">
        <h1>Sales Insight Automator</h1>
        <p>Upload a sales file, get an AI-powered summary in your inbox.</p>
      </header>

      {/* ─── Main Card ─── */}
      <main className="card">
        <FileUpload onSubmit={handleSubmit} isLoading={status === 'loading'} />
        <StatusMessage status={status} message={message} />
      </main>

      {/* ─── Footer ─── */}
      <footer className="footer">
        Powered by Rabbitt AI &middot; Groq (Llama 3) &middot; Resend
      </footer>
    </div>
  );
};

export default App;
