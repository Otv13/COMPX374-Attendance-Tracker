document.getElementById("uploadRosterForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const sessionId = document.getElementById("sessionId").value;
    const file = document.getElementById("rosterFile").files[0];
    if (!file) return alert("Please select a CSV file.");
  
    const text = await file.text();
    const rows = text
      .trim()
      .split("\n")
      .slice(1)
      .map((line) => {
        const [username, studentId, name] = line.split(",");
        return { username, studentId, name };
      });
  
    try {
      const res = await fetch(`/api/staff/sessions/${sessionId}/roster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      const data = await res.json();
      document.getElementById("output").textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      console.error(err);
      document.getElementById("output").textContent = " Upload failed.";
    }
  });
  