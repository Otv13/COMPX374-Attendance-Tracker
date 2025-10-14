// ====== STAFF CREATE SESSION SCRIPT ======

document.getElementById("createSessionForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // ----- 1. Collect form input -----
  const payload = {
    courseCode: document.getElementById("courseCode").value,
    ownerEmail: document.getElementById("ownerEmail").value,
    startTime: new Date(document.getElementById("startTime").value).toISOString(),
    endTime: new Date(document.getElementById("endTime").value).toISOString(),
  };

  // ----- 2. Hardcoded coordinates for buildings -----
  // 🔸 Adjust these coordinates to match your real locations.
  // Each entry contains: [latitude, longitude]
  const buildingCoords = {
    blockA: [37.78896191688808, 175.31757809443616],      // ← - G Block , 
    blockB: [-37.78785468785254, 175.31704355283895],      // ← L Block  
    blockC: [-37.788513801837176, 175.3172523968833],      // ←  S Block  , 
    library: [-37.78844733745714,175.31644682430334],     // ←   J Block , 
  };

  // ----- 3. Apply geofence based on dropdown selection -----
  const selected = document.getElementById("geofenceSelect").value;
  const radius = document.getElementById("geofenceRadiusMeters").value;

  if (selected && buildingCoords[selected]) {
    const [lat, lng] = buildingCoords[selected];
    payload.geofenceLat = lat;
    payload.geofenceLng = lng;
  }

  if (radius) payload.geofenceRadiusMeters = parseFloat(radius);

  // ----- 4. Send request to backend -----
  try {
    const res = await fetch("/api/staff/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // ----- 5. Display session result -----
    const link = data.link || `/studentcheckin.html?token=${data.token}`;
    document.getElementById("output").innerHTML = `
       <b>Session Created Successfully</b><br>
      <b>Session ID:</b> ${data.sessionId}<br>
      <b>Token:</b> ${data.token}<br>
      <b>Selected Geofence:</b> ${selected || "None"}<br>
      <b>Student Link:</b> <a href="${link}" target="_blank">${link}</a>
    `;
  } catch (err) {
    console.error(err);
    document.getElementById("output").textContent = "Failed to create session.";
  }
});
