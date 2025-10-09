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

  const validateAndFetch = (newDateRange = dateRange, newTransactionType = transactionType) => {
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

    if (onApplyFilters) {
      onApplyFilters(newDateRange, newTransactionType);
    }
    return true;
  };

  const handleDateChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    onDateRangeChange(newDateRange);
    
    validateAndFetch(newDateRange, transactionType);
  };

  const toggleTransactionType = (type) => {
    let newTransactionType;
    
    if (transactionType.includes(type)) {
      newTransactionType = [];
    } else {
      newTransactionType = [type];
    }
    
    onTransactionTypeChange(newTransactionType);
    validateAndFetch(dateRange, newTransactionType);
  };

  const handleClear = () => {
    onDateRangeClear();
    onTransactionTypeClear();
    toast.push({
      title: "Filtros limpiados",
      message: "Se han restablecido todos los filtros",
      tone: "info"
    });
    validateAndFetch({ start: "", end: "" }, []);
  };


  const goalOptions = goals.map(goal => ({
    value: goal.id,
    label: goal.name
  }));

  return (
    <div className="fin-card p-4 md:p-5 mb-3">
      <div className="flex flex-wrap items-center gap-3">
        {loading ? (
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ) : (
          <div className="h-10">
            <GoalSelect 
              goals={goalOptions} 
              value={selectedGoal?.id || ""} 
              onChange={onGoalChange} 
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Tipo:</span>
          <div className="flex gap-1">
            {['Fijo', 'Variable'].map((type) => {
              const active = transactionType.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleTransactionType(type)}
                  className={`px-3 py-1.5 rounded-full text-sm ring-1 transition
                    ${active
                      ? "bg-primary-600 text-white ring-primary-600"
                      : "text-gray-600 ring-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700/40"}`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="btn btn-primary cursor-pointer shadow-sm ml-auto"
          title="Limpiar filtros"
        >
          Limpiar
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha inicio</span>
          <input
            type="date"
            className="input-base"
            value={dateRange.start || ""}
            onChange={(e) => handleDateChange('start', e.target.value)}
          />
        </label>
        
        <label className="block">
          <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha fin</span>
          <input
            type="date"
            className="input-base"
            value={dateRange.end || ""}
            onChange={(e) => handleDateChange('end', e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
