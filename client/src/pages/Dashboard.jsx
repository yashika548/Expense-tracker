import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

import api from "../services/api";

import Navbar from "../components/Navbar";
import SummaryCards from "../components/SummaryCards";
import AddTransaction from "../components/AddTransaction";
import TransactionList from "../components/TransactionList";
import SearchFilter from "../components/SearchFilter";
import ExpenseChart from "../components/ExpenseChart";
import MonthlyChart from "../components/MonthlyChart";

function Dashboard() {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================

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
  const [actionLoading, setActionLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  const [budget, setBudget] = useState(0);

  const transactionsPerPage = 5;

  // =========================
  // DARK MODE
  // =========================

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // =========================
  // FETCH SUMMARY
  // =========================

  const fetchSummary = async () => {
  try {
    const [summaryResponse, profileResponse] =
      await Promise.all([
        api.get("/transactions/summary"),
        api.get("/user/profile"),
      ]);

    setIncome(summaryResponse.data.totalIncome || 0);
    setExpense(summaryResponse.data.totalExpense || 0);
    setBalance(summaryResponse.data.balance || 0);

    setBudget(profileResponse.data.user?.budget || 0);
  } catch (error) {
    console.error("Fetch dashboard data error:", error);
  }
};

  // =========================
  // FETCH TRANSACTIONS
  // =========================

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);

      const response = await api.get("/transactions", {
        params: {
          page,
          limit: transactionsPerPage,
          search: search.trim(),
          category: filterCategory,
        },
      });

      const data = response.data;

      setTransactions(data.transactions || []);

      setCurrentPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalTransactions(data.pagination?.total || 0);

      await fetchSummary();
    } catch (error) {
      console.error("Fetch transactions error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load transactions"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL / SEARCH FETCH
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filterCategory]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.info("Logged out successfully");

    navigate("/");
  };

  // =========================
  // ADD TRANSACTION
  // =========================

  const addTransaction = async (transactionData) => {
    try {
      setActionLoading(true);

      await api.post("/transactions", transactionData);

      toast.success("Transaction added successfully");

      await fetchTransactions(1);
    } catch (error) {
      console.error("Add transaction error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to add transaction"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // EDIT TRANSACTION
  // =========================

  const editTransaction = (transaction) => {
    setEditId(transaction._id);
    setEditData(transaction);

    window.scrollTo({
      top: document.body.scrollHeight / 2,
      behavior: "smooth",
    });
  };

  const updateTransaction = async (id, data) => {
    try {
      setActionLoading(true);

      await api.put(`/transactions/${id}`, data);

      toast.success("Transaction updated successfully");

      setEditId(null);
      setEditData(null);

      await fetchTransactions(currentPage);
    } catch (error) {
      console.error("Update transaction error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update transaction"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // DELETE CONFIRMATION
  // =========================

  const requestDelete = (id) => {
    const transaction = transactions.find(
      (item) => item._id === id
    );

    setDeleteId(id);
    setDeleteTitle(transaction?.title || "this transaction");
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteTitle("");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setActionLoading(true);

      await api.delete(`/transactions/${deleteId}`);

      toast.success("Transaction deleted successfully");

      const nextPage =
        currentPage > 1 && transactions.length === 1
          ? currentPage - 1
          : currentPage;

      cancelDelete();

      await fetchTransactions(nextPage);
    } catch (error) {
      console.error("Delete transaction error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete transaction"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // DATE FILTER
  // =========================

  const filteredTransactions = transactions.filter((item) => {
    const itemDate = new Date(item.date);

    const matchStartDate =
      !startDate ||
      itemDate >= new Date(`${startDate}T00:00:00`);

    const matchEndDate =
      !endDate ||
      itemDate <= new Date(`${endDate}T23:59:59.999`);

    return matchStartDate && matchEndDate;
  });

  // =========================
  // SORT
  // =========================

  const sortedTransactions = [...filteredTransactions];

  switch (sortBy) {
    case "latest":
      sortedTransactions.sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      );
      break;

    case "oldest":
      sortedTransactions.sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date)
      );
      break;

    case "high":
      sortedTransactions.sort(
        (a, b) =>
          Number(b.amount) - Number(a.amount)
      );
      break;

    case "low":
      sortedTransactions.sort(
        (a, b) =>
          Number(a.amount) - Number(b.amount)
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

  const currentTransactions = sortedTransactions;

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setSearch("");
    setFilterCategory("All");
    setStartDate("");
    setEndDate("");
    setSortBy("latest");

    toast.info("Filters cleared");
  };

  const hasFilters =
    search ||
    filterCategory !== "All" ||
    startDate ||
    endDate ||
    sortBy !== "latest";

  // =========================
  // BUDGET
  // =========================

  const saveBudget = async () => {
  if (budget < 0) {
    toast.error("Budget cannot be negative");
    return;
  }

  try {
    setActionLoading(true);

    const response = await api.put("/user/budget", {
      budget,
    });

    setBudget(response.data.budget || 0);

    toast.success("Budget saved successfully");
  } catch (error) {
    console.error("Save budget error:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to save budget"
    );
  } finally {
    setActionLoading(false);
  }
};

  const budgetPercentage =
    budget > 0
      ? Math.min((expense / budget) * 100, 100)
      : 0;

  const budgetExceeded =
    budget > 0 && expense > budget;

  // =========================
  // EXPORT CSV
  // =========================

  const exportCSV = () => {
    if (transactions.length === 0) {
      toast.info("No transactions found");
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

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, "transactions.csv");

    toast.success("CSV exported successfully");
  };

  // =========================
  // PDF
  // =========================

  const downloadPDF = () => {
    if (transactions.length === 0) {
      toast.info("No transactions found");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Expense Tracker Report", 15, 20);

    doc.setFontSize(13);

    doc.text(`Income : ₹${income}`, 15, 40);
    doc.text(`Expense : ₹${expense}`, 15, 50);
    doc.text(`Balance : ₹${balance}`, 15, 60);

    autoTable(doc, {
      startY: 75,
      head: [
        ["Title", "Category", "Type", "Amount"],
      ],
      body: transactions.map((item) => [
        item.title,
        item.category,
        item.type,
        `₹${item.amount}`,
      ]),
    });

    doc.save("Expense_Report.pdf");

    toast.success("PDF downloaded successfully");
  };

  // =========================
  // LOADING SKELETON
  // =========================

  const LoadingSkeleton = () => (
    <div className="grid gap-4 mt-6">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className={`animate-pulse rounded-xl p-6 ${
            darkMode
              ? "bg-gray-800"
              : "bg-white"
          }`}
        >
          <div
            className={`h-4 w-32 rounded ${
              darkMode
                ? "bg-gray-700"
                : "bg-gray-200"
            }`}
          />

          <div
            className={`h-8 w-48 rounded mt-4 ${
              darkMode
                ? "bg-gray-700"
                : "bg-gray-200"
            }`}
          />
        </div>
      ))}
    </div>
  );

  // =========================
  // MAIN UI
  // =========================

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gray-950 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">

        {/* =========================
            NAVBAR
        ========================= */}

        <Navbar handleLogout={handleLogout} />

        {/* =========================
            TOP ACTION BAR
        ========================= */}

        <div className="flex flex-wrap items-center gap-3 mt-6">

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:scale-105 transition-transform shadow-md"
          >
            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:scale-105 transition-transform shadow-md"
          >
            📊 Export CSV
          </button>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:scale-105 transition-transform shadow-md"
          >
            📄 Download PDF
          </button>

        </div>

        {/* =========================
            SUMMARY
        ========================= */}

        <div className="mt-6 transition-all duration-300">
          <SummaryCards
            balance={balance}
            income={income}
            expense={expense}
            darkMode={darkMode}
          />
        </div>

        {/* =========================
            QUICK STATS
        ========================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

          <div
            className={`rounded-xl p-5 shadow-md transition-all duration-300 hover:-translate-y-1 ${
              darkMode
                ? "bg-gray-900"
                : "bg-white"
            }`}
          >
            <p className="text-sm opacity-70">
              Total Transactions
            </p>

            <h3 className="text-2xl font-bold mt-2">
              {totalTransactions}
            </h3>
          </div>

          <div
            className={`rounded-xl p-5 shadow-md transition-all duration-300 hover:-translate-y-1 ${
              darkMode
                ? "bg-gray-900"
                : "bg-white"
            }`}
          >
            <p className="text-sm opacity-70">
              Average Transaction
            </p>

            <h3 className="text-2xl font-bold mt-2">
              ₹
              {totalTransactions > 0
                ? Math.round(
                    (income + expense) /
                      totalTransactions
                  )
                : 0}
            </h3>
          </div>

          <div
            className={`rounded-xl p-5 shadow-md transition-all duration-300 hover:-translate-y-1 ${
              darkMode
                ? "bg-gray-900"
                : "bg-white"
            }`}
          >
            <p className="text-sm opacity-70">
              Current Balance
            </p>

            <h3 className="text-2xl font-bold mt-2">
              ₹{balance}
            </h3>
          </div>

        </div>

        {/* =========================
            BUDGET
        ========================= */}

        <div
          className={`mt-6 rounded-2xl p-6 shadow-lg ${
            darkMode
              ? "bg-gray-900"
              : "bg-white"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>
              <h2 className="text-xl font-bold">
                Monthly Budget
              </h2>

              <p className="text-sm opacity-70 mt-1">
                Track your spending against your monthly limit.
              </p>
            </div>

            {budget > 0 && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  budgetExceeded
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {budgetExceeded
                  ? "Over Budget"
                  : "Within Budget"}
              </div>
            )}

          </div>

          <div className="flex flex-col md:flex-row gap-3 mt-5">

            <input
              type="number"
              min="0"
              placeholder="Enter monthly budget"
              value={budget || ""}
              onChange={(e) =>
                setBudget(
                  Math.max(
                    Number(e.target.value) || 0,
                    0
                  )
                )
              }
              className={`flex-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              }`}
            />

            <button
  onClick={saveBudget}
  disabled={actionLoading}
  className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
>
  {actionLoading ? "Saving..." : "Save Budget"}
</button>

          </div>

          {budget > 0 && (
            <div className="mt-6">

              <div className="flex justify-between text-sm mb-2">
                <span>
                  ₹{expense} spent
                </span>

                <span>
                  ₹{budget} budget
                </span>
              </div>

              <div
                className={`w-full h-4 rounded-full overflow-hidden ${
                  darkMode
                    ? "bg-gray-700"
                    : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    budgetExceeded
                      ? "bg-red-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${budgetPercentage}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-sm font-medium">
                {Math.round(budgetPercentage)}% of budget used
              </p>

              {budgetExceeded && (
                <div className="mt-4 rounded-lg border border-red-400 bg-red-50 text-red-700 p-4">
                  ⚠️ Budget exceeded by{" "}
                  <strong>
                    ₹{expense - budget}
                  </strong>
                </div>
              )}

            </div>
          )}
        </div>

        {/* =========================
            CHARTS
        ========================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          <div
            className={`rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 ${
              darkMode
                ? "bg-gray-900"
                : "bg-white"
            }`}
          >
            <ExpenseChart
              income={income}
              expense={expense}
              darkMode={darkMode}
            />
          </div>

          <div
            className={`rounded-2xl p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 ${
              darkMode
                ? "bg-gray-900"
                : "bg-white"
            }`}
          >
            <MonthlyChart
              transactions={transactions}
               darkMode={darkMode}
            />
          </div>

        </div>

        {/* =========================
            SEARCH / FILTER
        ========================= */}

        <div
          className={`mt-6 rounded-2xl p-5 shadow-lg ${
            darkMode
              ? "bg-gray-900"
              : "bg-white"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">

            <div>
              <h2 className="text-xl font-bold">
                Transactions
              </h2>

              <p className="text-sm opacity-70">
                Search, filter and manage your transactions.
              </p>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Clear Filters
              </button>
            )}

          </div>

          <SearchFilter
  search={search}
  setSearch={setSearch}
  filterCategory={filterCategory}
  setFilterCategory={setFilterCategory}
  startDate={startDate}
  setStartDate={setStartDate}
  endDate={endDate}
  setEndDate={setEndDate}
  sortBy={sortBy}
  setSortBy={setSortBy}
/>



          {/* SORT */}

         
        </div>

        {/* =========================
            ADD / EDIT
        ========================= */}

        <div
          className={`mt-6 rounded-2xl p-5 shadow-lg ${
            darkMode
              ? "bg-gray-900"
              : "bg-white"
          }`}
        >
          <AddTransaction
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            editId={editId}
            editData={editData}
            darkMode={darkMode}
          />

          {actionLoading && (
            <div className="text-sm text-indigo-500 font-medium mt-3">
              Saving changes...
            </div>
          )}
        </div>

        {/* =========================
            TRANSACTIONS
        ========================= */}

        <div className="mt-6">

          {loading ? (
            <LoadingSkeleton />
          ) : currentTransactions.length === 0 ? (
            <div
              className={`rounded-2xl p-10 text-center shadow-lg ${
                darkMode
                  ? "bg-gray-900"
                  : "bg-white"
              }`}
            >
              <div className="text-5xl mb-4">
                💸
              </div>

              <h3 className="text-xl font-bold">
                No transactions found
              </h3>

              <p className="opacity-70 mt-2">
                Try changing your filters or add your first transaction.
              </p>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-5 px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <TransactionList
              transactions={currentTransactions}
              deleteTransaction={requestDelete}
              editTransaction={editTransaction}
              darkMode={darkMode}
            />
          )}

        </div>

        {/* =========================
            PAGINATION
        ========================= */}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">

            <button
              onClick={() =>
                fetchTransactions(
                  currentPage - 1
                )
              }
              disabled={
                currentPage === 1 ||
                loading
              }
              className="px-5 py-2 rounded-lg bg-gray-300 text-gray-800 disabled:opacity-40 hover:bg-gray-400 transition"
            >
              ← Previous
            </button>

            <div className="px-4 py-2 rounded-lg font-semibold">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() =>
                fetchTransactions(
                  currentPage + 1
                )
              }
              disabled={
                currentPage >= totalPages ||
                loading
              }
              className="px-5 py-2 rounded-lg bg-gray-300 text-gray-800 disabled:opacity-40 hover:bg-gray-400 transition"
            >
              Next →
            </button>

          </div>
        )}

      </div>

      {/* =========================
          DELETE MODAL
      ========================= */}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">

          <div
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
              darkMode
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-900"
            }`}
          >

            <div className="text-4xl mb-4">
              🗑️
            </div>

            <h2 className="text-2xl font-bold">
              Delete Transaction?
            </h2>

            <p className="mt-3 opacity-70">
              Are you sure you want to delete{" "}
              <strong>{deleteTitle}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={cancelDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;