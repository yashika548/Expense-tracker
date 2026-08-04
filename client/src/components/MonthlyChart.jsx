import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function MonthlyChart({ transactions }) {
  const monthlyData = {};

  transactions.forEach((item) => {
    const month = new Date(item.date).toLocaleString("default", {
      month: "short",
    });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    if (item.type === "expense") {
      monthlyData[month] += Number(item.amount);
    }
  });

  const chartData = Object.keys(monthlyData).map((month) => ({
    month,
    expense: monthlyData[month],
  }));

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg mt-8">

      <h2 className="text-2xl font-bold mb-5">

        Monthly Analytics

      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Bar dataKey="amount" />

        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}

export default MonthlyChart;