// ConfidenceNetwork.tsx
import ForceGraph2D from 'react-force-graph-2d';
import { useState, useRef, useEffect } from 'react';
import { COLORS } from "../../colors";
import './ConfidenceNetwork.scss';

interface ConfidenceFactor {
  factor: string;
  impact: number;
  confidence: number;
}

interface CustomNode {
  id: string;
  label: string;
  impact: number;
  confidence: number;
  size: number;
  color: string;
  x: number;
  y: number;
}

interface ConfidenceNetworkProps {
  factors?: ConfidenceFactor[];
  onNodeClick: (factor: string) => void;
}

const ConfidenceNetwork = ({ factors, onNodeClick }: ConfidenceNetworkProps) => {
  const [hoverNode, setHoverNode] = useState<CustomNode | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);

  if (!factors || factors.length === 0) {
    return (
      <div className="confidence-network-container">
        <div className="empty-state">
          <div className="empty-state__icon">🕸️</div>
          <div className="empty-state__text">No factors to visualize</div>
        </div>
      </div>
    );
  }

  const nodes: CustomNode[] = factors.map(factor => {
    const baseX = factor.impact * 200; 
    const baseY = (factor.confidence - 0.5) * 300; 

    const offsetX = Math.random() * 60 - 30; 
    const offsetY = Math.random() * 60 - 30;

    const size = 8 + Math.abs(factor.impact) * 12 + factor.confidence * 5;

    return {
      id: factor.factor,
      label: factor.factor,
      impact: factor.impact,
      confidence: factor.confidence,
      size,
      color: factor.impact > 0 ? COLORS.INCOME : COLORS.EXPENSE,
      x: baseX + offsetX,
      y: baseY + offsetY,
    };
  });

  const edges = [];
  for (let i = 0; i < factors.length; i++) {
    for (let j = i + 1; j < factors.length; j++) {
      edges.push({
        source: factors[i].factor,
        target: factors[j].factor,
      });
    }
  }

  useEffect(() => {
    if (hoverNode && tooltipRef.current && graphRef.current && hoverNode.x !== undefined && hoverNode.y !== undefined) {
      const coords = graphRef.current.screen2GraphCoords(hoverNode.x, hoverNode.y);
      tooltipRef.current.style.transform = `translate(${coords.x + 20}px, ${coords.y - 30}px)`;
    }
  }, [hoverNode]);

  return (
    <div className="confidence-network-container">
      <div className="network-legend">
        <div className="legend-title">Layout Meaning</div>
        <div className="legend-item">
          <span>← Negative Impact</span>
          <span>Positive Impact →</span>
        </div>
        <div className="legend-item">
          <span>Low Confidence ↓</span>
          <span>High Confidence ↑</span>
        </div>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={{ nodes, links: edges }}
        nodeRelSize={1}
        nodeCanvasObject={(node: CustomNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth + 8, fontSize + 4];

          ctx.fillStyle = node.color;
          ctx.globalAlpha = 0.8;
          ctx.fillRect(
            node.x! - bckgDimensions[0] / 2,
            node.y! - bckgDimensions[1] / 2,
            bckgDimensions[0],
            bckgDimensions[1]
          );

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.fillText(label, node.x!, node.y!);

          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, node.size, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();

          if (hoverNode?.id === node.id) {
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, node.size + 8, 0, 2 * Math.PI, false);
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }}
        onNodeHover={setHoverNode}
        onNodeClick={(node: CustomNode) => onNodeClick(node.id)}
        linkWidth={1}
        linkDirectionalParticles={0}
        linkColor={() => 'rgba(255,255,255,0.1)'}
        backgroundColor="transparent"
        width={800}
        height={400}
        cooldownTime={0}
        d3AlphaDecay={0}
        d3VelocityDecay={0}
      />

      {hoverNode && (
        <div
          ref={tooltipRef}
          className="network-tooltip"
        >
          <div><strong>{hoverNode.label}</strong></div>
          <div>📈 Impact: {hoverNode.impact > 0 ? '+' : ''}{hoverNode.impact.toFixed(2)}</div>
          <div>🎯 Confidence: {(hoverNode.confidence * 100).toFixed(0)}%</div>
        </div>
      )}
    </div>
  );
};

export default ConfidenceNetwork;
