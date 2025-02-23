import Sidebar from "../components/Sidebar";

export default function HistoricLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Sidebar />
      <main className="pl-0">{children}</main>
    </div>
  );
}
