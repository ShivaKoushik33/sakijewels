const ColorTabs = ({ tabs, addLabel, onAdd }) => (
  <div className="flex flex-wrap items-stretch gap-3">
    {tabs.map((tab) => (
      <div
        key={tab.key}
        className={`flex items-center border ${
          tab.active
            ? "bg-white border-black font-semibold text-black"
            : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <button
          type="button"
          onClick={tab.onClick}
          aria-current={tab.active ? "true" : undefined}
          className="min-w-[120px] px-6 py-2 text-sm uppercase cursor-pointer"
        >
          {tab.label}
        </button>
        {tab.onRemove && (
          <button
            type="button"
            onClick={tab.onRemove}
            aria-label={`Remove ${tab.label}`}
            title="Remove this color"
            className="pr-2 text-xs text-gray-500 hover:text-red-500 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>
    ))}

    <button
      type="button"
      onClick={onAdd}
      className="min-w-[120px] px-6 py-2 text-sm font-semibold text-white bg-[#901CDB] hover:opacity-90 cursor-pointer"
    >
      {addLabel}
    </button>
  </div>
);

export default ColorTabs;
