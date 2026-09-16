function TableContainer({ children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

      <div className="overflow-x-auto">

        {children}

      </div>

    </div>
  );
}

export default TableContainer;