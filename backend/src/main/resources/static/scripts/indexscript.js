let sessionId = null, token = null;
const $ = sel => document.querySelector(sel);

const headers = { 'Content-Type': 'application/json' };

// Create Session
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

    $('#link').innerHTML = `Student link: <a href="${res.link}" target="_blank">${res.link}</a>`;
    $('#upload').disabled = false;
    $('#refresh').disabled = false;
    $('#export').href = `/api/staff/sessions/${sessionId}/export.csv?privacy=true`;

  } catch (err) {
    console.error(err);
    alert('Failed to create session');
  }
};

// Upload roster
$('#upload').onclick = async () => {
  try {
    const rows = JSON.parse($('#roster').value);
    const res = await fetch(`/api/staff/sessions/${sessionId}/roster`, {
      method: 'POST',
      headers,
      body: JSON.stringify(rows),
    }).then(r => r.json());

    $('#rosterResult').textContent = `Imported ${res.count} students.`;
  } catch (err) {
    console.error(err);
    alert('Failed to upload roster');
  }
};

// Refresh report
$('#refresh').onclick = async () => {
  try {
    const list = await fetch(`/api/staff/sessions/${sessionId}/report`)
      .then(r => r.json());

    const tbody = $('#tbl tbody');
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
