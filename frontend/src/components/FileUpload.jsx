import { useState, useRef } from 'react';

// ─── FileUpload Component ───
// Provides a drag-and-drop zone (or click to browse) for CSV/XLSX files,
// an email input field, and a submit button.
const FileUpload = ({ onSubmit, isLoading }) => {
  const [file, setFile] = useState(null);           // selected file
  const [email, setEmail] = useState('');            // email input value
  const [dragOver, setDragOver] = useState(false);   // is user dragging a file over the zone?
  const fileInputRef = useRef(null);                 // reference to the hidden <input type="file">

  // ─── Handle file selection (from click or drop) ───
  const handleFile = (selectedFile) => {
    // Only accept .csv and .xlsx files
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const validExtensions = ['.csv', '.xlsx'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (validTypes.includes(selectedFile.type) || validExtensions.includes(ext)) {
      setFile(selectedFile);
    } else {
      alert('Please upload a .csv or .xlsx file only.');
    }
  };

  // ─── Drag & Drop event handlers ───
  const handleDragOver = (e) => {
    e.preventDefault();        // required to allow dropping
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0]; // get the first file
    if (droppedFile) handleFile(droppedFile);
  };

  // ─── Click to browse ───
  const handleClick = () => {
    fileInputRef.current.click(); // open the file picker dialog
  };

  // ─── File input change handler ───
  const handleInputChange = (e) => {
    const selected = e.target.files[0];
    if (selected) handleFile(selected);
  };

  // ─── Remove selected file ───
  const handleRemoveFile = () => {
    setFile(null);
    fileInputRef.current.value = ''; // reset the input so same file can be re-selected
  };

  // ─── Form submit ───
  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload

    // Basic client-side validation
    if (!file) {
      alert('Please select a file first.');
      return;
    }
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    // Call the parent's onSubmit with the file and email
    onSubmit(file, email);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ─── Drag & Drop Zone ─── */}
      <div
        className={`dropzone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <span className="dropzone-icon">&#128196;</span>
        <p className="dropzone-text">
          Drag & drop your file here, or <span>browse</span>
        </p>
        <p className="dropzone-hint">Accepts .csv and .xlsx (max 5MB)</p>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept=".csv,.xlsx"
          style={{ display: 'none' }}
        />
      </div>

      {/* ─── Show selected file name ─── */}
      {file && (
        <div className="file-info">
          <span className="file-info-name">{file.name}</span>
          <button
            type="button"
            className="file-info-remove"
            onClick={handleRemoveFile}
            title="Remove file"
          >
            &times;
          </button>
        </div>
      )}

      {/* ─── Email Input ─── */}
      <div className="email-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          className="email-input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* ─── Submit Button ─── */}
      <button
        type="submit"
        className="submit-btn"
        disabled={isLoading || !file || !email}
      >
        {isLoading ? 'Processing...' : 'Generate & Send Report'}
      </button>
    </form>
  );
};

export default FileUpload;
