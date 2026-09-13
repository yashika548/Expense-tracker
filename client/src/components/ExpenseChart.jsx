import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ExpenseChart({ income, expense, darkMode }) {
  const data = [
    {
      name: "Income",
      value: Number(income) || 0,
    },
    {
      name: "Expense",
      value: Number(expense) || 0,
    },
  ];

  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const COLORS = ["#22c55e", "#ef4444"];

  const tooltipStyle = {
    backgroundColor: darkMode ? "#111827" : "#ffffff",
    border: darkMode
      ? "1px solid #374151"
      : "1px solid #e5e7eb",
    borderRadius: "10px",
    color: darkMode ? "#ffffff" : "#111827",
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">
            Income vs Expense
          </h2>

          <p
            className={`text-sm mt-1 ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Compare your total money flow
          </p>
        </div>

        <div
          className={`text-sm font-semibold px-3 py-1 rounded-full ${
            expense > income
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {expense > income
            ? "Expenses higher"
            : "Income higher"}
        </div>
      </div>

      {total === 0 ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-3">📊</div>

          <h3 className="font-semibold">
            No financial data yet
          </h3>

          <p
            className={`text-sm mt-1 ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Add transactions to see your chart.
          </p>
        </div>
      ) : (
        <div className="w-full h-[300px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString(
                    "en-IN"
                  )}`,
                  "",
                ]}
                contentStyle={tooltipStyle}
              />

              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{
                  color: darkMode
                    ? "#ffffff"
                    : "#111827",
                  paddingTop: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div
          className={`rounded-xl p-3 ${
            darkMode
              ? "bg-gray-800"
              : "bg-green-50"
          }`}
        >
          <p className="text-xs opacity-60">
            Income
          </p>

          <p className="font-bold text-green-600 mt-1">
            ₹{Number(income || 0).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            darkMode
              ? "bg-gray-800"
              : "bg-red-50"
          }`}
        >
          <p className="text-xs opacity-60">
            Expense
          </p>

          <p className="font-bold text-red-600 mt-1">
            ₹{Number(expense || 0).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ExpenseChart;