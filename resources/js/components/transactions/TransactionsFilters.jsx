import GoalSelect from "../goals/GoalSelect";
import { useToast } from "../ui/ToastProvider";

export default function TransactionsFilters({ 
  dateRange, 
  onDateRangeChange, 
  onDateRangeClear,
  transactionType,
  onTransactionTypeChange,
  onTransactionTypeClear,
  goals,
  selectedGoal,
  onGoalChange,
  loading,
  onApplyFilters
}) {
  const toast = useToast();

  // Validar y aplicar filtros
  const validateAndFetch = (newDateRange = dateRange, newTransactionType = transactionType) => {
    // Validar fechas
    if (newDateRange.start && !newDateRange.end) {
      toast.push({
        title: "Filtro de fechas incompleto",
        message: "Debes ingresar fecha de inicio y fin",
        tone: "warning"
      });
      return false;
    }

    if (!newDateRange.start && newDateRange.end) {
      toast.push({
        title: "Filtro de fechas incompleto", 
        message: "Debes ingresar fecha de inicio y fin",
        tone: "warning"
      });
      return false;
    }

    // Validar rango de fechas
    if (newDateRange.start && newDateRange.end) {
      const startDate = new Date(newDateRange.start);
      const endDate = new Date(newDateRange.end);
      
      if (endDate < startDate) {
        toast.push({
          title: "Rango de fechas inválido",
          message: "La fecha fin no puede ser anterior a la fecha inicio",
          tone: "error"
        });
        return false;
      }
    }

    // Aplicar filtros si son válidos
    if (onApplyFilters) {
      onApplyFilters(newDateRange, newTransactionType);
    }
    return true;
  };

  // Manejar cambio de fecha
  const handleDateChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    onDateRangeChange(newDateRange);
    
    // Aplicar automáticamente (con validación)
    validateAndFetch(newDateRange, transactionType);
  };

  // Manejar cambio de tipo de transacción (exclusivo)
  const toggleTransactionType = (type) => {
    let newTransactionType;
    
    if (transactionType.includes(type)) {
      // Si está activo, desactivarlo (quedar sin tipo)
      newTransactionType = [];
    } else {
      // Si no está activo, activarlo y desactivar el otro
      newTransactionType = [type];
    }
    
    onTransactionTypeChange(newTransactionType);
    // Aplicar automáticamente (con validación)
    validateAndFetch(dateRange, newTransactionType);
  };

  // Limpiar filtros
  const handleClear = () => {
    onDateRangeClear();
    onTransactionTypeClear();
    toast.push({
      title: "Filtros limpiados",
      message: "Se han restablecido todos los filtros",
      tone: "info"
    });
    // Aplicar automáticamente después de limpiar
    validateAndFetch({ start: "", end: "" }, []);
  };


  // Preparar opciones para el GoalSelect
  const goalOptions = goals.map(goal => ({
    value: goal.id,
    label: goal.name
  }));

  return (
    <div className="fin-card px-4 py-3 md:px-5 md:py-4 mb-0 overflow-visible bg-white dark:bg-gray-800">
      <div className="flex flex-wrap items-end gap-3 overflow-visible">
        {/* Selector de meta */}
        <div className="flex items-end gap-3">
          {loading ? (
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ) : (
            <div className="h-10">
              <GoalSelect 
                goals={goalOptions} 
                value={selectedGoal?.id || ""} 
                onChange={onGoalChange} 
              />
            </div>
          )}
        </div>

        {/* Filtros de fecha */}
        <div className="flex items-end gap-2">
          <label className="block">
            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Desde</span>
            <input
              type="date"
              className="w-full rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm h-10"
              value={dateRange.start || ""}
              onChange={(e) => handleDateChange('start', e.target.value)}
            />
          </label>
          
          <label className="block">
            <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hasta</span>
            <input
              type="date"
              className="w-full rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm h-10"
              value={dateRange.end || ""}
              onChange={(e) => handleDateChange('end', e.target.value)}
            />
          </label>
        </div>

        {/* Filtros de tipo de transacción */}
        <div className="flex items-end gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tipo:</span>
          <div className="flex gap-1">
            {['Fijo', 'Variable'].map((type) => {
              const active = transactionType.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleTransactionType(type)}
                  className={`px-3 py-2 rounded-full text-sm ring-1 transition h-10
                    ${active
                      ? "bg-primary-600 text-white ring-primary-600"
                      : "text-gray-600 ring-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/40"}`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón limpiar */}
        <button
          type="button"
          onClick={handleClear}
          className="btn btn-primary cursor-pointer shadow-sm text-sm"
          title="Limpiar filtros"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
