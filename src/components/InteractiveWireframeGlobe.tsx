import React, { useEffect, useRef, useState } from 'react';

type GeoPoint = {
  lat: number;
  lon: number;
};

type ProjectedPoint = {
  x: number;
  y: number;
  visible: boolean;
  intensity: number;
};

const FULL_CIRCLE = Math.PI * 2;
const AUTO_ROTATION = 0.00032;
const DRAG_SENSITIVITY = 0.0048;
const TILT_SENSITIVITY = 0.0038;
const BASE_LOCATION: GeoPoint = { lat: 45.8981, lon: -74.1588 };

const LANDMASSES: GeoPoint[][] = [
  [
    { lon: -168, lat: 71 },
    { lon: -150, lat: 72 },
    { lon: -140, lat: 69 },
    { lon: -131, lat: 61 },
    { lon: -126, lat: 55 },
    { lon: -124, lat: 49 },
    { lon: -122, lat: 41 },
    { lon: -117, lat: 33 },
    { lon: -110, lat: 29 },
    { lon: -101, lat: 25 },
    { lon: -92, lat: 24 },
    { lon: -84, lat: 26 },
    { lon: -80, lat: 31 },
    { lon: -79, lat: 38 },
    { lon: -75, lat: 44 },
    { lon: -67, lat: 47 },
    { lon: -61, lat: 52 },
    { lon: -60, lat: 59 },
    { lon: -68, lat: 66 },
    { lon: -83, lat: 72 },
    { lon: -109, lat: 77 },
    { lon: -141, lat: 76 },
    { lon: -168, lat: 71 },
  ],
  [
    { lon: -53, lat: 59 },
    { lon: -48, lat: 65 },
    { lon: -43, lat: 72 },
    { lon: -34, lat: 78 },
    { lon: -23, lat: 76 },
    { lon: -20, lat: 70 },
    { lon: -28, lat: 62 },
    { lon: -40, lat: 58 },
    { lon: -53, lat: 59 },
  ],
  [
    { lon: -81, lat: 12 },
    { lon: -75, lat: 8 },
    { lon: -69, lat: 4 },
    { lon: -64, lat: -4 },
    { lon: -61, lat: -15 },
    { lon: -60, lat: -27 },
    { lon: -63, lat: -39 },
    { lon: -69, lat: -52 },
    { lon: -76, lat: -50 },
    { lon: -79, lat: -37 },
    { lon: -80, lat: -22 },
    { lon: -81, lat: -5 },
    { lon: -81, lat: 12 },
  ],
  [
    { lon: -10, lat: 36 },
    { lon: -7, lat: 42 },
    { lon: 0, lat: 47 },
    { lon: 10, lat: 53 },
    { lon: 22, lat: 57 },
    { lon: 35, lat: 58 },
    { lon: 40, lat: 50 },
    { lon: 31, lat: 44 },
    { lon: 20, lat: 40 },
    { lon: 10, lat: 44 },
    { lon: 2, lat: 45 },
    { lon: -10, lat: 36 },
  ],
  [
    { lon: -17, lat: 36 },
    { lon: -6, lat: 37 },
    { lon: 7, lat: 35 },
    { lon: 19, lat: 33 },
    { lon: 31, lat: 30 },
    { lon: 39, lat: 22 },
    { lon: 44, lat: 10 },
    { lon: 45, lat: -3 },
    { lon: 41, lat: -16 },
    { lon: 34, lat: -27 },
    { lon: 22, lat: -35 },
    { lon: 8, lat: -31 },
    { lon: -2, lat: -18 },
    { lon: -11, lat: 1 },
    { lon: -15, lat: 16 },
    { lon: -17, lat: 36 },
  ],
  [
    { lon: 39, lat: 60 },
    { lon: 55, lat: 62 },
    { lon: 73, lat: 59 },
    { lon: 92, lat: 56 },
    { lon: 111, lat: 52 },
    { lon: 128, lat: 49 },
    { lon: 146, lat: 47 },
    { lon: 155, lat: 41 },
    { lon: 147, lat: 31 },
    { lon: 132, lat: 24 },
    { lon: 116, lat: 21 },
    { lon: 99, lat: 17 },
    { lon: 83, lat: 17 },
    { lon: 67, lat: 24 },
    { lon: 55, lat: 31 },
    { lon: 44, lat: 42 },
    { lon: 39, lat: 60 },
  ],
  [
    { lon: 66, lat: 25 },
    { lon: 76, lat: 28 },
    { lon: 87, lat: 25 },
    { lon: 96, lat: 18 },
    { lon: 103, lat: 9 },
    { lon: 105, lat: 0 },
    { lon: 100, lat: -5 },
    { lon: 93, lat: 2 },
    { lon: 84, lat: 6 },
    { lon: 76, lat: 12 },
    { lon: 69, lat: 19 },
    { lon: 66, lat: 25 },
  ],
  [
    { lon: 113, lat: -11 },
    { lon: 123, lat: -16 },
    { lon: 137, lat: -21 },
    { lon: 151, lat: -28 },
    { lon: 153, lat: -38 },
    { lon: 145, lat: -43 },
    { lon: 131, lat: -39 },
    { lon: 118, lat: -32 },
    { lon: 113, lat: -11 },
  ],
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const interpolate = (start: GeoPoint, end: GeoPoint, steps: number) => {
  const points: GeoPoint[] = [];

  for (let index = 0; index < steps; index += 1) {
    const progress = index / steps;
    points.push({
      lon: start.lon + (end.lon - start.lon) * progress,
      lat: start.lat + (end.lat - start.lat) * progress,
    });
  }

  return points;
};

const buildSmoothPolyline = (points: GeoPoint[], closed = false) => {
  const smooth: GeoPoint[] = [];
  const lastIndex = closed ? points.length : points.length - 1;

  for (let index = 0; index < lastIndex; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const steps = Math.max(2, Math.ceil(Math.hypot(next.lon - current.lon, next.lat - current.lat) / 3));

    smooth.push(...interpolate(current, next, steps));
  }

  smooth.push(closed ? points[0] : points[points.length - 1]);

  return smooth;
};

const pointInPolygon = (target: GeoPoint, polygon: GeoPoint[]) => {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];

    const intersects =
      (currentPoint.lat > target.lat) !== (previousPoint.lat > target.lat) &&
      target.lon <
        ((previousPoint.lon - currentPoint.lon) * (target.lat - currentPoint.lat)) /
          (previousPoint.lat - currentPoint.lat || Number.EPSILON) +
          currentPoint.lon;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
};

