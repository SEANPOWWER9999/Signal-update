import { jwtVerify, createRemoteJWKSet } from 'https://esm.sh/jose@5.9.6';

const AUTH_CONFIG = {
  AUDIENCE: "688e8e2293e303b0483d65e6395eaa5efa0c30a5d734e63fc70d0aaf35e02fa4",
  JWKS_URL: "https://powwersean01.cloudflareaccess.com/cdn-cgi/access/certs"
};

export default {
  async fetch(request, env) {
    // PREVIEW META TAGS (Visible in WhatsApp/iMessage)
    const metaTags = `
      <title>Shared Signal Album</title>
      <meta property="og:title" content="Shared Album: 'Signal Updates'" />
      <meta property="og:description" content="powwersean01 shared an album with you. Click to view photos." />
      <meta property="og:image" content="https://images.unsplash.com/photo-1543167423-37968bc50772?q=80&w=1000&auto=format&fit=crop" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image">
    `;

    const token = request.headers.get("Cf-Access-Jwt-Assertion");

    if (!token) {
      return new Response(`<!DOCTYPE html><html><head>${metaTags}</head><body style="font-family:sans-serif;text-align:center;padding-top:100px;background:#f0f0f5;"><div style="background:white;padding:40px;border-radius:20px;display:inline-block;box-shadow:0 4px 15px rgba(0,0,0,0.05);"><h2>Redirecting to Secure Login...</h2><p>Please sign in to view this shared album.</p></div></body></html>`, {
        headers: { "Content-Type": "text/html" }
      });
    }

    try {
      const JWKS = createRemoteJWKSet(new URL(AUTH_CONFIG.JWKS_URL));
      const { payload } = await jwtVerify(token, JWKS, { audience: AUTH_CONFIG.AUDIENCE });

      const successHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, sans-serif; background: #f2f2f7; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .card { background: white; border-radius: 28px; box-shadow: 0 15px 50px rgba(0,0,0,0.1); width: 350px; text-align: center; overflow: hidden; }
          .header-img { width: 100%; height: 220px; object-fit: cover; }
          .content { padding: 30px; }
          .user-badge { background: #007aff15; color: #007aff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 10px; }
          h2 { margin: 0 0 10px 0; font-size: 22px; color: #1c1c1e; }
          p { color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
          .btn { display: block; background: #007aff; color: white; padding: 16px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <img class="header-img" src="https://images.unsplash.com/photo-1543167423-37968bc50772?q=80&w=1000&auto=format&fit=crop">
          <div class="content">
            <div class="user-badge">${payload.email}</div>
            <h2>Shared Signal Album</h2>
            <p>You have been invited to view the shared "Signal" collection. Access verified.</p>
            <a href="#" class="btn">Open Shared Album</a>
          </div>
        </div>
      </body>
      </html>`;

      return new Response(successHtml, { headers: { "Content-Type": "text/html" } });
    } catch (e) {
      return new Response(`Access Denied: ${e.message}`, { status: 403 });
    }
  }
};
