"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  center: [number, number];
  color: string;
  path: [number, number][];
  /** Posición del camión a dibujar, o null si nadie comparte. */
  bus: [number, number] | null;
  /** true = el dato es fresco (afecta opacidad del marcador). */
  fresh?: boolean;
}

export function MapView({ center, color, path, bus, fresh = true }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const centeredRef = useRef(false);

  // Inicializa el mapa una sola vez.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    if (path.length > 1) {
      // Trazo de referencia, discreto: con GPS real lo que importa es el punto.
      const line = L.polyline(path, {
        color,
        weight: 4,
        opacity: 0.3,
        dashArray: "2 8",
      }).addTo(map);
      map.fitBounds(line.getBounds().pad(0.25));
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Solo al montar: el resto se actualiza en efectos separados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualiza el marcador del camión cuando cambia la posición.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!bus) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      centeredRef.current = false;
      return;
    }

    const icon = L.divIcon({
      className: "",
      html: `<div class="rumbi-bus" style="background:${color};color:${color};opacity:${
        fresh ? 1 : 0.45
      }">🚌</div>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    if (!markerRef.current) {
      markerRef.current = L.marker(bus, { icon }).addTo(map);
    } else {
      markerRef.current.setLatLng(bus);
      markerRef.current.setIcon(icon);
    }

    // Primera vez que aparece el camión: centramos de cerca. Luego solo seguimos.
    if (!centeredRef.current) {
      map.setView(bus, Math.max(map.getZoom(), 15), { animate: true });
      centeredRef.current = true;
    } else {
      map.panTo(bus, { animate: true });
    }
  }, [bus, color, fresh]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      role="img"
      aria-label="Mapa de la ruta con la posición del camión"
    />
  );
}

export default MapView;
