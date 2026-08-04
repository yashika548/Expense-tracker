import ExpenseChart from "../components/ExpenseChart";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { saveAs } from "file-saver";
import Navbar from "../components/Navbar";
import SummaryCards from "../components/SummaryCards";
import AddTransaction from "../components/AddTransaction";
import TransactionList from "../components/TransactionList";
import SearchFilter from "../components/SearchFilter";
import MonthlyChart from "../components/MonthlyChart";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



function Dashboard() {

  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const [budget, setBudget] = useState(
  Number(localStorage.getItem("budget")) || 0
  );




  const editTransaction = (transaction) => {

     console.log("Edit Clicked", transaction);
  setEditId(transaction._id);
  setEditData(transaction);
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };


  const downloadPDF = () => {

  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Expense Tracker Report", 15, 20);

  doc.setFontSize(13);

  doc.text(`Income : ₹${income}`, 15, 40);
  doc.text(`Expense : ₹${expense}`, 15, 50);
  doc.text(`Balance : ₹${balance}`, 15, 60);

  autoTable(doc, {
    startY: 75,

    head: [["Title", "Category", "Type", "Amount"]],

    body: transactions.map((item) => [
      item.title,
      item.category,
      item.type,
      item.amount,
    ]),
  });

  doc.save("Expense_Report.pdf");
};

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      console.log("Token:", token);

      const response = await api.get("/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);

      setTransactions(response.data.transactions);
      calculateSummary(response.data.transactions);

    } catch (error) {
      console.log(error);
    }finally{
      setLoading(false);
    }
  };

  const calculateSummary = (data) => {

  let totalIncome = 0;
  let totalExpense = 0;

  data.forEach((item) => {

    if (item.type === "income") {
      totalIncome += Number(item.amount);
    } else {
      totalExpense += Number(item.amount);
    }

  });

  setIncome(totalIncome);
  setExpense(totalExpense);
  setBalance(totalIncome - totalExpense);

};


  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (transactionData) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    await api.post(
      "/transactions",
      transactionData,
      {
         headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Transaction Added Successfully");

    

    // List refresh
    fetchTransactions();

  } catch (error) {
    console.log(error);
    toast.error("Failed to Add Transaction");
  }finally {
  setLoading(false);
  }
};

const deleteTransaction = async (id) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    await api.delete(`/transactions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Transaction Deleted");

    fetchTransactions();

  } catch (error) {
    console.log(error);
   toast.error("Delete Failed");

  }
  finally {
  setLoading(false);
}
};

const exportCSV = () => {
  if (transactions.length === 0) {
    alert("No Transactions Found");
    return;
  }

  const headers = [
    "Title",
    "Amount",
    "Category",
    "Type",
    "Date",
  ];

  const rows = transactions.map((item) => [
    item.title,
    item.amount,
    item.category,
    item.type,
    new Date(item.date).toLocaleDateString(),
  ]);

  const csv =
    [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, "transactions.csv");
};


const updateTransaction = async (id, data) => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");

    await api.put(
      `/transactions/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      
    );

    toast.success("Transaction Updated Successfully");

    setEditId(null);
    setEditData(null);

    fetchTransactions();

  } catch (error) {
    console.log(error);
    toast.error("updation failed");
  }
  finally {
  setLoading(false);
}
};

  
const filteredTransactions = transactions.filter((item) => {

  const matchSearch =
    item.title.toLowerCase().includes(search.toLowerCase());

  const matchCategory =
    filterCategory === "All" ||
    item.category === filterCategory;

  const itemDate = new Date(item.date);

  const matchDate =
    (!startDate || itemDate >= new Date(startDate)) &&
    (!endDate || itemDate <= new Date(endDate));

  return matchSearch && matchCategory && matchDate;
});

const sortedTransactions = [...filteredTransactions];