const isLand = (point: GeoPoint) => LANDMASSES.some((polygon) => pointInPolygon(point, polygon));

const latitudeRing = (lat: number) => {
  const points: GeoPoint[] = [];

  for (let lon = -180; lon <= 180; lon += 3) {
    points.push({ lat, lon });
  }

  return points;
};

const longitudeArc = (lon: number) => {
  const points: GeoPoint[] = [];

  for (let lat = -90; lat <= 90; lat += 3) {
    points.push({ lat, lon });
  }

  return points;
};

export const InteractiveWireframeGlobe = () => {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ lon: -1.42, lat: 0.36 });
  const velocityRef = useRef({ lon: 0.0024, lat: 0 });
  const pointerRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;

    if (!host || !canvas) {
      return;
    }

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let previousTimestamp = performance.now();

    const smoothLandOutlines = LANDMASSES.map((polygon) => buildSmoothPolyline(polygon, true));

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = Math.max(bounds.width, 1);
      height = Math.max(bounds.height, 1);

      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const drawPath = (
      points: GeoPoint[],
      project: (point: GeoPoint) => ProjectedPoint,
      strokeStyle: string,
      lineWidth: number,
    ) => {
      context.beginPath();
      let drawing = false;

      for (const point of points) {
        const projected = project(point);

        if (projected.visible) {
          if (!drawing) {
            context.moveTo(projected.x, projected.y);
            drawing = true;
          } else {
            context.lineTo(projected.x, projected.y);
          }
        } else if (drawing) {
          context.strokeStyle = strokeStyle;
          context.lineWidth = lineWidth;
          context.stroke();
          context.beginPath();
          drawing = false;
        }
      }

      if (drawing) {
        context.strokeStyle = strokeStyle;
        context.lineWidth = lineWidth;
        context.stroke();
      }
    };

    const render = (timestamp: number) => {
      const delta = Math.min((timestamp - previousTimestamp) / 16.67, 2);
      previousTimestamp = timestamp;

      const rotation = rotationRef.current;
      const velocity = velocityRef.current;

      if (!draggingRef.current) {
        rotation.lon += (velocity.lon + AUTO_ROTATION) * delta;
        rotation.lat = clamp(rotation.lat + velocity.lat * delta, -0.88, 0.88);
        velocity.lon *= 0.962 ** delta;
        velocity.lat *= 0.9 ** delta;
      }

      context.clearRect(0, 0, width, height);

      const radius = Math.min(width * 0.42, height * 0.66);
      const center = {
        x: width < 640 ? width * 0.5 : width * 0.67,
        y: height < 420 ? height * 0.82 : height * 0.9,
      };
      const sinLat = Math.sin(rotation.lat);
      const cosLat = Math.cos(rotation.lat);

      const project = (point: GeoPoint) => {
        const latitude = (point.lat * Math.PI) / 180;
        const longitude = (point.lon * Math.PI) / 180;
        const longitudeDelta = longitude - rotation.lon;
        const sinLatitude = Math.sin(latitude);
        const cosLatitude = Math.cos(latitude);
        const cosLongitudeDelta = Math.cos(longitudeDelta);
        const intensity = sinLat * sinLatitude + cosLat * cosLatitude * cosLongitudeDelta;

        return {
          x: center.x + radius * cosLatitude * Math.sin(longitudeDelta),
          y: center.y - radius * (cosLat * sinLatitude - sinLat * cosLatitude * cosLongitudeDelta),
          visible: intensity > 0,
          intensity,
        };
      };

      const ambientGlow = context.createRadialGradient(
        center.x - radius * 0.4,
        center.y - radius * 0.85,
        radius * 0.08,
        center.x,
        center.y,
        radius * 1.3,
      );
      ambientGlow.addColorStop(0, 'rgba(255, 106, 55, 0.2)');
      ambientGlow.addColorStop(0.55, 'rgba(255, 255, 255, 0.05)');
      ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      context.fillStyle = ambientGlow;
      context.beginPath();
      context.arc(center.x, center.y, radius * 1.18, 0, FULL_CIRCLE);
      context.fill();

      context.fillStyle = 'rgba(0, 0, 0, 0.4)';
      context.beginPath();
      context.ellipse(center.x, center.y + radius * 0.98, radius * 0.88, radius * 0.16, 0, 0, FULL_CIRCLE);
      context.fill();

      context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      context.lineWidth = 1;
      context.beginPath();
      context.arc(center.x, center.y, radius, 0, FULL_CIRCLE);
      context.stroke();

      const gridStep = width < 520 ? 6 : 5;
      for (let lat = -82; lat <= 82; lat += gridStep) {
        for (let lon = -180; lon < 180; lon += gridStep) {
          const point = project({ lat, lon });

          if (!point.visible) {
            continue;
          }

          const opacity = 0.1 + point.intensity * 0.2;
          context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          context.beginPath();
          context.arc(point.x, point.y, width < 520 ? 1 : 1.15, 0, FULL_CIRCLE);
          context.fill();
        }
      }

      const landStep = width < 520 ? 7 : 5;
      for (let lat = -70; lat <= 78; lat += landStep) {
        for (let lon = -180; lon < 180; lon += landStep) {
          const geoPoint = { lat, lon };

          if (!isLand(geoPoint)) {
            continue;
          }

          const point = project(geoPoint);

          if (!point.visible) {
            continue;
          }

          const opacity = 0.26 + point.intensity * 0.42;
          context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          context.beginPath();
          context.arc(point.x, point.y, width < 520 ? 1.1 : 1.35, 0, FULL_CIRCLE);
          context.fill();
        }
      }

      for (let lat = -60; lat <= 60; lat += 20) {
        drawPath(latitudeRing(lat), project, 'rgba(255, 255, 255, 0.12)', 1);
      }

      for (let lon = -160; lon <= 160; lon += 20) {
        drawPath(longitudeArc(lon), project, 'rgba(255, 255, 255, 0.12)', 1);
      }

      for (const polygon of smoothLandOutlines) {
        drawPath(polygon, project, 'rgba(255, 255, 255, 0.7)', 1.35);
      }

      const marker = project(BASE_LOCATION);
      if (marker.visible) {
        const pulse = 0.5 + 0.5 * Math.sin(timestamp * 0.0045);
        const glowRadius = 14 + pulse * 10;

        const markerGlow = context.createRadialGradient(
          marker.x,
          marker.y,
          0,
          marker.x,
          marker.y,
          glowRadius,
        );
        markerGlow.addColorStop(0, 'rgba(255, 162, 128, 0.95)');
        markerGlow.addColorStop(0.35, 'rgba(255, 106, 55, 0.7)');
        markerGlow.addColorStop(1, 'rgba(255, 106, 55, 0)');

        context.fillStyle = markerGlow;
        context.beginPath();
        context.arc(marker.x, marker.y, glowRadius, 0, FULL_CIRCLE);
        context.fill();

        context.strokeStyle = `rgba(255, 126, 84, ${0.5 + pulse * 0.25})`;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(marker.x, marker.y, 10 + pulse * 6, 0, FULL_CIRCLE);
        context.stroke();

        context.fillStyle = '#ff6a37';
        context.beginPath();
        context.arc(marker.x, marker.y, 3.4, 0, FULL_CIRCLE);
        context.fill();

        context.fillStyle = 'rgba(255, 240, 233, 0.95)';
        context.beginPath();
        context.arc(marker.x, marker.y, 1.4, 0, FULL_CIRCLE);
        context.fill();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    velocityRef.current = { lon: 0, lat: 0 };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) {
      return;
    }

    const deltaX = event.clientX - pointerRef.current.x;
    const deltaY = event.clientY - pointerRef.current.y;

    pointerRef.current = { x: event.clientX, y: event.clientY };
    rotationRef.current.lon -= deltaX * DRAG_SENSITIVITY;
    rotationRef.current.lat = clamp(rotationRef.current.lat + deltaY * TILT_SENSITIVITY, -0.88, 0.88);
    velocityRef.current = {
      lon: -deltaX * 0.00085,
      lat: deltaY * 0.00055,
    };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      draggingRef.current = false;
      setIsDragging(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={hostRef}
      className={`relative h-full w-full overflow-hidden rounded-[1.75rem] ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
      aria-label="Interactive wireframe globe"
      role="img"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#090909] via-[#090909]/90 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_88%,rgba(255,106,55,0.08),transparent_32%)]" />
    </div>
  );
};
