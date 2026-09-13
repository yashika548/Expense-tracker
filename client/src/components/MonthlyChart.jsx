import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function MonthlyChart({ transactions, darkMode }) {
  const monthlyData = {};

  transactions.forEach((item) => {
    const date = new Date(item.date);

    if (Number.isNaN(date.getTime())) return;

    const month = date.toLocaleString("en-IN", {
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    if (item.type === "expense") {
      monthlyData[month] += Number(item.amount) || 0;
    }
  });

  const monthOrder = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartData = Object.keys(monthlyData)
    .sort(
      (a, b) =>
        monthOrder.indexOf(a) - monthOrder.indexOf(b)
    )
    .map((month) => ({
      month,
      expense: monthlyData[month],
    }));

  const totalExpense = chartData.reduce(
    (sum, item) => sum + item.expense,
    0
  );

  const averageExpense =
    chartData.length > 0
      ? totalExpense / chartData.length
      : 0;

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold">
            Monthly Analytics
          </h2>

          <p
            className={`text-sm mt-1 ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Track your monthly expenses
          </p>
        </div>

        <div
          className={`px-3 py-2 rounded-lg text-sm font-semibold ${
            darkMode
              ? "bg-gray-800 text-gray-200"
              : "bg-red-50 text-red-700"
          }`}
        >
          Total: ₹
          {totalExpense.toLocaleString("en-IN")}
        </div>
      </div>

      {/* CHART */}
      {chartData.length === 0 ? (
        <div className="h-[300px] flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-3">
            📊
          </div>

          <h3 className="font-semibold">
            No monthly data
          </h3>

          <p
            className={`text-sm mt-1 ${
              darkMode
                ? "text-gray-400"
                : "text-gray-500"
            }`}
          >
            Add expense transactions to see analytics.
          </p>
        </div>
      ) : (
        <div className="w-full h-[300px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={
                  darkMode ? "#374151" : "#e5e7eb"
                }
              />

              <XAxis
                dataKey="month"
                tick={{
                  fill: darkMode
                    ? "#d1d5db"
                    : "#374151",
                }}
              />

              <YAxis
                tick={{
                  fill: darkMode
                    ? "#d1d5db"
                    : "#374151",
                }}
                tickFormatter={(value) =>
                  `₹${value}`
                }
              />

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString(
                    "en-IN"
                  )}`,
                  "Expense",
                ]}
                contentStyle={{
                  backgroundColor: darkMode
                    ? "#111827"
                    : "#ffffff",
                  border: darkMode
                    ? "1px solid #374151"
                    : "1px solid #e5e7eb",
                  borderRadius: "10px",
                  color: darkMode
                    ? "#ffffff"
                    : "#111827",
                }}
              />

              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div
          className={`rounded-xl p-3 ${
            darkMode
              ? "bg-gray-800"
              : "bg-red-50"
          }`}
        >
          <p className="text-xs opacity-60">
            Total Expense
          </p>

          <p className="font-bold text-red-600 mt-1">
            ₹
            {totalExpense.toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            darkMode
              ? "bg-gray-800"
              : "bg-indigo-50"
          }`}
        >
          <p className="text-xs opacity-60">
            Avg. Monthly Expense
          </p>

          <p className="font-bold text-indigo-600 mt-1">
            ₹
            {Math.round(
              averageExpense
            ).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MonthlyChart;