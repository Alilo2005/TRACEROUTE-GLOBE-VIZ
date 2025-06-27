'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TraceInputProps {
  onStart: (target: string) => void;
  onStop: () => void;
  onClear: () => void;
  onNextHop: () => void;
  isRunning: boolean;
  target: string;
  setTarget: (target: string) => void;
  currentHop: number;
  totalHops: number;
}

export default function TraceInput({
  onStart,
  onStop,
  onClear,
  onNextHop,
  isRunning,
  target,
  setTarget,
  currentHop,
  totalHops,
}: TraceInputProps) {
  const [inputError, setInputError] = useState('');

  // Enhanced frontend validation with security checks
  const validateInput = (value: string): boolean => {
    // Security: Check input type and basic format
    if (!value || typeof value !== 'string') {
      setInputError('[SECURITY_ERROR] Invalid input type');
      return false;
    }

    const trimmedValue = value.trim().toLowerCase();

    // Security: Length checks
    if (trimmedValue.length === 0) {
      setInputError('[INPUT_ERROR] Target cannot be empty');
      return false;
    }

    if (trimmedValue.length < 3) {
      setInputError('[INPUT_ERROR] Target too short (minimum 3 characters)');
      return false;
    }

    if (trimmedValue.length > 253) {
      setInputError('[INPUT_ERROR] Target too long (maximum 253 characters)');
      return false;
    }

    // Security: Check for dangerous characters
    const dangerousChars = /[;&|`$(){}[\]\\<>'"]/;
    if (dangerousChars.test(value)) {
      setInputError('[SECURITY_ERROR] Invalid characters detected');
      return false;
    }

    // Security: Check for suspicious patterns
    const suspiciousPatterns = [
      /localhost/i,
      /127\.0\.0\.1/,
      /0\.0\.0\.0/,
      /255\.255\.255\.255/,
      /::1/,
      /\.local$/i,
      /\.internal$/i,
      /admin/i,
      /root/i,
      /sudo/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmedValue)) {
        setInputError('[SECURITY_ERROR] Suspicious pattern detected');
        return false;
      }
    }
    
    // Enhanced IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // Enhanced domain validation (RFC compliant)
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
    
    // Check if it's a valid IP
    if (ipRegex.test(trimmedValue)) {
      const parts = trimmedValue.split('.').map(Number);
      
      // Security: Block private/internal IPs
      if (
        (parts[0] === 10) || // 10.0.0.0/8
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
        (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
        (parts[0] === 127) || // 127.0.0.0/8
        (parts[0] === 169 && parts[1] === 254) || // 169.254.0.0/16
        (parts[0] === 0) || // 0.0.0.0/8
        (parts[0] >= 224) // Multicast and reserved
      ) {
        setInputError('[SECURITY_ERROR] Private/internal IPs not allowed');
        return false;
      }
      
      setInputError('');
      return true;
    }
    
    // Check if it's a valid domain
    if (domainRegex.test(trimmedValue)) {
      const labels = trimmedValue.split('.');
      
      // Must have at least 2 labels
      if (labels.length < 2) {
        setInputError('[INPUT_ERROR] Domain must have at least 2 parts (e.g., google.com)');
        return false;
      }
      
      // Check each label
      for (const label of labels) {
        if (label.length === 0 || label.length > 63) {
          setInputError('[INPUT_ERROR] Invalid domain label length');
          return false;
        }
        if (label.startsWith('-') || label.endsWith('-')) {
          setInputError('[INPUT_ERROR] Domain labels cannot start/end with hyphens');
          return false;
        }
      }
      
      // Security: Block suspicious TLDs
      const suspiciousTLDs = ['local', 'internal', 'test', 'invalid'];
      const tld = labels[labels.length - 1];
      if (suspiciousTLDs.includes(tld)) {
        setInputError('[SECURITY_ERROR] Suspicious domain extension blocked');
        return false;
      }
      
      setInputError('');
      return true;
    }
    
    setInputError('[INPUT_ERROR] Please enter a valid public IP address or domain name');
    return false;
  };

  const handleStart = () => {
    if (validateInput(target)) {
      onStart(target);
    }
  };

  const handleInputChange = (value: string) => {
    // Enhanced input sanitization with multiple security layers
    if (typeof value !== 'string') {
      return;
    }

    // Security: Remove dangerous characters and patterns
    let sanitized = value
      .replace(/[;&|`$(){}[\]\\<>'"]/g, '') // Remove shell injection chars
      .replace(/[%\x00-\x1f\x7f-\x9f]/g, '') // Remove control chars and URL encoding
      .replace(/\s+/g, '') // Remove whitespace
      .substring(0, 253); // Limit length

    // Additional security: Prevent certain patterns
    const blacklistedPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i,
    ];

    for (const pattern of blacklistedPatterns) {
      if (pattern.test(sanitized)) {
        console.warn('[SECURITY] Blocked dangerous pattern in input:', pattern);
        return; // Don't update if dangerous pattern found
      }
    }

    setTarget(sanitized);
    
    // Clear previous errors when user types
    if (inputError && sanitized) {
      setTimeout(() => validateInput(sanitized), 300); // Debounced validation
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-neon-green p-6 rounded-lg neon-border relative overflow-hidden"
    >
      {/* Data stream background effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="data-stream"></div>
      </div>
      
      <div className="mb-4 relative z-10">
        <motion.h2 
          className="text-xl font-mono neon-glow mb-2"
          animate={{ 
            textShadow: [
              "0 0 5px #00ff00", 
              "0 0 20px #00ff00", 
              "0 0 5px #00ff00"
            ] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          NETWORK TRACE TERMINAL
        </motion.h2>
        <motion.div 
          className="text-xs font-mono text-neon-green-dim mb-4 opacity-75"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          root@traceroute:~$ ./nettrace --mode=globe --protocol=icmp<span className="animate-terminal-cursor">_</span>
        </motion.div>
        
        <div className="mb-4">
          <label htmlFor="target" className="block text-sm font-mono mb-2 text-neon-green">
            {'>'} TARGET HOSTNAME OR IP ADDRESS:
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 font-mono text-neon-green-dim">$</span>
            <input
              id="target"
              type="text"
              value={target}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="github.com | 8.8.8.8 | example.org"
              className="w-full bg-black border border-neon-green p-3 pl-8 font-mono text-neon-green placeholder-neon-green-dim focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all duration-300"
              disabled={isRunning}
            />
          </div>
          {inputError && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-sm font-mono mt-2 bg-red-500/10 p-2 border-l-2 border-red-500"
            >
              ERROR: {inputError}
            </motion.p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <motion.button
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 20px #00ff00"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={isRunning || !target.trim()}
            className="neon-button px-6 py-3 font-mono disabled:opacity-30 disabled:cursor-not-allowed bg-black border border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 animate-neon-pulse"
          >
            [{isRunning ? (
              <span className="loading-dots">
                <span>R</span><span>U</span><span>N</span><span>N</span><span>I</span><span>N</span><span>G</span><span>.</span><span>.</span><span>.</span>
              </span>
            ) : 'EXEC TRACE'}]
          </motion.button>

          <motion.button
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 20px #ff0000"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onStop}
            disabled={!isRunning}
            className="neon-button px-6 py-3 font-mono disabled:opacity-30 disabled:cursor-not-allowed bg-black border border-neon-green hover:bg-red-500 hover:border-red-500 hover:text-black transition-all duration-300 animate-flicker"
          >
            [KILL PROC]
          </motion.button>

          <motion.button
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 20px #00ff00"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClear}
            className="neon-button px-6 py-3 font-mono bg-black border border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 animate-slide-in-left"
          >
            [CLEAR LOGS]
          </motion.button>

          <motion.button
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 0 20px #00ff00"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onNextHop}
            disabled={isRunning || currentHop >= totalHops}
            className="neon-button px-6 py-3 font-mono disabled:opacity-30 disabled:cursor-not-allowed bg-black border border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 animate-data-stream"
          >
            [STEP] {currentHop}/{totalHops}
          </motion.button>
        </div>

        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-sm bg-black border border-neon-green-dim p-3 rounded relative overflow-hidden"
          >
            <div className="flex items-center relative z-10">
              <motion.div 
                className="w-2 h-2 bg-neon-green rounded-full mr-3"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity
                }}
              ></motion.div>
              <span className="text-neon-green-dim">PROCESS:</span>
              <motion.span 
                className="text-neon-green ml-2"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                nettrace --target={target} --mode=realtime
              </motion.span>
            </div>
            <motion.div 
              className="text-xs text-neon-green-dim mt-1 opacity-75"
              animate={{ opacity: [0.75, 0.3, 0.75] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Establishing connection vectors<span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
            </motion.div>
            
            {/* Background data stream effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="text-xs text-neon-green opacity-10 whitespace-nowrap"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                01001001 01110000 01110110 01110100 01100001 01100011 01100101
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
