export default function FormError({ message }) {
  if (!message) return null;

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
