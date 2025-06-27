'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TraceInput from '@/components/TraceInput';
import GlobeVisualization from '@/components/GlobeVisualization';
import Legend from '@/components/Legend';
import { useTraceroute } from '@/hooks/useTraceroute';

export default function HomePage() {
  const [target, setTarget] = useState('');
  
  const {
    tracerouteData,
    isLoading,
    error,
    currentHop,
    globePoints,
    globeArcs,
    startTraceroute,
    nextHop,
    clearData,
    stopTraceroute,
  } = useTraceroute();

  const handleStart = (targetInput: string) => {
    startTraceroute(targetInput);
  };

  const handleClear = () => {
    clearData();
    setTarget('');
  };

  return (
    <div className="min-h-screen bg-black text-neon-green">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-neon-green p-6"
      >
        <div className="container mx-auto">
          <h1 className="text-4xl font-mono neon-glow text-center">
            TRACEROUTE GLOBE
          </h1>
          <p className="text-center font-mono text-neon-green-dim mt-2">
            Real-time network path visualization on a 3D globe
          </p>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <TraceInput
              onStart={handleStart}
              onStop={stopTraceroute}
              onClear={handleClear}
              onNextHop={nextHop}
              isRunning={isLoading}
              target={target}
              setTarget={setTarget}
              currentHop={currentHop}
              totalHops={tracerouteData?.hops.length || 0}
            />

            <Legend
              currentHop={currentHop}
              totalHops={tracerouteData?.hops.length || 0}
            />

            {/* Status Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black border border-red-500 p-4 rounded-lg"
              >
                <h3 className="text-red-500 font-mono mb-2">ERROR</h3>
                <p className="text-red-400 font-mono text-sm">{error}</p>
              </motion.div>
            )}

            {tracerouteData && tracerouteData.hops.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black border border-neon-green p-4 rounded-lg neon-border"
              >
                <h3 className="text-lg font-mono neon-glow mb-3">TRACE RESULTS</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tracerouteData.hops.slice(0, currentHop).map((hop) => (
                    <div
                      key={hop.hopNumber}
                      className="font-mono text-xs p-2 border border-neon-green-dim rounded"
                    >
                      <div className="flex justify-between">
                        <span>#{hop.hopNumber}</span>
                        <span>{hop.latency[0]?.toFixed(1)}ms</span>
                      </div>
                      <div className="text-neon-green-dim">{hop.ip}</div>
                      {hop.location && (
                        <div className="text-neon-green-dim">
                          {hop.location.city}, {hop.location.country}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel - Globe */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black border border-neon-green rounded-lg neon-border overflow-hidden"
              style={{ height: '700px' }}
            >
              <GlobeVisualization
                points={globePoints}
                arcs={globeArcs}
                currentHop={currentHop}
              />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-t border-neon-green p-6 mt-12"
      >
        <div className="container mx-auto text-center">
          <p className="font-mono text-neon-green-dim text-sm">
            SYSTEM READY // NETWORK TRACING ACTIVE // CYBERSEC PROTOCOLS ENGAGED
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
