export default function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
      {message}
    </div>
  );
}
