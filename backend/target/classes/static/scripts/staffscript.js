document.getElementById("sessionForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    courseCode: document.getElementById("courseCode").value,
    ownerEmail: document.getElementById("ownerEmail").value,
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value
  };

  const res = await fetch("/api/staff/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  document.getElementById("output").textContent = JSON.stringify(await res.json(), null, 2);
});
