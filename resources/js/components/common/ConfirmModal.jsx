export default function ConfirmModal({
  open,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md fin-card p-5">
        <h3 className="text-base md:text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{message}</p>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelText}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
