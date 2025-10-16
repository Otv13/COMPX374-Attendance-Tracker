const tableBody = document.querySelector("#sessionTable tbody");
const status = document.getElementById("status");

async function loadSessions() {
  status.textContent = "⏳ Loading sessions...";
  tableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

  try {
    const res = await fetch("/api/session");
    if (!res.ok) throw new Error("Failed to load sessions");

    const sessions = await res.json();

    if (sessions.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='5'>No sessions found.</td></tr>";
      status.textContent = "ℹ️ No active sessions.";
      return;
    }

    tableBody.innerHTML = sessions
      .map(
        (s) => `
      <tr>
        <td>${s.id}</td>
        <td>${s.courseCode || "-"}</td>
        <td>${s.startTime || "-"}</td>
        <td>${s.endTime || "-"}</td>
        <td>
          <button class="deleteBtn" onclick="deleteSession(${s.id})">Delete</button>
        </td>
      </tr>`
      )
      .join("");

    status.textContent = ` Loaded ${sessions.length} session(s).`;
  } catch (err) {
    console.error(err);
    status.textContent = " Error loading sessions.";
  }
}

async function deleteSession(id) {
  if (!confirm(`Delete session ${id}?`)) return;

  try {
    const res = await fetch(`/api/session/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete session");

    status.textContent = ` Session ${id} deleted.`;
    loadSessions(); // this is to refresh table
  } catch (err) {
    console.error(err);
    status.textContent = ` Error deleting session ${id}.`;
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadSessions);


loadSessions();
