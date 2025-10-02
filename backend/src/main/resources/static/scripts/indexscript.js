// indexscript.js – Staff Dashboard
let sessionId = null, token = null;
const $ = sel => document.querySelector(sel);

const headers = { 'Content-Type': 'application/json' };

// ----------------- Create Session -----------------
$('#create').onclick = async () => {
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

    // Student link
    const studentUrl = `/studentcheckin.html?token=${token}`;
    $('#link').innerHTML = `Student link: <a href="${studentUrl}" target="_blank">${studentUrl}</a>`;

    // Enable buttons
    if ($('#upload')) $('#upload').disabled = false;
    if ($('#refresh')) $('#refresh').disabled = false;
    if ($('#export')) $('#export').href = `/api/staff/sessions/${sessionId}/export.csv?privacy=true`;

    // ----------------- Update Manage Classes -----------------
    const sessionList = $('#sessionList');
    if (sessionList) {
      const sessionDiv = document.createElement('div');
      sessionDiv.innerHTML = `
        <p>
          <strong>Course:</strong> ${body.courseCode}<br>
          <strong>Owner:</strong> ${body.ownerEmail}<br>
          <a href="${studentUrl}" target="_blank">Student Check-in Link</a>
        </p>
        <hr>
      `;
      sessionList.prepend(sessionDiv);
    }

  } catch (err) {
    console.error(err);
    alert('Failed to create session');
  }
};

// ----------------- Upload Roster -----------------
$('#upload').onclick = async () => {
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

    console.log("📦 Parsed roster object:", rows);

    const res = await fetch(`/api/staff/sessions/${sessionId}/roster`, {
      method: 'POST',
      headers,
      body: JSON.stringify(rows),
    });

    console.log("📡 Response status:", res.status);

    const data = await res.json().catch(err => {
      console.error(" Failed to parse response as JSON:", err);
      return { error: "Invalid JSON response" };
    });

    console.log("📨 Response data:", data);

    $('#rosterResult').textContent = `Imported ${data.count} students.`;
  } catch (err) {
    console.error("🔥 Upload roster failed:", err);
    alert('Failed to upload roster');
  }
};

// ----------------- Refresh Report -----------------
$('#refresh').onclick = async () => {
  try {
    const list = await fetch(`/api/staff/sessions/${sessionId}/report`)
      .then(r => r.json());

    const tbody = $('#tbl tbody');
    if (!tbody) {
      console.warn("⚠️ No table found for report refresh");
      return;
    }
    tbody.innerHTML = '';

    for (const a of list) {
      const tr = document.createElement('tr');
      const cells = [
        a.studentUsername, a.studentId, a.studentName,
        a.submittedAt, a.lat, a.lng, a.accuracyMeters,
        a.ipTruncated, a.deviceHash,
        a.flagLate, a.flagGeofence, a.flagLowAccuracy, a.flagNote
      ];
      tr.innerHTML = cells.map(c => `<td>${c ?? ''}</td>`).join('');
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to refresh report');
  }
};
