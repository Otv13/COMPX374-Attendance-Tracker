// ---------------------------
// Navigation buttons
// ---------------------------
document.getElementById("createSession").onclick = () => {
    window.location.href = "staffcreate.html"; // form for creating sessions
  };
  document.getElementById("uploadRoster").onclick = () => {
    window.location.href = "staffupload.html"; // page to upload rosters
  };
  document.getElementById("generateReport").onclick = () => {
    window.location.href = "staffsummary.html"; // stay here (report view)
  };
  document.getElementById("manageSessions").onclick = () => {
    window.location.href = "staffmanage.html"; // page to manage sessions
  };
  
  // ---------------------------
  // Refresh report
  // ---------------------------
  document.getElementById("refresh").addEventListener("click", async () => {
    const sessionId = prompt("Enter session ID to view report:");
    if (!sessionId) return;
  
    try {
      const res = await fetch(`/api/staff/sessions/${sessionId}/report`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
  
      const tbody = document.querySelector("#tbl tbody");
      tbody.innerHTML = "";
  
      data.forEach((r) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${r.studentUsername || ""}</td>
          <td>${r.studentId || ""}</td>
          <td>${r.studentName || ""}</td>
          <td>${r.submittedAt || ""}</td>
          <td>${r.lat || ""}</td>
          <td>${r.lng || ""}</td>
          <td>${r.accuracyMeters || ""}</td>
          <td>${r.ipTruncated || ""}</td>
          <td>${r.deviceHash || ""}</td>
          <td>${r.flagLate ? "✅" : ""}</td>
          <td>${r.flagGeofence ? "⚠️" : ""}</td>
          <td>${r.flagLowAccuracy ? "⚠️" : ""}</td>
          <td>${r.flagNote || ""}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      alert("❌ Error fetching report. Check console for details.");
      console.error(err);
    }
  });
  
  // ---------------------------
  // Export CSV
  // ---------------------------
  document.getElementById("export").addEventListener("click", () => {
    const sessionId = prompt("Enter session ID to download CSV:");
    if (!sessionId) return;
    window.location.href = `/api/staff/sessions/${sessionId}/export.csv`;
  });
  