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
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-5">

  <input
    type="text"
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border p-3 rounded-lg"
  />


  <select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  className="border p-3 rounded-lg"
>
  <option value="latest">Latest</option>
  <option value="oldest">Oldest</option>
  <option value="high">Highest Amount</option>
  <option value="low">Lowest Amount</option>
  <option value="az">Title A-Z</option>
  <option value="za">Title Z-A</option>
</select>



  <select
    value={filterCategory}
    onChange={(e) => setFilterCategory(e.target.value)}
    className="border p-3 rounded-lg"
  >
    <option value="All">All</option>
    <option value="Food">Food</option>
    <option value="Travel">Travel</option>
    <option value="Shopping">Shopping</option>
    <option value="Salary">Salary</option>
    <option value="Bills">Bills</option>
  </select>

  

  <input
    type="date"
    value={startDate}
    onChange={(e) => setStartDate(e.target.value)}
    className="border p-3 rounded-lg"
  />

  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    className="border p-3 rounded-lg"
  />

</div>
  );
}

export default SearchFilter;