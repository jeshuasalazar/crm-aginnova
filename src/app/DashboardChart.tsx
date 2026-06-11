'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function DashboardChart() {
  const weeks = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'];
  const actual   = [820,854,891,935,980,920,1010,1050,1080,1140,1200,1240];
  const baseline = [750,760,770,780,790,800,810,820,830,840,850,860];
  const meta     = [900,910,920,930,940,950,960,970,980,990,1000,1010];

  const data = {
    labels: weeks,
    datasets:[
      { label:'Ventas reales (MXN k)', data:actual, borderColor:'#4A7BB5', backgroundColor:'rgba(74,123,181,.08)', fill:true, tension:0.4, pointRadius:3, pointBackgroundColor:'#4A7BB5', borderWidth:2.5 },
      { label:'Baseline', data:baseline, borderColor:'#b0bec5', borderDash:[5,4], fill:false, tension:0.4, pointRadius:0, borderWidth:1.5 },
      { label:'Meta', data:meta, borderColor:'#2E7D32', borderDash:[3,3], fill:false, tension:0.4, pointRadius:0, borderWidth:1.5 },
    ]
  };

  const options = {
    responsive:true, 
    maintainAspectRatio:false,
    plugins:{ 
      legend:{ position:'bottom' as const, labels:{ boxWidth:10, font:{ size:11 }, color:'#718096' } }, 
      tooltip:{ mode:'index' as const, intersect:false } 
    },
    scales:{
      x:{ grid:{ display:false }, ticks:{ color:'#b0bec5', font:{ size:10 } } },
      y:{ grid:{ color:'rgba(0,0,0,.04)' }, ticks:{ color:'#b0bec5', font:{ size:10 }, callback: (v: any) => '$'+(v)+'k' } }
    }
  };

  return <Line data={data} options={options} />
}
