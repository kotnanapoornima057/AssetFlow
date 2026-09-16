function PageContent({ children }) {
  return (
    <div className="max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}

export default PageContent;