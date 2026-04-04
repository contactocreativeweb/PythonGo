export default function ProgressBar({ percent, color = 'var(--accent)', height = 8 }) {
  return (
    <div className="progress-bar-container" style={{ height }}>
      <div
        className="progress-bar-fill"
        style={{
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        }}
      />
    </div>
  );
}
