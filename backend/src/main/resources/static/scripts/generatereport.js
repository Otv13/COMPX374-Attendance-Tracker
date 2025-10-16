document.getElementById("generateCsvBtn").addEventListener("click", async () => {
  const session = document.getElementById("sessionSelect").value;
  const privacy = document.getElementById("privacyToggle").checked;
  const result = document.getElementById("result");

  result.textContent = "⏳ Generating report...";

  let url =
    session === "all"
      ? "/api/report/all.csv"
      : `/api/report/sessions/${session}.csv?privacy=${privacy}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      result.textContent = ` Failed to generate report (status ${response.status})`;
      return;
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download =
      session === "all"
        ? "attendance-all.csv"
        : `attendance-session-${session}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);

    result.textContent = " Report downloaded successfully.";
  } catch (error) {
    console.error(error);
    result.textContent = " Error generating report. Check console.";
  }
});
