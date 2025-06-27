'use client';

import { motion } from 'framer-motion';

interface LegendProps {
  currentHop: number;
  totalHops: number;
}

export default function Legend({ currentHop, totalHops }: LegendProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black border border-neon-green p-4 rounded-lg neon-border relative overflow-hidden"
    >
      {/* Background matrix effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <motion.div
          className="text-xs text-neon-green"
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          01001001 01001101 01010000<br/>
          01001100 01000101 01001110<br/>
          01000111 01000101 01001110<br/>
        </motion.div>
      </div>
      
      <motion.div 
        className="text-xs font-mono text-neon-green-dim mb-3 opacity-75"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        root@traceroute:~$ ./legend --display=visual<span className="animate-terminal-cursor">_</span>
      </motion.div>
      
      <motion.h3 
        className="text-lg font-mono neon-glow mb-4"
        animate={{ 
          textShadow: [
            "0 0 5px #00ff00", 
            "0 0 15px #00ff00", 
            "0 0 5px #00ff00"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        VISUAL_REFERENCE
      </motion.h3>
      
      <div className="space-y-2 text-xs font-mono relative z-10">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div 
              className="w-3 h-3 bg-neon-green rounded-full"
              animate={{ 
                scale: [1, 1.3, 1],
                boxShadow: [
                  "0 0 5px #00ff00",
                  "0 0 15px #00ff00",
                  "0 0 5px #00ff00"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
            <span>ACTIVE_NODE</span>
          </div>
          <motion.span 
            className="text-neon-green-dim"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            [LIVE]
          </motion.span>
        </motion.div>
        
        <motion.div 
          className="flex items-center justify-between"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-neon-green-dim rounded-full animate-pulse"></div>
            <span>TRACED_NODE</span>
          </div>
          <span className="text-neon-green-dim">[DONE]</span>
        </motion.div>
        
        <motion.div 
          className="flex items-center justify-between"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div 
              className="w-6 h-0.5 bg-neon-green"
              animate={{ 
                scaleX: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
            <span>DATA_VECTOR</span>
          </div>
          <span className="text-neon-green-dim">[PATH]</span>
        </motion.div>
      </div>

      <div className="mt-4 pt-3 border-t border-neon-green-dim border-opacity-30">
        <div className="font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-neon-green-dim">EXEC_PROGRESS:</span>
            <span className="text-neon-green">{currentHop}/{totalHops}</span>
          </div>
          <div className="w-full bg-black border border-neon-green-dim h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-neon-green"
              initial={{ width: 0 }}
              animate={{ width: `${totalHops > 0 ? (currentHop / totalHops) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="text-neon-green-dim text-xs mt-1 opacity-75">
            [{Math.round(totalHops > 0 ? (currentHop / totalHops) * 100 : 0)}% COMPLETE]
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-neon-green-dim border-opacity-30">
        <div className="text-xs font-mono text-neon-green-dim space-y-1">
          <div className="flex items-center">
            <span className="text-neon-green mr-2">{'>'}</span>
            <span>HOVER: node_details</span>
          </div>
          <div className="flex items-center">
            <span className="text-neon-green mr-2">{'>'}</span>
            <span>DRAG: rotate_globe</span>
          </div>
          <div className="flex items-center">
            <span className="text-neon-green mr-2">{'>'}</span>
            <span>SCROLL: zoom_level</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
