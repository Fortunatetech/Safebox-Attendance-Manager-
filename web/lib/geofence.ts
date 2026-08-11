/** Haversine distance between two lat/lng points, in meters. */
function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const DEFAULT_RADIUS_METERS = 150;

export function isGeofenceConfigured(): boolean {
  return Boolean(process.env.OFFICE_LAT && process.env.OFFICE_LNG);
}

export type GeofenceCheck =
  | { status: "disabled" }
  | { status: "missing-location" }
  | { status: "out-of-range"; distanceMeters: number }
  | { status: "ok"; distanceMeters: number };

/**
 * Validates a reported position against the configured office location.
 * Returns "disabled" (always passes) when OFFICE_LAT/OFFICE_LNG aren't set,
 * so local dev and deployments that haven't opted in are unaffected.
 */
export function checkGeofence(lat: number | null, lng: number | null): GeofenceCheck {
  if (!isGeofenceConfigured()) return { status: "disabled" };
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { status: "missing-location" };
  }

  const officeLat = Number(process.env.OFFICE_LAT);
  const officeLng = Number(process.env.OFFICE_LNG);
  const radius = Number(process.env.OFFICE_RADIUS_METERS ?? DEFAULT_RADIUS_METERS);

  const distanceMeters = distanceInMeters(lat, lng, officeLat, officeLng);
  return distanceMeters <= radius
    ? { status: "ok", distanceMeters }
    : { status: "out-of-range", distanceMeters };
}