switch (sortBy) {
  case "latest":
    sortedTransactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    break;

  case "oldest":
    sortedTransactions.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    break;

  case "high":
    sortedTransactions.sort(
      (a, b) => b.amount - a.amount
    );
    break;

  case "low":
    sortedTransactions.sort(
      (a, b) => a.amount - b.amount
    );
    break;

  case "az":
    sortedTransactions.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
    break;

  case "za":
    sortedTransactions.sort((a, b) =>
      b.title.localeCompare(a.title)
    );
    break;

  default:
    break;
}

const indexOfLast = currentPage * transactionsPerPage;
const indexOfFirst = indexOfLast - transactionsPerPage;

const currentTransactions = filteredTransactions.slice(
  indexOfFirst,
  indexOfLast
);

const totalPages = Math.ceil(
  filteredTransactions.length / transactionsPerPage
);

if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }
  return (
    
  <div className={`min-h-screen p-8 ${
    darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
  }`}>

    <Navbar handleLogout={handleLogout} />

    <button
  onClick={() => setDarkMode(!darkMode)}
  className="bg-indigo-600 text-white px-4 py-2 rounded-lg mb-5"
>
  {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>

<button
  onClick={downloadPDF}
  className="bg-green-600 text-white px-5 py-2 rounded-lg"
>
  Download PDF
</button>

    <SummaryCards
      balance={balance}
      income={income}
      expense={expense}
      darkMode={darkMode}
    />

    <div className="bg-white p-5 rounded-xl shadow-lg mt-5">

  <h2 className="font-bold text-xl mb-3">
    Monthly Budget
  </h2>

  <input
    type="number"
    placeholder="Enter Budget"
    value={budget}
    onChange={(e) => setBudget(Number(e.target.value))}
    className="border p-3 rounded-lg w-full"
  />

  <button
    onClick={() => {
      localStorage.setItem("budget", budget);
      alert("Budget Saved");
    }}
    className="bg-blue-600 text-white px-5 py-2 rounded mt-3"
  >
    Save Budget
  </button>

   {/* ✅ Progress Bar yaha add karo */}

  {budget > 0 && (
    <>
      <div className="w-full bg-gray-300 rounded-full h-4 mt-4">

        <div
          className="bg-green-600 h-4 rounded-full"
          style={{
            width: `${Math.min((expense / budget) * 100, 100)}%`,
          }}
        ></div>

      </div>

      <p className="mt-2 text-sm">
        {Math.round((expense / budget) * 100)}% of budget used
      </p>
    </>
  )}

   {/* Budget Alert */}

  {budget > 0 && expense > budget && (
  <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded-lg mt-5">
    ⚠️ Budget Exceeded by ₹{expense - budget}
  </div>
)}

</div>

    <button
  onClick={exportCSV}
  className="bg-green-600 text-white px-5 py-2 rounded-lg mt-5"
>
  Export CSV
</button>

    <div className="bg-white mt-8 p-5 rounded-xl shadow-lg">
      <ExpenseChart
        income={income}
        expense={expense}
        darkMode={darkMode}
      />
    </div>

    <MonthlyChart transactions={transactions} />

    <SearchFilter
      search={search}
      setSearch={setSearch}
      filterCategory={filterCategory}
      setFilterCategory={setFilterCategory}
      startDate={startDate}
      setStartDate={setStartDate}
      endDate={endDate}
      setEndDate={setEndDate}
    />

    <AddTransaction
  addTransaction={addTransaction}
  updateTransaction={updateTransaction}
  editId={editId}
  editData={editData}
  darkMode={darkMode}

/>
    <TransactionList
      transactions={currentTransactions}
      deleteTransaction={deleteTransaction}
      editTransaction={editTransaction}
      darkMode={darkMode}
    />



    <div className="flex justify-center gap-3 mt-8">

  <button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
  >
    Previous
  </button>

  <span className="text-xl font-semibold">
    {currentPage} / {totalPages}
  </span>

  <button
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage(currentPage + 1)}
    className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
  >
    Next
  </button>

</div>

  </div>
);
};

export default Dashboard;