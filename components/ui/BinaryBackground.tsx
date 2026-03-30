const ROW = '1 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 0 1 0 0 1 1 0 1 0 0 0 1 0 1 '

export function BinaryBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden select-none pointer-events-none"
      aria-hidden="true"
    >
      <div className="font-mono text-[11px] leading-5 text-sky-800 opacity-[0.07]">
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap">
            {ROW.repeat(12)}
          </div>
        ))}
      </div>
    </div>
  )
}
