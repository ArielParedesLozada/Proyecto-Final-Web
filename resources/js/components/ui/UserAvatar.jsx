export default function UserAvatar({
  name = "ElkinnnLopez_10",
  initials = "EL",
  avatarUrl = null,
}) {
  return (
    <div
      className="
        relative inline-flex items-center group
        transition-transform duration-300
        hover:-translate-x-30
      "
    >
      {/* Avatar */}
      <div
        className="
          h-9 w-9 rounded-full bg-primary-600 text-white 
          grid place-items-center font-semibold shadow-sm 
          ring-1 ring-white/10
        "
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
      </div>

      {/* Nombre al lado derecho del avatar (1 sola línea, ellipsis si es largo) */}
      <div
        className="
          absolute top-1/2 -translate-y-1/2 left-[calc(100%+0.5rem)]
          opacity-0 group-hover:opacity-100
          transition-all duration-300 ease-out
          z-50
        "
      >
        <div
          className="
            px-3 py-1.5 rounded-lg 
            bg-gray-900/90 dark:bg-gray-800/90 
            backdrop-blur-md shadow-lg 
            ring-1 ring-white/10
            max-w-[70vw] md:max-w-[40vw] lg:max-w-[24rem]
          "
          title={name}  
        >
          <p
            className="
              text-sm font-medium text-white leading-snug
              whitespace-nowrap overflow-hidden truncate
            "
          >
            {name}
          </p>
        </div>
      </div>
    </div>
  );
}
