export default function Empty({ title="Sin datos", subtitle="Aún no hay información para mostrar.", description, icon, variant="default" }) {
  // Variante para gráficos: más ancho y centrado
  const chartClasses = "fin-card p-8 text-center w-full max-w-md mx-auto";
  // Variante por defecto: como estaba antes
  const defaultClasses = "fin-card p-8 text-center";
  
  const containerClasses = variant === "chart" ? chartClasses : defaultClasses;
  
  return (
    <div className={containerClasses}>
      <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {subtitle || description}
      </p>
    </div>
  );
}
