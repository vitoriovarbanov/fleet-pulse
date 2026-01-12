'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useDashboard } from '../context/dashboard-context';
import { VehicleMarker } from './vehicle-marker';
import type { VehicleWithLocation } from '@/server/api/routers/vehicles/repository/vehicles.repository.types';

type FleetMapProps = {
  vehicles: VehicleWithLocation[];
  className?: string;
  isLoading?: boolean;
};

// Default center on Europe
const DEFAULT_CENTER = { latitude: 50.5, longitude: 10.0 };
const DEFAULT_ZOOM = 4;

// MapTiler style URLs
const getMapStyle = (theme: string | undefined, apiKey: string | undefined) => {
  if (!apiKey) {
    // Fallback to OpenStreetMap tiles if no API key
    return {
      version: 8 as const,
      sources: {
        osm: {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm',
          type: 'raster' as const,
          source: 'osm',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }

  // MapTiler styles
  const styleId = theme === 'dark' ? 'dataviz-dark' : 'dataviz';
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${apiKey}`;
};

export function FleetMap({ vehicles, className, isLoading }: FleetMapProps) {
  const mapRef = useRef<MapRef>(null);
  const { theme } = useTheme();
  const { selectedVehicleId, setSelectedVehicleId, mapCenter, setMapCenter } = useDashboard();
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  const mapStyle = getMapStyle(theme, apiKey);

  // Fit bounds to show all vehicles on initial load
  const fitBounds = useCallback(() => {
    if (!mapRef.current || vehicles.length === 0) return;

    const vehiclesWithCoords = vehicles.filter(v => v.latitude && v.longitude);
    if (vehiclesWithCoords.length === 0) return;

    if (vehiclesWithCoords.length === 1) {
      const vehicle = vehiclesWithCoords[0];
      if (vehicle?.latitude && vehicle?.longitude) {
        mapRef.current.flyTo({
          center: [vehicle.longitude, vehicle.latitude],
          zoom: 10,
          duration: 1000,
        });
      }
      return;
    }

    const bounds = new maplibregl.LngLatBounds();
    vehiclesWithCoords.forEach(v => {
      if (v.latitude && v.longitude) {
        bounds.extend([v.longitude, v.latitude]);
      }
    });

    mapRef.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 12,
      duration: 1000,
    });
  }, [vehicles]);

  // Fit bounds when vehicles change or map loads
  useEffect(() => {
    if (mapLoaded) {
      fitBounds();
    }
  }, [mapLoaded, fitBounds]);

  // Pan to selected vehicle when mapCenter changes
  useEffect(() => {
    if (!mapRef.current || !mapCenter) return;

    mapRef.current.flyTo({
      center: [mapCenter.longitude, mapCenter.latitude],
      zoom: 12,
      duration: 800,
    });

    // Clear mapCenter after panning
    const timeout = setTimeout(() => setMapCenter(null), 1000);
    return () => clearTimeout(timeout);
  }, [mapCenter, setMapCenter]);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const handleMarkerClick = useCallback(
    (vehicleId: string) => {
      setSelectedVehicleId(vehicleId === selectedVehicleId ? null : vehicleId);
    },
    [selectedVehicleId, setSelectedVehicleId]
  );

  return (
    <div className={cn('relative h-full w-full overflow-hidden rounded-xl', className)}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Loading map...</span>
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={{
          latitude: DEFAULT_CENTER.latitude,
          longitude: DEFAULT_CENTER.longitude,
          zoom: DEFAULT_ZOOM,
        }}
        mapLib={maplibregl}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="top-right" />

        {/* Vehicle markers */}
        {vehicles.map(vehicle => {
          if (!vehicle.latitude || !vehicle.longitude) return null;

          return (
            <Marker
              key={vehicle.id}
              latitude={vehicle.latitude}
              longitude={vehicle.longitude}
              anchor="center"
              onClick={e => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(vehicle.id);
              }}
            >
              <VehicleMarker
                vehicle={vehicle}
                isSelected={selectedVehicleId === vehicle.id}
              />
            </Marker>
          );
        })}
      </Map>

      {/* Map info overlay */}
      {!apiKey && (
        <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Add NEXT_PUBLIC_MAPTILER_API_KEY for better map tiles
          </p>
        </div>
      )}
    </div>
  );
}
