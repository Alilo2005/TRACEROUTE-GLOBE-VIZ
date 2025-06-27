'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GlobePoint, GlobeArc } from '@/types/traceroute';

// Dynamically import Globe component to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-neon-green font-mono animate-pulse">Loading Globe...</div>
    </div>
  ),
});

interface GlobeVisualizationProps {
  points: GlobePoint[];
  arcs: GlobeArc[];
  currentHop: number;
  onPointClick?: (point: GlobePoint) => void;
  onArcClick?: (arc: GlobeArc) => void;
}

export default function GlobeVisualization({
  points,
  arcs,
  currentHop,
  onPointClick,
  onArcClick,
}: GlobeVisualizationProps) {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isClient, setIsClient] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<GlobePoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<GlobePoint | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const updateDimensions = () => {
      const container = document.getElementById('globe-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isClient]);

  // Auto-rotation effect
  useEffect(() => {
    if (!globeRef.current || !isAutoRotating) return;

    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, [isAutoRotating, isClient]);

  // Focus on points when they're added
  useEffect(() => {
    if (globeRef.current && points.length > 0) {
      // Focus on the current hop or last point
      const targetPoint = points.find(p => p.hopNumber === currentHop) || points[points.length - 1];
      if (targetPoint) {
        globeRef.current.pointOfView({
          lat: targetPoint.lat,
          lng: targetPoint.lng,
          altitude: 1.5,
        }, 1500);
        
        // Stop auto-rotation when focusing
        setIsAutoRotating(false);
      }
    }
  }, [points, currentHop]);

  // Handle point interactions
  const handlePointClick = (point: any) => {
    setSelectedPoint(point);
    setIsAutoRotating(false);
    
    // Focus on clicked point
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: point.lat,
        lng: point.lng,
        altitude: 1.2,
      }, 1000);
    }
    
    onPointClick?.(point);
  };

  // Handle arc interactions
  const handleArcClick = (arc: any, event: MouseEvent) => {
    onArcClick?.(arc);
  };

  const handlePointHover = (point: any) => {
    setHoveredPoint(point);
  };

  const handleArcHover = (arc: any) => {
    // Add arc hover effects if needed
  };

  const getPointColor = (point: any) => {
    if (selectedPoint && selectedPoint.hopNumber === point.hopNumber) {
      return '#ffffff'; // Selected point - white
    }
    if (point.hopNumber === currentHop) {
      return '#00ff00'; // Current hop - bright green
    }
    if (point.hopNumber < currentHop) {
      return '#008000'; // Previous hops - dim green
    }
    return '#003300'; // Future hops - very dim green
  };

  const getPointSize = (point: any) => {
    if (selectedPoint && selectedPoint.hopNumber === point.hopNumber) {
      return 1.2; // Selected point - larger
    }
    if (hoveredPoint && hoveredPoint.hopNumber === point.hopNumber) {
      return 1.0; // Hovered point - slightly larger
    }
    if (point.hopNumber === currentHop) {
      return 0.8;
    }
    if (point.hopNumber < currentHop) {
      return 0.6;
    }
    return 0.4;
  };

  // Enhanced tooltip with more info and better styling
  const formatTooltip = (point: any) => {
    const avgLatency = point.latency.reduce((a: number, b: number) => a + b, 0) / point.latency.length;
    const isSelected = selectedPoint && selectedPoint.hopNumber === point.hopNumber;
    
    return `
      <div class="bg-black border ${isSelected ? 'border-white' : 'border-neon-green'} p-4 font-mono text-neon-green rounded-lg shadow-lg max-w-xs">
        <div class="text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-neon-green'}">
          [HOP_${point.hopNumber.toString().padStart(2, '0')}]
        </div>
        <div class="space-y-1 text-sm">
          <div><span class="text-neon-green-dim">IP:</span> ${point.ip}</div>
          ${point.hostname ? `<div><span class="text-neon-green-dim">Host:</span> ${point.hostname}</div>` : ''}
          ${point.city ? `<div><span class="text-neon-green-dim">GEO:</span> ${point.city}, ${point.country}</div>` : ''}
          <div><span class="text-neon-green-dim">LATENCY_AVG:</span> ${avgLatency.toFixed(1)}ms</div>
          <div><span class="text-neon-green-dim">LATENCY:</span> ${point.latency.join('ms, ')}ms</div>
          ${isSelected ? '<div class="text-white mt-2">[ACTIVE]</div>' : ''}
          <div class="text-xs text-neon-green-dim mt-2">Click to select • Double-click to focus</div>
        </div>
      </div>
    `;
  };

  return (
    <div id="globe-container" className="w-full h-full min-h-[600px] relative">
      {!isClient ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-neon-green font-mono animate-pulse">Initializing Globe...</div>
        </div>
      ) : (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          
          // Points configuration
          pointsData={points}
          pointLat={(d: any) => d.lat}
          pointLng={(d: any) => d.lng}
          pointColor={getPointColor}
          pointAltitude={0.01}
          pointRadius={getPointSize}
          pointLabel={formatTooltip}
          onPointClick={handlePointClick}
          onPointHover={handlePointHover}
          
          // Arcs configuration
          arcsData={arcs.slice(0, currentHop - 1)}
          arcStartLat={(d: any) => d.startLat}
          arcStartLng={(d: any) => d.startLng}
          arcEndLat={(d: any) => d.endLat}
          arcEndLng={(d: any) => d.endLng}
          arcColor={() => '#00ff00'}
          arcAltitude={0.3}
          arcStroke={2}
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={2000}
          
          // Atmosphere effects
          showAtmosphere={true}
          atmosphereColor="#00ff00"
          atmosphereAltitude={0.25}
          
          // Controls
          enablePointerInteraction={true}
        />
      )}
      
      {/* Interactive Controls Overlay */}
      {isClient && (
        <div className="absolute top-4 right-4 space-y-2">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="neon-button px-3 py-1 text-xs font-mono"
            title={isAutoRotating ? "Stop Rotation" : "Start Rotation"}
          >
            {isAutoRotating ? "[STOP]" : "[ROTATE]"}
          </button>
          
          {selectedPoint && (
            <button
              onClick={() => setSelectedPoint(null)}
              className="neon-button px-3 py-1 text-xs font-mono"
              title="Clear Selection"
            >
              [CLEAR]
            </button>
          )}
          
          {points.length > 0 && (
            <button
              onClick={() => {
                if (globeRef.current) {
                  globeRef.current.pointOfView({ altitude: 2.5 }, 1000);
                  setIsAutoRotating(true);
                }
              }}
              className="neon-button px-3 py-1 text-xs font-mono"
              title="Reset View"
            >
              [RESET_VIEW]
            </button>
          )}
        </div>
      )}

      {/* Selected Point Info Panel */}
      {isClient && selectedPoint && (
        <div className="absolute bottom-4 left-4 bg-black border border-white p-4 rounded-lg max-w-xs">
          <h4 className="text-white font-mono font-bold mb-2">[SELECTED_HOP]</h4>
          <div className="text-neon-green font-mono text-sm space-y-1">
            <div>Hop #{selectedPoint.hopNumber}</div>
            <div>IP: {selectedPoint.ip}</div>
            {selectedPoint.city && (
              <div>LOC: {selectedPoint.city}, {selectedPoint.country}</div>
            )}
            <div>LATENCY_AVG: {(selectedPoint.latency.reduce((a, b) => a + b, 0) / selectedPoint.latency.length).toFixed(1)}ms</div>
          </div>
        </div>
      )}
      
      {/* Globe loading/ready overlay */}
      {isClient && points.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-neon-green font-mono text-lg neon-glow mb-4">
            [GLOBE_READY] Awaiting traceroute initialization
          </div>
          <div className="text-neon-green-dim font-mono text-sm text-center">
            [CONTROLS] Mouse: rotate/zoom | Click: point details | Auto-rotation: available
          </div>
        </div>
      )}
    </div>
  );
}
