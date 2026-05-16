
import React from 'react';

function PieChart({ data, size = 140 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="w-full h-full rounded-full border-4 border-white/10 flex items-center justify-center">
          <span className="text-gray-500 text-xs">No data</span>
        </div>
      </div>
    );
  }

  const radius = size / 2;
  const innerRadius = radius * 0.55;
  let cumulative = 0;

  const slices = data.filter(d => d.value > 0).map((d) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 360;
    return { ...d, startAngle, endAngle };
  });

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  };

  const describeArc = (cx, cy, outerR, innerR, startAngle, endAngle) => {
    if (endAngle - startAngle >= 359.99) {
      const mid = startAngle + 180;
      return describeArc(cx, cy, outerR, innerR, startAngle, mid) + ' ' +
             describeArc(cx, cy, outerR, innerR, mid, endAngle);
    }
    const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      'Z'
    ].join(' ');
  };

  return (
    <div className="animate-pieAppear">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, i) => (
          <path
            key={i}
            d={describeArc(radius, radius, radius - 2, innerRadius, slice.startAngle, slice.endAngle)}
            fill={slice.color}
            className="transition-all duration-500 hover:opacity-80"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            <title>{slice.label}: {slice.value}</title>
          </path>
        ))}
        <text x={radius} y={radius - 6} textAnchor="middle" className="fill-white text-lg font-bold">{total}</text>
        <text x={radius} y={radius + 10} textAnchor="middle" className="fill-gray-400 text-[10px]">Total</text>
      </svg>
    </div>
  );
}

export default PieChart;
