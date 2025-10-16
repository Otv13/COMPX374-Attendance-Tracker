    const form = document.getElementById("checkInForm");
    const status = document.getElementById("status");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const sessionId = document.getElementById("sessionId").value.trim();
      const lat = parseFloat(document.getElementById("lat").value) || 0;
      const lng = parseFloat(document.getElementById("lng").value) || 0;

      if (!username || !sessionId) {
        status.textContent = " Please enter username and session ID.";
        return;
      }

      status.textContent = " Submitting check-in...";

      const payload = {
        studentUsername: username,
        sessionId: parseInt(sessionId),
        lat,
        lng,
      };

      try {
        const res = await fetch("/api/attendance/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          status.textContent = ` Failed to check in (status ${res.status})`;
          return;
        }

        const result = await res.json();
        status.textContent = ` Check-in successful for ${result.studentName || username}`;
      } catch (err) {
        console.error(err);
        status.textContent = " Error submitting check-in. Check console.";
      }
    });
