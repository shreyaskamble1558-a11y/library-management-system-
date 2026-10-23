export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
}
