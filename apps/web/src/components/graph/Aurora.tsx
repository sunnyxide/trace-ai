/**
 * Aurora — three soft, animated radial blobs that drift behind the hero.
 * Uses pure CSS keyframes (defined in globals.css). No JS, GPU-accelerated.
 */
export function Aurora() {
  return (
    <div className="ll-aurora" aria-hidden>
      <div className="ll-aurora-blob ll-aurora-blob-1" />
      <div className="ll-aurora-blob ll-aurora-blob-2" />
      <div className="ll-aurora-blob ll-aurora-blob-3" />
    </div>
  );
}
