export function Logotipo({ className = "" }) {
  return (
    <div
      className={`flex items-baseline gap-2 ${className}`.trim()}
      aria-label="Iron Empire"
    >
      <span className="titulo-xl text-xl tracking-[0.22em] text-hueso sm:text-2xl">
        IRON
      </span>

      <span className="titulo-xl text-xl tracking-[0.22em] text-azul-500 sm:text-2xl">
        EMPIRE
      </span>
    </div>
  );
}

export default Logotipo;
