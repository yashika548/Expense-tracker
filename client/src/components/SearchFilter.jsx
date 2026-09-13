function SearchFilter({
  search,
  setSearch,
  filterCategory,
  setFilterCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  setSortBy,
}) {
  const inputClass =
    "w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-indigo-500 bg-white border-gray-300";

  return (
    <div className="space-y-4">

      {/* SEARCH */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>

        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} pl-11`}
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-lg"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* SORT */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Sort By
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={inputClass}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="high">Highest Amount</option>
            <option value="low">Lowest Amount</option>
            <option value="az">Title A-Z</option>
            <option value="za">Title Z-A</option>
          </select>
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Category
          </label>

          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value)
            }
            className={inputClass}
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Salary">Salary</option>
            <option value="Bills">Bills</option>
          </select>
        </div>

        {/* START DATE */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            From
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className={inputClass}
          />
        </div>

        {/* END DATE */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            To
          </label>

          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            className={inputClass}
          />
        </div>

      </div>

      {/* ACTIVE FILTER SUMMARY */}
      {(search ||
        filterCategory !== "All" ||
        startDate ||
        endDate) && (
        <div className="flex flex-wrap gap-2 pt-1">

          {search && (
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
              Search: {search}
            </span>
          )}

          {filterCategory !== "All" && (
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
              Category: {filterCategory}
            </span>
          )}

          {startDate && (
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              From: {startDate}
            </span>
          )}

          {endDate && (
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              To: {endDate}
            </span>
          )}

        </div>
      )}

    </div>
  );
}

export default SearchFilter;