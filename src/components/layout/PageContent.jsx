export default function PageContent({ title, children }) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        </div>
      )}
      {children}
    </div>
  );
}

