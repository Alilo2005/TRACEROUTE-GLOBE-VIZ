export interface TracerouteHop {
  hopNumber: number;
  ip: string;
  hostname?: string;
  latency: number[];
  location?: {
    lat: number;
    lng: number;
    city?: string;
    region?: string;
    country?: string;
    countryCode?: string;
  };
}

export interface TracerouteResult {
  target: string;
  hops: TracerouteHop[];
  status: 'running' | 'completed' | 'error' | 'stopped';
  error?: string;
}

export interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  hopNumber: number;
  ip: string;
  hostname?: string;
  latency: number[];
  city?: string;
  country?: string;
}

export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  hopNumber: number;
  color: string;
  stroke: number;
}

export interface IPInfoResponse {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string; // "lat,lng" format
  org?: string;
  timezone?: string;
}
