document.getElementById("createSessionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const payload = {
      courseCode: document.getElementById("courseCode").value,
      ownerEmail: document.getElementById("ownerEmail").value,
      startTime: new Date(document.getElementById("startTime").value).toISOString(),
      endTime: new Date(document.getElementById("endTime").value).toISOString(),
    };
  
    const lat = document.getElementById("geofenceLat").value;
    const lng = document.getElementById("geofenceLng").value;
    const radius = document.getElementById("geofenceRadiusMeters").value;
    if (lat) payload.geofenceLat = parseFloat(lat);
    if (lng) payload.geofenceLng = parseFloat(lng);
    if (radius) payload.geofenceRadiusMeters = parseFloat(radius);
  
    try {
      const res = await fetch("/api/staff/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const link = data.link || `/studentcheckin.html?token=${data.token}`;
      document.getElementById("output").innerHTML = `
         <b>Session Created Successfully</b><br>
        <b>Session ID:</b> ${data.sessionId}<br>
        <b>Token:</b> ${data.token}<br>
        <b>Student Link:</b> <a href="${link}" target="_blank">${link}</a>
      `;
    } catch (err) {
      console.error(err);
      document.getElementById("output").textContent = " Failed to create session.";
    }
  });
  