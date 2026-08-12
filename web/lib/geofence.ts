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
const DEFAULT_MAX_ACCURACY_METERS = 100;

export function isGeofenceConfigured(): boolean {
  return Boolean(process.env.OFFICE_LAT && process.env.OFFICE_LNG);
}

export type GeofenceCheck =
  | { status: "disabled" }
  | { status: "missing-location" }
  | { status: "low-accuracy"; accuracyMeters: number }
  | { status: "out-of-range"; distanceMeters: number }
  | { status: "ok"; distanceMeters: number };

/**
 * Validates a reported position against the configured office location.
 * Returns "disabled" (always passes) when OFFICE_LAT/OFFICE_LNG aren't set,
 * so local dev and deployments that haven't opted in are unaffected.
 *
 * A GPS/network fix reports its own margin of error (`accuracy`, in meters).
 * Phones sometimes return a fast, low-accuracy network-based fix instead of
 * waiting for a real GPS lock — that fix can read as "in range" even when the
 * device is genuinely hundreds of meters away. Rejecting anything above
 * OFFICE_MAX_ACCURACY_METERS closes that gap: a distance check alone isn't
 * enough if the reported position itself can't be trusted.
 */
export function checkGeofence(
  lat: number | null,
  lng: number | null,
  accuracy: number | null = null
): GeofenceCheck {
  if (!isGeofenceConfigured()) return { status: "disabled" };
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { status: "missing-location" };
  }

  const maxAccuracy = Number(process.env.OFFICE_MAX_ACCURACY_METERS ?? DEFAULT_MAX_ACCURACY_METERS);
  if (accuracy != null && !Number.isNaN(accuracy) && accuracy > maxAccuracy) {
    return { status: "low-accuracy", accuracyMeters: accuracy };
  }

  const officeLat = Number(process.env.OFFICE_LAT);
  const officeLng = Number(process.env.OFFICE_LNG);
  const radius = Number(process.env.OFFICE_RADIUS_METERS ?? DEFAULT_RADIUS_METERS);

  const distanceMeters = distanceInMeters(lat, lng, officeLat, officeLng);
  return distanceMeters <= radius
    ? { status: "ok", distanceMeters }
    : { status: "out-of-range", distanceMeters };
}
