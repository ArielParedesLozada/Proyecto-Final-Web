import { useState, useEffect } from "react";

export default function FormError({ message }) {
  const [show, setShow] = useState(!!message);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [message]);

  if (!show) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded-lg px-3 py-2 text-sm
                 bg-red-50 text-red-700
                 dark:bg-red-900/20 dark:text-red-300"
    >
      {message}
    </div>
  );
}
