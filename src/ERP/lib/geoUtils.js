// Prudentia College of Law coordinates (Placeholder, can be updated in .env or hardcoded here)
// For now we use a generic coordinate. 
const PCL_COORDS = {
    latitude: import.meta.env.VITE_CAMPUS_LAT || 17.3850, // Default Hyderabad lat
    longitude: import.meta.env.VITE_CAMPUS_LNG || 78.4867  // Default Hyderabad lng
};

// Maximum allowed distance in meters (100 meters)
const MAX_DISTANCE_METERS = 100;

// Haversine formula to calculate distance between two coordinates in meters
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the earth in m
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in m
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

export const verifyStudentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error("Geolocation is not supported by your browser."));
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                
                // If accuracy is worse than 500 meters, we might reject it, but let's be lenient for now
                if (accuracy > 1000) {
                    return reject(new Error("GPS accuracy is too low. Please step outside or connect to Wi-Fi."));
                }

                const distance = getDistanceFromLatLonInMeters(
                    latitude,
                    longitude,
                    PCL_COORDS.latitude,
                    PCL_COORDS.longitude
                );

                if (distance <= MAX_DISTANCE_METERS) {
                    resolve({ verified: true, distance, latitude, longitude });
                } else {
                    reject(new Error(`You are too far from campus (${Math.round(distance)}m away). You must be within ${MAX_DISTANCE_METERS}m to mark attendance.`));
                }
            },
            (error) => {
                let msg = "Failed to get location.";
                if (error.code === 1) msg = "Location permission denied. You must allow GPS access to mark attendance.";
                if (error.code === 2) msg = "Location unavailable. Please check your GPS settings.";
                if (error.code === 3) msg = "Location request timed out.";
                reject(new Error(msg));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
};
