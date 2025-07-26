import { employees } from "../data/employees";

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shift Planner</h1>
      {/* TODO: Build schedule table here */}
      <pre>{JSON.stringify(employees, null, 2)}</pre>
    </main>
  );
}
