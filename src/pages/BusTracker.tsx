import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Clock, MapPin, Bus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface BusData {
  id: string;
  route: string;
  vehicleId: string;
  status: 'On Time' | 'Delayed' | 'Arriving';
  eta: string;
  passengers: number;
  lat: number;
  lng: number;
}

interface StationData {
  id: string;
  name: string;
  address: string;
  buses: BusData[];
}

export default function BusTracker() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);
  const stationMarkerRef = useRef<any>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'station' | 'bus' | null>(null);
  const [busPosition, setBusPosition] = useState({ lat: 40.7589, lng: -73.9851 });
  
  const stationData: StationData = {
    id: 'station-1',
    name: 'Central Station',
    address: '123 Main Street, New York, NY',
    buses: [{
      id: 'bus-1',
      route: 'Route 42',
      vehicleId: 'NYC-4201',
      status: 'On Time',
      eta: '3 min',
      passengers: 28,
      lat: busPosition.lat,
      lng: busPosition.lng
    }]
  };

  const busData: BusData = stationData.buses[0];

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      if (window.L && mapRef.current) {
        // Initialize map
        const map = window.L.map(mapRef.current).setView([40.7589, -73.9851], 14);
        
        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Station marker
        const stationIcon = window.L.divIcon({
          html: `<div class="station-marker"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#1976d2"/></svg></div>`,
          className: 'custom-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const stationMarker = window.L.marker([40.7589, -73.9851], { icon: stationIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedType('station');
            setSidebarOpen(true);
          });

        // Bus marker
        const busIcon = window.L.divIcon({
          html: `<div class="bus-marker"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 16C4 16.88 4.39 17.67 5 18.22V20C5 20.55 5.45 21 6 21H7C7.55 21 8 20.55 8 20V19H16V20C16 20.55 16.45 21 17 21H18C18.55 21 19 20.55 19 20V18.22C19.61 17.67 20 16.88 20 16V6C20 5.11 19.89 4.61 19.8 4.2C19.75 4.09 19.59 3.59 19 3H5C4.4 3.59 4.25 4.09 4.2 4.2C4.11 4.61 4 5.11 4 6V16ZM7.5 17C6.67 17 6 16.33 6 15.5S6.67 14 7.5 14 9 14.67 9 15.5 8.33 17 7.5 17ZM16.5 17C15.67 17 15 16.33 15 15.5S15.67 14 16.5 14 18 14.67 18 15.5 17.33 17 16.5 17ZM18 11H6V6H18V11Z" fill="#f57c00"/></svg></div>`,
          className: 'custom-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });

        const busMarker = window.L.marker([busPosition.lat, busPosition.lng], { icon: busIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedType('bus');
            setSidebarOpen(true);
          });

        mapInstanceRef.current = map;
        busMarkerRef.current = busMarker;
        stationMarkerRef.current = stationMarker;
      }
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Simulate bus movement
  useEffect(() => {
    const interval = setInterval(() => {
      setBusPosition(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update bus marker position
  useEffect(() => {
    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng([busPosition.lat, busPosition.lng]);
    }
  }, [busPosition]);

  // Handle sidebar animation and map resize
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  const handleBusClick = (bus: BusData) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([bus.lat, bus.lng], 16);
      setSelectedType('bus');
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedType(null);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="bg-card border-r border-border shadow-lg overflow-hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">
                  {selectedType === 'station' ? 'Station Details' : 'Bus Details'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSidebar}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedType === 'station' && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <Card className="shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          {stationData.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{stationData.address}</p>
                      </CardContent>
                    </Card>

                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Bus className="h-4 w-4" />
                        Arriving Buses
                      </h3>
                      <div className="space-y-3">
                        {stationData.buses.map((bus) => (
                          <Card
                            key={bus.id}
                            className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20"
                            onClick={() => handleBusClick(bus)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-primary">{bus.route}</div>
                                <Badge variant={bus.status === 'On Time' ? 'default' : 'destructive'}>
                                  {bus.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  ETA: {bus.eta}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Navigation className="h-3 w-3" />
                                  Vehicle: {bus.vehicleId}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedType === 'bus' && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <Card className="shadow-md border-2 border-primary/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Bus className="h-5 w-5 text-primary" />
                          {busData.route}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Vehicle ID</div>
                            <div className="font-semibold">{busData.vehicleId}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Status</div>
                            <Badge variant={busData.status === 'On Time' ? 'default' : 'destructive'}>
                              {busData.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">ETA</div>
                            <div className="font-semibold flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {busData.eta}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Passengers</div>
                            <div className="font-semibold flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {busData.passengers}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Current Location</div>
                          <div className="text-xs text-muted-foreground">
                            {busData.lat.toFixed(6)}, {busData.lng.toFixed(6)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Container */}
      <motion.div
        animate={{ width: sidebarOpen ? '50%' : '100%' }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="relative"
      >
        <div ref={mapRef} className="w-full h-full" />
      </motion.div>

=======
    </div>
  );
}
