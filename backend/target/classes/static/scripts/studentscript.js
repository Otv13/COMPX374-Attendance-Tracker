// ✅ Fix: should be URLSearchParams (plural)
const params = new URLSearchParams(location.search);
const token = params.get('token');

// Helper for querySelector
const $ = s => document.querySelector(s);

$('#btn').onclick = () => {
  if (!navigator.geolocation) {
    $('#status').textContent = 'Geolocation not supported by this browser.';
    $('#status').className = 'err';
    return;
  }

  $('#status').textContent = 'Requesting location…';

  navigator.geolocation.getCurrentPosition(async pos => {
    // Success: got location
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;

    const body = {
      token,
      username: $('#u').value,
      studentId: $('#sid').value,
      lat,
      lng,
      accuracy
    };

    const res = await fetch('/api/student/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.json());

    $('#out').textContent = JSON.stringify(res, null, 2);
    $('#status').textContent = res.message || 'Recorded';
    $('#status').className =
      res.flags && (res.flags.late || res.flags.geofence || res.flags.lowAccuracy)
        ? 'err'
        : 'ok';

  }, async err => {
    // ❌ No location: still submit with nulls to record denied (FR12)
    const body = {
      token,
      username: $('#u').value,
      studentId: $('#sid').value
    };

    const res = await fetch('/api/student/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.json());

    $('#out').textContent = JSON.stringify(res, null, 2);
    $('#status').textContent = 'Location denied – recorded with flags.';
    $('#status').className = 'err';
  }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
};
