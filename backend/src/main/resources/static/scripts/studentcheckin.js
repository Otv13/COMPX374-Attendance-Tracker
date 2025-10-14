// ===== Student Check-In with Live Geofence Verification =====

// Example: this function runs when the student clicks "Check In"
async function checkIn() {
    try {
      // 1️⃣ Get session data (including geofence) from backend using token in URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (!token) {
        alert("Missing session token.");
        return;
      }
  
      // Fetch session details from backend
      const sessionRes = await fetch(`/api/student/session?token=${token}`);
      if (!sessionRes.ok) throw new Error("Failed to load session data");
      const session = await sessionRes.json();
  
      // Expect backend to return geofence info like:
      // { geofenceLat, geofenceLng, geofenceRadiusMeters }
  
      // 2️⃣ Ask browser for student's current location
      if (!navigator.geolocation) {
        alert("Geolocation not supported by this browser.");
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const studentLat = pos.coords.latitude;
          const studentLng = pos.coords.longitude;
  
          // 3️⃣ Calculate distance to session geofence
          const distance = haversineDistance(
            [studentLat, studentLng],
            [session.geofenceLat, session.geofenceLng]
          );
  
          const allowedRadius = session.geofenceRadiusMeters || 150; // default radius
          const inside = distance <= allowedRadius;
  
          // 4️⃣ Display result and post attendance
          if (inside) {
            alert(`✅ You are within ${Math.round(distance)} meters of the location.`);
          } else {
            alert(`⚠️ You are ${Math.round(distance)} meters away — outside the geofence.`);
          }
  
          // (Optional) Send result to backend
          await fetch(`/api/student/checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              lat: studentLat,
              lng: studentLng,
              insideGeofence: inside,
              accuracy: pos.coords.accuracy,
            }),
          });
        },
        (err) => {
          console.error(err);
          alert("Unable to retrieve your location. Please enable GPS.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (err) {
      console.error(err);
      alert("Error checking in. See console for details.");
    }
  }
  
  // ===== Utility: Haversine formula (distance in meters) =====
  function haversineDistance([lat1, lon1], [lat2, lon2]) {
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // distance in meters
  }
  
  // ===== Hook up the button =====
  document.getElementById("checkinButton").addEventListener("click", checkIn);
  