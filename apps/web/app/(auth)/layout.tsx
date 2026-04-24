export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">{children}</div>;
}
