function TransactionList({
  transactions,
  deleteTransaction,
  editTransaction,
  darkMode,
}) {
  if (transactions.length === 0) {
    return (
      <div
        className={`mt-6 rounded-2xl p-10 text-center shadow-lg ${
          darkMode
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <div className="text-5xl mb-4">💸</div>

        <h2 className="text-2xl font-bold">
          No Transactions Found
        </h2>

        <p className="mt-2 opacity-70">
          Your transactions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`mt-6 rounded-2xl shadow-lg overflow-hidden ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      {/* HEADER */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">
              Transactions
            </h2>

            <p className="text-sm opacity-60 mt-1">
              Manage your recent income and expenses
            </p>
          </div>

          <div className="text-sm opacity-60">
            {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* LIST */}
      <div>
        {transactions.map((item) => {
          const isIncome = item.type === "income";

          return (
            <div
              key={item._id}
              className={`px-5 py-5 border-b last:border-b-0 transition-all duration-200 hover:bg-gray-50 ${
                darkMode
                  ? "border-gray-800 hover:bg-gray-800/70"
                  : "border-gray-100"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                
                {/* LEFT */}
                <div className="flex items-center gap-4 min-w-0">
                  
                  {/* TYPE ICON */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
                      isIncome
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isIncome ? "↗" : "↘"}
                  </div>

                  {/* DETAILS */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                      
                      <span
                        className={`px-2.5 py-1 rounded-full font-medium ${
                          isIncome
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isIncome
                          ? "Income"
                          : "Expense"}
                      </span>

                      <span className="opacity-60">
                        •
                      </span>

                      <span className="opacity-70">
                        {item.category}
                      </span>

                      {item.date && (
                        <>
                          <span className="opacity-60">
                            •
                          </span>

                          <span className="opacity-60">
                            {new Date(
                              item.date
                            ).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:justify-end">

                  {/* AMOUNT */}
                  <div
                    className={`text-xl font-bold min-w-[120px] lg:text-right ${
                      isIncome
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {isIncome ? "+" : "-"}₹
                    {Number(item.amount).toLocaleString(
                      "en-IN"
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editTransaction(item)}
                      className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 hover:-translate-y-0.5 transition-all"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteTransaction(item._id)
                      }
                      className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 hover:-translate-y-0.5 transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TransactionList;