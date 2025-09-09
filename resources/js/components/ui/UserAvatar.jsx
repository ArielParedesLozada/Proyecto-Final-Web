// resources/js/components/ui/UserAvatar.jsx
export default function UserAvatar({
  name = "ElkinnnLopez_10",
  initials = "EL",
  avatarUrl = null,
}) {
  return (
    <div className="relative group">
      {/* Avatar */}
      <button
        type="button"
        className="h-9 w-9 rounded-full bg-primary-600 text-white grid place-items-center font-semibold"
        aria-label={name}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {/* Tooltip */}
      <div
        className="
          absolute right-0 top-full mt-2 z-50
          px-3 py-1.5 rounded-lg bg-gray-900/95 text-white text-sm
          shadow-xl ring-1 ring-white/10
          pointer-events-none
          opacity-0 translate-y-1 transition
          group-hover:opacity-100 group-hover:translate-y-0
          whitespace-nowrap
        "
        role="tooltip"
      >
        {/* Flechita */}
        <span
          className="
            absolute -top-1.5 right-3 h-3 w-3 rotate-45
            bg-gray-900/95 ring-1 ring-white/10
          "
          aria-hidden="true"
        />
        {name}
      </div>
    </div>
  );
}
