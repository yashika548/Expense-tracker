import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"];

function ExpenseChart({ income, expense , darkMode}) {

  const data = [
    {
      name: "Income",
      value: income,
    },
    {
      name: "Expense",
      value: expense,
    },
  ];

  return (
    <PieChart width={400} height={300}>

      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={100}
        dataKey="value"
      >

        {data.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index]}
          />
        ))}

      </Pie>

      <Tooltip />

      <Legend />

    </PieChart>
  );
}

export default ExpenseChart;