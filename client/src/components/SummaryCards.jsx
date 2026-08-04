function SummaryCards({ balance, income, expense, darkMode }) {
  return (
    <div className="grid grid-cols-3 gap-5 mt-6">

      <div className={`p-5 rounded-xl shadow-lg ${
    darkMode ? "bg-gray-800 text-white" : "bg-white"
  }`}>
        <h3 className="text-gray-500">Total Balance</h3>
        <h1 className="text-3xl font-bold">
          ₹ {balance}
        </h1>
      </div>

      <div className="rounded-xl shadow-lg p-6 bg-green-100">
        <h3>Total Income</h3>
        <h1 className="text-3xl font-bold text-green-700">
          ₹ {income}
        </h1>
      </div>

      <div className="rounded-xl shadow-lg p-6 bg-red-100">
        <h3>Total Expense</h3>
        <h1 className="text-3xl font-bold text-red-700">
          ₹ {expense}
        </h1>
      </div>

    </div>
  );
}

export default SummaryCards;