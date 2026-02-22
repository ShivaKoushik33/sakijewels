export default function OrderCard({ order }) {
  if (!order || !order.items || order.items.length === 0) return null;

  const firstItem = order.items[0];

  // Status color mapping
  const getToneClasses = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "text-[#34C759] border-[#34C759]/30 bg-[#34C759]/10";
      case "PENDING":
        return "text-[#FF9900] border-[#FF9900]/30 bg-[#FF9900]/10";
      case "REJECTED":
        return "text-[#FF3B30] border-[#FF3B30]/30 bg-[#FF3B30]/10";
      case "DELIVERED":
        return "text-[#1E4CA6] border-[#1E4CA6]/30 bg-[#1E4CA6]/10";
      default:
        return "text-[#353945] border-[#E6E8EC] bg-white";
    }
  };

  const toneClasses = getToneClasses(order.status);

  return (
    <div className="w-full bg-white border border-[#E6E8EC] rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-5">

      <div className="w-full sm:w-[84px] h-[120px] sm:h-[84px] rounded-lg overflow-hidden border border-[#E6E8EC] bg-[#FCFDFC] flex-shrink-0">
        <img
          src={firstItem.image}
          alt={firstItem.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">

        <div className="flex-1 min-w-0">
          <div className="text-sm md:text-base font-semibold text-[#141416] truncate">
            {firstItem.name}
          </div>

          <div className="text-xs md:text-sm text-[#777E90] mt-0.5">
            Order ID: {order._id}
          </div>

          <div className="text-xs md:text-sm text-[#777E90] mt-0.5">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0">

          <div className="text-sm md:text-base font-semibold text-[#141416]">
            ₹{Number(order.totalAmount).toLocaleString()}
          </div>

          <div
            className={`px-2 md:px-3 py-1 rounded-full border text-xs md:text-sm ${toneClasses}`}
          >
            {order.status}
          </div>

        </div>

      </div>
    </div>
  );
}
