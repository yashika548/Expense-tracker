import { useState, useEffect } from "react";

function AddTransaction({
  addTransaction,
  updateTransaction,
  editId,
  editData,
  darkMode
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");

  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setAmount(editData.amount);
      setCategory(editData.category);
      setType(editData.type);
    }
  }, [editData]);

  const handleSubmit = () => {
    const transaction = {
      title,
      amount,
      category,
      type,
    };

    if (editId) {
      updateTransaction(editId, transaction);
    } else {
      addTransaction(transaction);
    }

    setTitle("");
    setAmount("");
    setCategory("");
    setType("expense");
  };

  return (
    <div  className={`p-5 rounded-xl shadow-lg mt-5 ${
    darkMode ? "bg-gray-800 text-white" : "bg-white"
  }`}>
      <h2 className="text-2xl font-bold mb-4">
        {editId ? "Update Transaction" : "Add Transaction"}
      </h2>

      <input
        className="border w-full p-2 rounded mb-3"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="border w-full p-2 rounded mb-3"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        className="border w-full p-2 rounded mb-3"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <select
        className="border w-full p-2 rounded mb-3"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {editId ? "Update Transaction" : "Add Transaction"}
      </button>
    </div>
  );
}

export default AddTransaction;