// ===== Student Check-In with Live Geofence Verification =====
async function checkIn() {
    try {
      // 1️⃣ Extract session token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (!token) {
        alert("Missing session token.");
        return;
      }
  
      // 2️⃣ Collect student identity from form
      const name = document.getElementById("studentName").value.trim();
      const studentId = document.getElementById("studentId").value.trim();
      const username = document.getElementById("studentUsername").value.trim();
  
      if (!name || !studentId || !username) {
        alert("Please fill in all fields before checking in.");
        return;
      }
  
      // 3️⃣ Get geolocation
      if (!navigator.geolocation) {
        alert("Geolocation not supported by this browser.");
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
  
          // 4️⃣ Post data to backend
          const res = await fetch("/api/student/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              username,        // ✅ must match backend field
              studentId,       // ✅ must match backend field
              lat,
              lng,
              accuracy         // ✅ must match backend field
            })
          });
  
          const data = await res.json();
          if (res.ok) {
            document.getElementById("output").textContent =
              `✅ Check-in recorded!\nMessage: ${data.message}`;
          } else {
            document.getElementById("output").textContent =
              `❌ Failed: ${data.message || "Server error"}`;
          }
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
  
  // ===== Hook up the button =====
  document.getElementById("checkinButton").addEventListener("click", checkIn);
  