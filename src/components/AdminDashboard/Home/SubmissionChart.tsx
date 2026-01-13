import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { DailySubmissions } from "~/types/dashboard/stats";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SubmissionChart({ data, timeRange }: { data: DailySubmissions[], timeRange: '24h' | '7d' | '30d'}) {
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date);
      if (timeRange === '24h') {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }
    }),
    datasets: [
      {
        label: 'Submissions',
        data: data.map(item => item.submissions),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Accepted',
        data: data.map(item => item.accepted),
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options}/>
    </div>
  );
}
