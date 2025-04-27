import { useEffect, useRef } from 'react';

interface ChartProps {
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  color: string;
  prefix?: string;
}

const Chart = ({ data, xKey, yKey, color, prefix = '' }: ChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure data is an array and has at least one item
    if (!Array.isArray(data) || data.length === 0) {
      // Draw a message indicating no data
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Adjust for device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Set canvas size back to CSS size
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Margins
    const margin = {
      top: 20,
      right: 30,
      bottom: 40,
      left: 50
    };
    
    // Chart dimensions
    const chartWidth = rect.width - margin.left - margin.right;
    const chartHeight = rect.height - margin.top - margin.bottom;
    
    // Find min and max values
    const maxValue = Math.max(...data.map(d => d[yKey] || 0)) * 1.1 || 10; // 10% padding, default to 10 if all values are 0
    
    // Scale functions
    const xScale = (index: number) => margin.left + (index * (chartWidth / Math.max(1, data.length - 1)));
    const yScale = (value: number) => margin.top + chartHeight - ((value || 0) / maxValue) * chartHeight;
    
    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    // Draw horizontal grid lines
    const gridLines = 5;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
    
    for (let i = 0; i <= gridLines; i++) {
      const y = margin.top + (i * (chartHeight / gridLines));
      const value = maxValue - (i * (maxValue / gridLines));
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.1)';
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      
      ctx.fillText(`${prefix}${Math.round(value)}`, margin.left - 10, y);
    }
    
    // Draw x-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    data.forEach((d, i) => {
      if (d && d[xKey]) {
        const x = xScale(i);
        ctx.fillText(d[xKey], x, margin.top + chartHeight + 10);
      }
    });
    
    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    let hasDrawn = false;
    data.forEach((d, i) => {
      if (d && d[xKey] !== undefined && d[yKey] !== undefined) {
        const x = xScale(i);
        const y = yScale(d[yKey] || 0);
        
        if (!hasDrawn) {
          ctx.moveTo(x, y);
          hasDrawn = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    
    if (hasDrawn) {
      ctx.stroke();
      
      // Draw gradient area under line
      const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
      gradient.addColorStop(0, `${color}30`); // 30% opacity
      gradient.addColorStop(1, `${color}05`); // 5% opacity
      
      ctx.beginPath();
      ctx.fillStyle = gradient;
      
      hasDrawn = false;
      data.forEach((d, i) => {
        if (d && d[xKey] !== undefined && d[yKey] !== undefined) {
          const x = xScale(i);
          const y = yScale(d[yKey] || 0);
          
          if (!hasDrawn) {
            ctx.moveTo(x, y);
            hasDrawn = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      
      // Complete the area by extending to the bottom
      if (data.length > 0) {
        ctx.lineTo(xScale(data.length - 1), margin.top + chartHeight);
        ctx.lineTo(xScale(0), margin.top + chartHeight);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw data points
      data.forEach((d, i) => {
        if (d && d[xKey] !== undefined && d[yKey] !== undefined) {
          const x = xScale(i);
          const y = yScale(d[yKey] || 0);
          
          ctx.beginPath();
          ctx.fillStyle = '#fff';
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.beginPath();
          ctx.fillStyle = color;
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else {
      // No valid data points, show a message
      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
    }
  }, [data, xKey, yKey, color, prefix]);
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
};

export default Chart;