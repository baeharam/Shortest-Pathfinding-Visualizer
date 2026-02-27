import { Header } from '@/components/Header/Header';
import { Board } from '@/components/Board/Board';
import { Legend } from '@/components/Legend/Legend';

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-[#080818] text-white overflow-hidden">
      <Header />
      <Legend />
      <main className="flex-1 overflow-hidden">
        <Board />
      </main>
    </div>
  );
}
