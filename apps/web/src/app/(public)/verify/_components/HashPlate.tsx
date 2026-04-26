/**
 * Hash plate — framed 1px box with uppercase label and break-all mono value.
 * Mirrors `.hash` in shared.css. Used for IDs, hashes, UIDs.
 */
export function HashPlate({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`ll-hash-plate${className ? ` ${className}` : ''}`}>
      <span className="ll-hash-label">{label}</span>
      <span className="ll-hash-value">{value}</span>
    </div>
  );
}
