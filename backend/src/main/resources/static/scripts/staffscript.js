document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("sessionForm");
  const output = document.getElementById("output");
  const studentLink = document.getElementById("studentLink");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      courseCode: document.getElementById("courseCode").value.trim(),
      ownerEmail: document.getElementById("ownerEmail").value.trim(),
      startTime: document.getElementById("startTime").value,
      endTime: document.getElementById("endTime").value
    };

    output.textContent = "Submitting session...";

    try {
      const res = await fetch("/api/staff/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      output.textContent = JSON.stringify(data, null, 2);

      if (data.token) {
        const url = `/studentcheckin.html?token=${data.token}`;
        studentLink.innerHTML = `
          <p><strong>Student Check-In Link:</strong><br>
          <a href="${url}" target="_blank">${url}</a></p>
        `;
      }
    } catch (err) {
      console.error("❌ Error creating session:", err);
      output.textContent = `❌ ${err.message}`;
    }
  });
});
