async function loadSessions() {
    const res = await fetch("/api/staff/sessions");
    if (!res.ok) {
      alert("Failed to fetch sessions");
      return;
    }
  
    const data = await res.json();
    const tbody = document.querySelector("#sessionsTbl tbody");
    tbody.innerHTML = "";
  
    data.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.courseCode}</td>
        <td>${s.ownerEmail}</td>
        <td>${s.startTime}</td>
        <td>${s.endTime}</td>
        <td>
          <button onclick="viewReport(${s.id})"> Report</button>
          <button onclick="deleteSession(${s.id})"> Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  async function viewReport(id) {
    window.location.href = `staffsummary.html?sessionId=${id}`;
  }
  
  async function deleteSession(id) {
    if (!confirm("Are you sure you want to delete this session?")) return;
  
    const res = await fetch(`/api/staff/sessions/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Session deleted successfully");
      loadSessions();
    } else {
      alert("Failed to delete session");
    }
  }
  
  document.getElementById("refreshSessions").addEventListener("click", loadSessions);
  
  loadSessions();
  