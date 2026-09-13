import { useEffect, useState } from "react";

function AddTransaction({
  addTransaction,
  updateTransaction,
  editId,
  editData,
  darkMode,
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || "");
      setAmount(editData.amount ?? "");
      setCategory(editData.category || "");
      setType(editData.type || "expense");
      setErrors({});
    }
  }, [editData]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setType("expense");
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    const trimmedTitle = title.trim();
    const trimmedCategory = category.trim();
    const numericAmount = Number(amount);

    if (!trimmedTitle) {
      newErrors.title = "Title is required";
    } else if (trimmedTitle.length > 100) {
      newErrors.title = "Title must be under 100 characters";
    }

    if (amount === "") {
      newErrors.amount = "Amount is required";
    } else if (!Number.isFinite(numericAmount)) {
      newErrors.amount = "Enter a valid amount";
    } else if (numericAmount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!trimmedCategory) {
      newErrors.category = "Category is required";
    } else if (trimmedCategory.length > 50) {
      newErrors.category = "Category must be under 50 characters";
    }

    if (!["income", "expense"].includes(type)) {
      newErrors.type = "Select a valid transaction type";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const transaction = {
      title: title.trim(),
      amount: Number(amount),
      category: category.trim(),
      type,
    };

    try {
      if (editId) {
        await updateTransaction(editId, transaction);
      } else {
        await addTransaction(transaction);
      }

      resetForm();
    } catch (error) {
      // Parent already handles API errors/toasts.
      console.error("Transaction form error:", error);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-indigo-500 ${
    darkMode
      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  return (
    <div
      className={`rounded-2xl ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {editId
              ? "Edit Transaction"
              : "Add Transaction"}
          </h2>

          <p className="text-sm opacity-70 mt-1">
            {editId
              ? "Update the details of your transaction."
              : "Record your income or expense."}
          </p>
        </div>

        {/* TYPE TOGGLE */}
        <div
          className={`flex rounded-xl p-1 ${
            darkMode
              ? "bg-gray-800"
              : "bg-gray-100"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setErrors((prev) => ({
                ...prev,
                type: "",
              }));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              type === "expense"
                ? "bg-red-500 text-white shadow"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Expense
          </button>

          <button
            type="button"
            onClick={() => {
              setType("income");
              setErrors((prev) => ({
                ...prev,
                type: "",
              }));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              type === "income"
                ? "bg-green-500 text-white shadow"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TITLE */}
        <div>
          <label className="block font-medium mb-2">
            Title
          </label>

          <input
            type="text"
            value={title}
            maxLength={100}
            placeholder="e.g. Grocery shopping"
            className={inputClass}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({
                ...prev,
                title: "",
              }));
            }}
          />

          <div className="flex justify-between mt-1">
            {errors.title ? (
              <p className="text-sm text-red-500">
                {errors.title}
              </p>
            ) : (
              <span />
            )}

            <span className="text-xs opacity-50">
              {title.length}/100
            </span>
          </div>
        </div>

        {/* AMOUNT */}
        <div>
          <label className="block font-medium mb-2">
            Amount
          </label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold opacity-60">
              ₹
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              placeholder="0.00"
              className={`${inputClass} pl-9`}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors((prev) => ({
                  ...prev,
                  amount: "",
                }));
              }}
            />
          </div>

          {errors.amount && (
            <p className="text-sm text-red-500 mt-1">
              {errors.amount}
            </p>
          )}
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block font-medium mb-2">
            Category
          </label>

          <input
            type="text"
            value={category}
            maxLength={50}
            placeholder="e.g. Food, Salary, Travel"
            className={inputClass}
            onChange={(e) => {
              setCategory(e.target.value);
              setErrors((prev) => ({
                ...prev,
                category: "",
              }));
            }}
          />

          <div className="flex justify-between mt-1">
            {errors.category ? (
              <p className="text-sm text-red-500">
                {errors.category}
              </p>
            ) : (
              <span />
            )}

            <span className="text-xs opacity-50">
              {category.length}/50
            </span>
          </div>
        </div>

        {/* TYPE INFO */}
        <div>
          <label className="block font-medium mb-2">
            Transaction Type
          </label>

          <div
            className={`rounded-xl p-4 border ${
              type === "income"
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-red-400 bg-red-50 text-red-700"
            }`}
          >
            <div className="font-semibold">
              {type === "income"
                ? "💰 Income"
                : "💸 Expense"}
            </div>

            <p className="text-sm mt-1 opacity-80">
              {type === "income"
                ? "Money received or earned."
                : "Money spent or paid."}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-7">
        {editId && (
          <button
            type="button"
            onClick={handleCancel}
            className={`px-5 py-3 rounded-xl font-semibold transition ${
              darkMode
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className={`px-6 py-3 rounded-xl text-white font-semibold shadow-md transition hover:-translate-y-0.5 ${
            type === "income"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {editId
            ? "Update Transaction"
            : `Add ${type === "income" ? "Income" : "Expense"}`}
        </button>
      </div>
    </div>
  );
}

export default AddTransaction;