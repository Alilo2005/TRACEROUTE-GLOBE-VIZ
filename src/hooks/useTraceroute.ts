import { useState, useCallback } from 'react';
import { TracerouteResult, TracerouteHop, GlobePoint, GlobeArc } from '@/types/traceroute';

export function useTraceroute() {
  const [tracerouteData, setTracerouteData] = useState<TracerouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHop, setCurrentHop] = useState(0);

  const startTraceroute = useCallback(async (target: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentHop(0);
    setTracerouteData(null);

    try {
      // Start traceroute
      const traceResponse = await fetch('/api/traceroute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target }),
      });

      if (!traceResponse.ok) {
        throw new Error('Failed to execute traceroute');
      }

      const traceResult = await traceResponse.json();

      if (traceResult.error) {
        throw new Error(traceResult.error);
      }

      // Get geolocation for all IPs
      const ips = traceResult.hops.map((hop: TracerouteHop) => hop.ip);
      
      if (ips.length === 0) {
        throw new Error('No hops found in traceroute result');
      }

      const geoResponse = await fetch('/api/geolocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ips }),
      });

      if (!geoResponse.ok) {
        throw new Error('Failed to get geolocation data');
      }

      const geoResult = await geoResponse.json();

      // Merge traceroute and geolocation data
      const enrichedHops = traceResult.hops.map((hop: TracerouteHop) => {
        const geoData = geoResult.results[hop.ip];
        console.log(`Processing hop ${hop.hopNumber} (${hop.ip}):`, geoData);
        const enrichedHop = {
          ...hop,
          location: geoData?.location || null,
          hostname: geoData?.hostname || hop.hostname,
        };
        console.log(`Enriched hop:`, enrichedHop);
        return enrichedHop;
      }).filter((hop: TracerouteHop) => {
        const hasLocation = !!hop.location;
        console.log(`Hop ${hop.hopNumber} (${hop.ip}) has location:`, hasLocation);
        return hasLocation;
      }); // Only include hops with valid locations

      console.log('Final enriched hops:', enrichedHops);

      setTracerouteData({
        target: traceResult.target,
        hops: enrichedHops,
        status: 'completed',
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const nextHop = useCallback(() => {
    if (tracerouteData && currentHop < tracerouteData.hops.length) {
      setCurrentHop(prev => prev + 1);
    }
  }, [tracerouteData, currentHop]);

  const clearData = useCallback(() => {
    setTracerouteData(null);
    setCurrentHop(0);
    setError(null);
  }, []);

  const stopTraceroute = useCallback(() => {
    setIsLoading(false);
    if (tracerouteData) {
      setTracerouteData({
        ...tracerouteData,
        status: 'stopped',
      });
    }
  }, [tracerouteData]);

  // Generate globe points and arcs
  const globePoints: GlobePoint[] = tracerouteData?.hops.map(hop => ({
    lat: hop.location!.lat,
    lng: hop.location!.lng,
    label: `Hop ${hop.hopNumber}`,
    hopNumber: hop.hopNumber,
    ip: hop.ip,
    hostname: hop.hostname,
    latency: hop.latency,
    city: hop.location!.city,
    country: hop.location!.country,
  })) || [];

  const globeArcs: GlobeArc[] = [];
  if (tracerouteData?.hops && tracerouteData.hops.length > 1) {
    for (let i = 0; i < tracerouteData.hops.length - 1; i++) {
      const startHop = tracerouteData.hops[i];
      const endHop = tracerouteData.hops[i + 1];
      
      if (startHop.location && endHop.location) {
        globeArcs.push({
          startLat: startHop.location.lat,
          startLng: startHop.location.lng,
          endLat: endHop.location.lat,
          endLng: endHop.location.lng,
          hopNumber: endHop.hopNumber,
          color: '#00ff00',
          stroke: 2,
        });
      }
    }
  }

  return {
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
  };
}
