import { Header } from '@/components/Header/Header';
import { Board } from '@/components/Board/Board';
import { Legend } from '@/components/Legend/Legend';

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden">
      <Header />
      <Legend />
      <main className="flex-1 overflow-auto">
        <Board />
      </main>
    </div>
  );
}
