// ─── StatusMessage Component ───
// Displays one of three states: loading, success, or error.
// Only renders when the "status" prop is not null.
const StatusMessage = ({ status, message }) => {
  // Don't render anything if there's no status to show
  if (!status) return null;

  return (
    <div className={`status ${status}`}>
      {/* Show spinner during loading */}
      {status === 'loading' && (
        <>
          <span className="spinner"></span>
          {message || 'Parsing file, generating AI summary, and sending email...'}
        </>
      )}

      {/* Show success message */}
      {status === 'success' && (
        <>{message || 'Report sent successfully! Check your inbox.'}</>
      )}

      {/* Show error message */}
      {status === 'error' && (
        <>{message || 'Something went wrong. Please try again.'}</>
      )}
    </div>
  );
};

export default StatusMessage;
