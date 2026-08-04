function TransactionList({ transactions, deleteTransaction, editTransaction, darkMode }) {

  return (

    <div className={`p-5 rounded-xl shadow-lg mt-5 ${
    darkMode ? "bg-gray-800 text-white" : "bg-white"
  }`}>

      <h2 className="text-2xl font-bold mb-5">

        Transactions

      </h2>

      {

        transactions.length===0 ?

        <p>No Transactions Found</p>

        :

        transactions.map((item)=>(

          <div
          key={item._id}
          className="flex justify-between items-center border-b py-4"
          >

            <div>

              <h3 className="font-bold">

                {item.title}

              </h3>

              <p>

                ₹ {item.amount}

              </p>

              <p>

                {item.category}

              </p>

            </div>

            <div className="flex gap-3">

<button
onClick={() => editTransaction(item)}
className="bg-yellow-500 text-white px-4 py-2 rounded"
>
Edit
</button>

<button
onClick={() => deleteTransaction(item._id)}
className="bg-red-500 text-white px-4 py-2 rounded"
>
Delete
</button>

</div>
          </div>

        ))

      }

    </div>

  );

}

export default TransactionList;