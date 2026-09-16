function PageContainer({ children }) {
  return (
    <div className="flex-1 md:ml-64 overflow-x-hidden min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {children}
    </div>
  );
}

export default PageContainer;