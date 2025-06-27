'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TraceInput from '@/components/TraceInput';
import GlobeVisualization from '@/components/GlobeVisualization';
import Legend from '@/components/Legend';
import NoSSR from '@/components/NoSSR';
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

  const handlePointClick = (point: any) => {
    console.log('Point clicked:', point);
    // You can add custom logic here, like showing detailed info
  };

  const handleArcClick = (arc: any) => {
    console.log('Arc clicked:', arc);
    // You can add custom logic here
  };

  return (
    <div className="min-h-screen bg-black text-neon-green relative">
      {/* Scan line effect */}
      <div className="scan-line"></div>
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-neon-green p-6"
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-xs font-mono text-neon-green-dim mb-2 opacity-75"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            [SYSTEM_INIT] Loading neural_network_tracer v2.1.4<span className="animate-terminal-cursor">_</span>
          </motion.div>
          <motion.h1 
            className="text-4xl font-mono neon-glow text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            ╔═══════════════════════════════════╗
          </motion.h1>
          <motion.h1 
            className="text-3xl font-mono neon-glow text-center py-1"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            ║    TRACEROUTE_GLOBE_v2.1.4       ║
          </motion.h1>
          <motion.h1 
            className="text-4xl font-mono neon-glow text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            ╚═══════════════════════════════════╝
          </motion.h1>
          <motion.p 
            className="text-center font-mono text-neon-green-dim mt-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
          >
            [NEURAL_NET] Real-time network topology visualization on 3D sphere
          </motion.p>
          <motion.div 
            className="text-center text-xs font-mono text-neon-green-dim mt-2 opacity-75"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              STATUS: ONLINE
            </motion.span>
            {" | "}
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              PROTOCOLS: ICMP,TCP
            </motion.span>
            {" | "}
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              SECURITY: ACTIVE
            </motion.span>
          </motion.div>
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
                <div className="text-xs font-mono text-red-400 mb-2 opacity-75">
                  root@traceroute:~$ tail -f /var/log/error.log
                </div>
                <h3 className="text-red-500 font-mono mb-2 neon-glow">[CRITICAL_ERROR]</h3>
                <div className="bg-red-500 bg-opacity-10 border-l-4 border-red-500 p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-mono text-xs">EXCEPTION_THROWN:</span>
                  </div>
                  <p className="text-red-400 font-mono text-sm break-all">{error}</p>
                </div>
                <div className="text-xs font-mono text-red-400 mt-2 opacity-75">
                  [RECOMMEND] Check network connectivity and target validity
                </div>
              </motion.div>
            )}

            {tracerouteData && tracerouteData.hops.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black border border-neon-green p-4 rounded-lg neon-border"
              >
                <div className="text-xs font-mono text-neon-green-dim mb-2 opacity-75">
                  root@traceroute:~$ cat /var/log/trace_output.log
                </div>
                <h3 className="text-lg font-mono neon-glow mb-3">TRACE_OUTPUT</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {tracerouteData.hops.slice(0, currentHop).map((hop, index) => (
                    <div
                      key={hop.hopNumber}
                      className="font-mono text-xs p-2 border border-neon-green-dim rounded bg-black hover:bg-neon-green hover:bg-opacity-5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-neon-green">[HOP_{hop.hopNumber.toString().padStart(2, '0')}]</span>
                          <span className="text-neon-green-dim">→</span>
                          <span className="text-neon-green">{hop.latency[0]?.toFixed(1)}ms</span>
                        </div>
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse-green"></div>
                      </div>
                      <div className="text-neon-green-dim text-xs">
                        IP: {hop.ip}
                      </div>
                      {hop.location && (
                        <div className="text-neon-green-dim text-xs">
                          GEO: {hop.location.city}, {hop.location.country}
                        </div>
                      )}
                      {hop.hostname && hop.hostname !== hop.ip && (
                        <div className="text-neon-green-dim text-xs">
                          HOST: {hop.hostname}
                        </div>
                      )}
                    </div>
                  ))}
                  {currentHop < tracerouteData.hops.length && (
                    <div className="font-mono text-xs p-2 border border-neon-green-dim border-opacity-30 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-neon-green-dim">[PENDING]</span>
                        <span className="animate-pulse">▓▓▓</span>
                        <span className="text-neon-green-dim">awaiting_next_hop...</span>
                      </div>
                    </div>
                  )}
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
              <NoSSR
                fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-neon-green font-mono animate-pulse">
                      Loading Globe...
                    </div>
                  </div>
                }
              >
                <GlobeVisualization
                  points={globePoints}
                  arcs={globeArcs}
                  currentHop={currentHop}
                  onPointClick={handlePointClick}
                  onArcClick={handleArcClick}
                />
              </NoSSR>
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
        <div className="container mx-auto">
          <div className="text-center font-mono text-xs text-neon-green-dim space-y-1">
            <div className="flex justify-center items-center space-x-8">
              <span>SYSTEM_STATUS: [OPERATIONAL]</span>
              <span>NETWORK_TRACE: [ACTIVE]</span>
              <span>SECURITY_LEVEL: [MAXIMUM]</span>
            </div>
            <div className="flex justify-center items-center space-x-8 mt-2">
              <span>UPTIME: [99.9%]</span>
              <span>PROTOCOLS: [ICMP/TCP/UDP]</span>
              <span>MODE: [REALTIME]</span>
            </div>
            <div className="border-t border-neon-green-dim border-opacity-30 pt-2 mt-3">
              <div className="animate-pulse-green">
                [CYBERSEC_PROTOCOLS_ENGAGED] ━ [NEURAL_NETWORK_ACTIVE] ━ [QUANTUM_ENCRYPTION_ENABLED]
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
