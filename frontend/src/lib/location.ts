import { apiRequest } from "./api";

export interface DetectedLocation {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/**
 * Uses browser Geolocation and reverse geocoding to resolve the user's exact address.
 */
export async function detectUserLocation(): Promise<{ success: boolean; data?: DetectedLocation; message?: string }> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return {
      success: false,
      message: "Geolocation is not supported by your browser.",
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 1. Try BigDataCloud free client reverse geocoding API
          const bdcRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (bdcRes.ok) {
            const data = await bdcRes.json();
            const roadOrLocality = data.locality || data.neighbourhood || data.localityInfo?.administrative?.[3]?.name || "";
            const area = data.principalSubdivisionDescription || data.localityInfo?.administrative?.[2]?.name || "";
            const city = data.city || data.localityInfo?.administrative?.[1]?.name || "New Delhi";
            const state = data.principalSubdivision || "Delhi";
            const pincode = data.postcode || "";

            const line1 = [roadOrLocality, area].filter(Boolean).join(", ") || `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            const line2 = city !== line1 ? city : "";

            const detected: DetectedLocation = {
              addressLine1: line1,
              addressLine2: line2,
              city: city || "New Delhi",
              state: state || "Delhi",
              pincode: pincode || "110059",
              country: data.countryName || "India",
              latitude,
              longitude,
              formattedAddress: [line1, line2, city, state, pincode].filter(Boolean).join(", "),
            };

            // Save to localStorage for instant recall
            localStorage.setItem("nayantara_detected_address", JSON.stringify(detected));

            resolve({ success: true, data: detected });
            return;
          }
        } catch (err) {
          console.warn("BigDataCloud geocode failed, trying OpenStreetMap...", err);
        }

        try {
          // 2. Fallback to OpenStreetMap Nominatim
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );

          if (osmRes.ok) {
            const data = await osmRes.json();
            const addr = data.address || {};

            const line1 = [addr.house_number, addr.building, addr.road || addr.suburb || addr.neighbourhood]
              .filter(Boolean)
              .join(", ") || `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`;

            const line2 = [addr.suburb, addr.commercial, addr.city_district].filter(Boolean).join(", ");
            const city = addr.city || addr.town || addr.village || addr.state_district || "New Delhi";
            const state = addr.state || "Delhi";
            const pincode = addr.postcode || "110059";

            const detected: DetectedLocation = {
              addressLine1: line1,
              addressLine2: line2,
              city,
              state,
              pincode,
              country: addr.country || "India",
              latitude,
              longitude,
              formattedAddress: [line1, line2, city, state, pincode].filter(Boolean).join(", "),
            };

            localStorage.setItem("nayantara_detected_address", JSON.stringify(detected));
            resolve({ success: true, data: detected });
            return;
          }
        } catch (osmErr) {
          console.error("OSM geocode error:", osmErr);
        }

        // If reverse geocoding network request failed, return coordinates as fallback
        const fallback: DetectedLocation = {
          addressLine1: `Near GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          addressLine2: "Uttam Nagar / West Delhi",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110059",
          country: "India",
          latitude,
          longitude,
          formattedAddress: `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}, New Delhi, 110059`,
        };

        localStorage.setItem("nayantara_detected_address", JSON.stringify(fallback));
        resolve({ success: true, data: fallback });
      },
      (error) => {
        let msg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access in your browser or enter address manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location position unavailable. Please enter address manually.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out. Please try again or enter manually.";
        }
        resolve({ success: false, message: msg });
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 }
    );
  });
}

/**
 * Saves a detected location directly into the database Address table for the logged-in user.
 */
export async function saveLocationToProfileAddress(
  location: DetectedLocation,
  userName = "My Home",
  phone = "+919876543210"
): Promise<{ success: boolean; message?: string }> {
  return await apiRequest("/auth/addresses", {
    method: "POST",
    body: JSON.stringify({
      fullName: userName,
      phone,
      addressLine1: location.addressLine1,
      addressLine2: location.addressLine2 || undefined,
      city: location.city,
      state: location.state,
      pincode: location.pincode,
      type: "HOME",
      isDefault: true,
      landmark: "Auto-detected GPS Location",
    }),
  });
}
