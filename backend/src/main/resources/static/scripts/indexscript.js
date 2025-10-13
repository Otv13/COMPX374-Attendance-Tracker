document.addEventListener('DOMContentLoaded', () => {
  // ✅ All your code goes INSIDE this block

  let sessionId = 1; // change if your DB shows a different ID
  let token = null;
  const $ = sel => document.querySelector(sel);

  const headers = { 'Content-Type': 'application/json' };

  // ----------------- Create Session -----------------
  $('#create')?.addEventListener('click', async () => {
    try {
      const body = {
        courseCode: $('#course').value,
        ownerEmail: $('#owner').value,
        startTime: $('#start').value,
        endTime: $('#end').value,
      };

      if ($('#lat').value) body.geofenceLat = Number($('#lat').value);
      if ($('#lng').value) body.geofenceLng = Number($('#lng').value);
      if ($('#rad').value) body.geofenceRadiusMeters = Number($('#rad').value);

      const res = await fetch('/api/staff/sessions', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }).then(r => r.json());

      sessionId = res.sessionId;
      token = res.token;

      const studentUrl = `/studentcheckin.html?token=${token}`;
      $('#link').innerHTML = `Student link: <a href="${studentUrl}" target="_blank">${studentUrl}</a>`;

      if ($('#upload')) $('#upload').disabled = false;
      if ($('#refresh')) $('#refresh').disabled = false;
      if ($('#export')) $('#export').href = `/api/staff/sessions/${sessionId}/export.csv?privacy=true`;

    } catch (err) {
      console.error(err);
      alert('Failed to create session');
    }
  });

  // ----------------- Upload Roster -----------------
  $('#upload')?.addEventListener('click', async () => {
    try {
      const raw = $('#roster').value;
      console.log("📥 Raw roster input:", raw);

      let rows;
      try {
        rows = JSON.parse(raw);
      } catch (e) {
        console.error("❌ Failed to parse roster JSON:", e);
        alert("Invalid JSON in roster textarea");
        return;
      }

      const res = await fetch(`/api/staff/sessions/${sessionId}/roster`, {
        method: 'POST',
        headers,
        body: JSON.stringify(rows),
      });

      const data = await res.json();
      $('#rosterResult').textContent = `Imported ${data.count} students.`;
    } catch (err) {
      console.error("🔥 Upload roster failed:", err);
      alert('Failed to upload roster');
    }
  });

  // ----------------- Refresh Report -----------------
  $('#refresh')?.addEventListener('click', async () => {
    try {
      console.log("🔄 Fetching attendance report for session:", sessionId);
      const res = await fetch(`/api/staff/sessions/${sessionId}/report`);
      const list = await res.json();
      console.log("✅ Received data:", list);

      const tbody = $('#tbl tbody');
      if (!tbody) return;

      tbody.innerHTML = '';

      if (!Array.isArray(list) || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13">No attendance data available.</td></tr>`;
        return;
      }

      for (const a of list) {
        const tr = document.createElement('tr');

        const studentUsername = a.studentUsername || a.student?.username || '';
        const studentId = a.studentId || a.student?.studentId || '';
        const studentName = a.studentName || a.student?.name || '';
        const submittedAt = a.submittedAt || '';
        const lat = a.lat || '';
        const lng = a.lng || '';
        const acc = a.accuracyMeters || '';
        const ip = a.ipTruncated || '';
        const device = a.deviceHash || '';
        const late = a.flagLate ? "⚠️" : "";
        const geo = a.flagGeofence ? "🚫" : "";
        const lowAcc = a.flagLowAccuracy ? "⚠️" : "";
        const note = a.flagNote || '';

        tr.innerHTML = `
          <td>${studentUsername}</td>
          <td>${studentId}</td>
          <td>${studentName}</td>
          <td>${submittedAt}</td>
          <td>${lat}</td>
          <td>${lng}</td>
          <td>${acc}</td>
          <td>${ip}</td>
          <td>${device}</td>
          <td>${late}</td>
          <td>${geo}</td>
          <td>${lowAcc}</td>
          <td>${note}</td>
        `;

        tbody.appendChild(tr);
      }

      console.log(`📊 Rendered ${list.length} attendance records`);
    } catch (err) {
      console.error("❌ Failed to refresh report:", err);
      alert('Failed to refresh report. Check console for details.');
    }
  });

}); // ✅ DOMContentLoaded end
