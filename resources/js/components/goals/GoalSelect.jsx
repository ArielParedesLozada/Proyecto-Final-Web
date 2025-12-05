import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ScrollArea from "../ui/ScrollArea";

export default function GoalSelect({ goals = [], value, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const searchRef = useRef(null);

  const filteredGoals = goals.filter(goal => {
    const label = goal.label || goal.name || goal;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedGoal = goals.find(goal => 
    (goal.value || goal.id || goal) === value
  );

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen]);

  const handleSelect = (goalValue) => {
    onChange?.(goalValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={["flex items-center gap-3", className].join(" ")}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
        Meta:
      </span>

      <div className="relative w-50">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-10 px-3 pr-8 rounded-lg bg-white dark:bg-gray-800
                     border border-gray-300 dark:border-gray-600
                     hover:border-gray-400 dark:hover:border-gray-500
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     text-sm font-medium text-gray-900 dark:text-gray-100 truncate cursor-pointer"
        >
          {selectedGoal ? (selectedGoal.label || selectedGoal.name || selectedGoal) : "Seleccionar meta..."}
        </button>

        <svg
          width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
          className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {isOpen && createPortal(
          <div 
            ref={dropdownRef}
            className="fixed z-[99999] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: '300px'
            }}
          >
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar meta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 dark:text-gray-100"
              />
            </div>

            <ScrollArea maxHeight="192px" className="max-h-48">
              {filteredGoals.length > 0 ? (
                filteredGoals.map((goal) => {
                  const goalValue = goal.value || goal.id || goal;
                  const isSelected = goalValue === value;
                  
                  return (
                    <button
                      key={goalValue}
                      type="button"
                      onClick={() => handleSelect(goalValue)}
                      className={[
                        "w-full px-3 py-2 text-left text-sm transition-colors duration-150 cursor-pointer",
                        "hover:bg-gray-50 dark:hover:bg-gray-700",
                        isSelected 
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                          : "text-gray-900 dark:text-gray-100"
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{goal.label || goal.name || goal}</span>
                        {isSelected && (
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchTerm ? "No se encontraron metas" : "No hay metas disponibles"}
                </div>
              )}
            </ScrollArea>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}