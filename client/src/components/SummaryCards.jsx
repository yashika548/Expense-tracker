function SummaryCards({
  balance,
  income,
  expense,
  darkMode,
}) {
  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  const cards = [
    {
      title: "Total Balance",
      amount: balance,
      icon: "💰",
      amountClass:
        balance >= 0
          ? "text-indigo-600"
          : "text-red-600",
      iconBg:
        darkMode
          ? "bg-indigo-500/20"
          : "bg-indigo-100",
    },
    {
      title: "Total Income",
      amount: income,
      icon: "📈",
      amountClass: "text-green-600",
      iconBg:
        darkMode
          ? "bg-green-500/20"
          : "bg-green-100",
    },
    {
      title: "Total Expense",
      amount: expense,
      icon: "📉",
      amountClass: "text-red-600",
      iconBg:
        darkMode
          ? "bg-red-500/20"
          : "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
            darkMode
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-900"
          }`}
        >
          {/* Decorative circle */}
          <div
            className={`absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-50 transition-transform duration-500 group-hover:scale-125 ${card.iconBg}`}
          />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-semibold ${
                    darkMode
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  {card.title}
                </p>

                <h2
                  className={`mt-3 text-3xl font-bold ${card.amountClass}`}
                >
                  ₹ {formatAmount(card.amount)}
                </h2>
              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.iconBg}`}
              >
                {card.icon}
              </div>
            </div>

            <div
              className={`mt-5 h-1 rounded-full ${
                card.title === "Total Income"
                  ? "bg-green-500"
                  : card.title === "Total Expense"
                  ? "bg-red-500"
                  : "bg-indigo-500"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;