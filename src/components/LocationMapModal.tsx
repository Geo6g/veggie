"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, X, Check, Loader2, Navigation } from "lucide-react";
import "./LocationMapModal.css";

interface Props {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (address: string, lat: number, lng: number) => void;
  onClose: () => void;
}

export default function LocationMapModal({ initialLat, initialLng, onConfirm, onClose }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const geocodeTimerRef = useRef<any>(null);

  // Default center: Kerala (adjust if your shop is elsewhere)
  const defaultLat = initialLat ?? 10.5276;
  const defaultLng = initialLng ?? 76.2144;

  const [address, setAddress] = useState("Move the map to pin your location");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [coords, setCoords] = useState({ lat: defaultLat, lng: defaultLng });
  const [mapReady, setMapReady] = useState(false);
  const [locatingGPS, setLocatingGPS] = useState(false);

  /* ── Reverse geocode ── */
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setCoords({ lat, lng });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  /* ── Load Leaflet via CDN ── */
  useEffect(() => {
    if ((window as any).L) { setMapReady(true); return; }

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  /* ── Init map once Leaflet is ready ── */
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;

    const map = L.map(mapRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 17,
      zoomControl: false,
    });

    // Zoom control on right side
    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    map.on("moveend", () => {
      const center = map.getCenter();
      clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = setTimeout(() => {
        reverseGeocode(center.lat, center.lng);
      }, 700);
    });

    // Initial reverse geocode
    reverseGeocode(defaultLat, defaultLng);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapReady, defaultLat, defaultLng, reverseGeocode]);

  /* ── GPS: fly to user's real location ── */
  const handleGPS = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.flyTo([latitude, longitude], 18, { animate: true, duration: 1.2 });
        setLocatingGPS(false);
      },
      () => setLocatingGPS(false),
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  /* ── Confirm ── */
  const handleConfirm = () => {
    setConfirming(true);
    onConfirm(address, coords.lat, coords.lng);
  };

  const isReady = !isGeocoding && address !== "Move the map to pin your location";

  return (
    <div className="lmm-overlay">
      <div className="lmm-container">

        {/* Header */}
        <div className="lmm-header">
          <button className="lmm-close" onClick={onClose} aria-label="Close map">
            <X size={20} />
          </button>
          <h3>Select Delivery Location</h3>
          <div style={{ width: 36 }} />
        </div>

        {/* Map area */}
        <div className="lmm-map-wrapper">
          {!mapReady && (
            <div className="lmm-map-loading">
              <Loader2 size={32} className="lmm-spin" />
              <p>Loading map…</p>
            </div>
          )}
          <div ref={mapRef} className="lmm-map-div" />

          {/* Fixed centre pin — Zomato / Swiggy style */}
          <div className="lmm-centre-pin">
            <div className="lmm-pin-shadow" />
            <MapPin size={42} color="var(--primary-color)" fill="white" strokeWidth={2} />
          </div>

          {/* Geocoding pill */}
          {isGeocoding && (
            <div className="lmm-geocoding-pill">
              <Loader2 size={13} className="lmm-spin" /> Detecting address…
            </div>
          )}

          {/* GPS button */}
          <button className="lmm-gps-btn" onClick={handleGPS} title="Use my current location">
            {locatingGPS
              ? <Loader2 size={20} className="lmm-spin" />
              : <Navigation size={20} />
            }
          </button>
        </div>

        {/* Bottom sheet */}
        <div className="lmm-bottom">
          <p className="lmm-bottom-label">Deliver to</p>
          <div className="lmm-address-row">
            <MapPin size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p className="lmm-address-text">
              {isGeocoding ? <span className="lmm-shimmer">Updating address…</span> : address}
            </p>
          </div>
          <button
            className="btn btn-primary lmm-confirm-btn"
            onClick={handleConfirm}
            disabled={!isReady || confirming}
          >
            {confirming ? <Loader2 size={18} className="lmm-spin" /> : <Check size={18} />}
            Confirm This Location
          </button>
        </div>

      </div>
    </div>
  );
}
