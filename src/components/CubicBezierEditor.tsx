import React, { useState, useRef } from 'react';
import type { MouseEvent } from 'react';

interface Point {
  x: number;
  y: number;
}

interface CubicBezierEditorProps {
  p1: Point;
  p2: Point;
  onChange: (p1: Point, p2: Point) => void;
  size?: number;
}

const CubicBezierEditor: React.FC<CubicBezierEditorProps> = ({
  p1,
  p2,
  onChange,
  size = 150,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingPoint, setDraggingPoint] = useState<'p1' | 'p2' | null>(null);

  const getPointCoords = (e: MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / size;
    let y = (e.clientY - rect.top) / size;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    return { x, y };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingPoint) return;
    const { x, y } = getPointCoords(e);
    if (draggingPoint === 'p1') {
      onChange({ x, y }, p2);
    } else {
      onChange(p1, { x, y });
    }
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
  };

  const curvePath = `M 0,${size} C ${p1.x * size},${p1.y * size} ${p2.x * size},${p2.y * size} ${size},0`;

  return (
    <div className="bezier-editor-wrapper">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <linearGradient id="accent-gradient-svg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: '#00f5d4'}} />
            <stop offset="100%" style={{stopColor: '#9b5de5'}} />
          </linearGradient>
        </defs>
        <rect width={size} height={size} className="editor-bg" />
        <path d={curvePath} className="bezier-curve" />
        <line x1={0} y1={size} x2={p1.x * size} y2={p1.y * size} className="control-line" />
        <line x1={size} y1={0} x2={p2.x * size} y2={p2.y * size} className="control-line" />
        <circle
          cx={p1.x * size}
          cy={p1.y * size}
          r="5"
          className="control-point"
          onMouseDown={() => setDraggingPoint('p1')}
        />
        <circle
          cx={p2.x * size}
          cy={p2.y * size}
          r="5"
          className="control-point"
          onMouseDown={() => setDraggingPoint('p2')}
        />
      </svg>
      <div className="bezier-values">
        cubic-bezier({p1.x.toFixed(2)}, {p1.y.toFixed(2)}, {p2.x.toFixed(2)}, {p2.y.toFixed(2)})
      </div>
    </div>
  );
};

export default CubicBezierEditor;