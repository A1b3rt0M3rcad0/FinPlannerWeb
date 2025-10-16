export default function SideBarItem({ icon: Icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg
        transition-all duration-200
        ${
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-secondary-900 shadow-lg shadow-primary-500/30 font-semibold"
            : "text-gray-300 hover:text-white hover:bg-secondary-700/50"
        }
      `}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
}
