const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function capture() {
  const chrome = spawn('chromium', [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--user-data-dir=/tmp/chr-prof-radio',
    '--remote-debugging-port=9889',
    '--window-size=1440,900',
    'http://localhost:5173/radio',
  ]);

  let pageTarget = null;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      const list = await new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:9889/json/list', (res) => {
          let data = '';
          res.on('data', (d) => (data += d));
          res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      pageTarget = list?.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) break;
    } catch {}
  }

  if (!pageTarget) {
    console.error('Failed to find page target');
    chrome.kill();
    process.exit(1);
  }

  console.log('Connecting to page:', pageTarget.url, pageTarget.webSocketDebuggerUrl);
  const ws = new globalThis.WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const res = JSON.parse(event.data);
        if (res.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await new Promise((r) => (ws.onopen = r));

  await send('Page.enable');
  await send('Runtime.enable');

  // Complete onboarding in localStorage and reload
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('echora_radio_onboarding_guest', JSON.stringify({
        completed: true,
        countryCode: 'LK',
        countryName: 'Sri Lanka',
        favoriteGenres: ['lofi', 'chillout', 'electronic'],
        updatedAt: Date.now()
      }));
      localStorage.setItem('echora_radio_playback_v1', JSON.stringify({
        state: {
          userPreferences: {
            countryCode: 'LK',
            countryName: 'Sri Lanka',
            favoriteGenres: ['lofi', 'chillout', 'electronic'],
            isOnboardingCompleted: true
          },
          isOnboardingOpen: false,
          currentStation: {
            stationuuid: 'hiru-fm',
            name: 'Hiru FM',
            url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
            country: 'Sri Lanka',
            countrycode: 'LK',
            tags: 'music,hits,entertainment'
          },
          isPlaying: true,
          volume: 0.8
        },
        version: 0
      }));
      window.location.reload();
    `,
  });

  // Wait 5.5 seconds for stations to load and render
  await new Promise((r) => setTimeout(r, 5500));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const buffer = Buffer.from(screenshot.data, 'base64');
  fs.writeFileSync('docs/fullscreen_radio_view.png', buffer);
  console.log('Saved screenshot: docs/fullscreen_radio_view.png (' + buffer.length + ' bytes)');

  ws.close();
  chrome.kill();
  process.exit(0);
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
