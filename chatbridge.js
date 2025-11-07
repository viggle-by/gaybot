const mineflayer = require('mineflayer');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');
const { createCanvas, loadImage } = require('canvas');

// ---------------- CONFIG ----------------
const options = [
  {
    host: 'chipmunk.land',
    port: 25565,
    username: '§§ChatBridge1§§',
    version: '1.19.1',
    showIpAs: "chipmunk"
  },
  {
    host: 'kaboom.pw',
    port: 25565,
    username: '§§ChatBridge2§§',
    version: '1.19.1',
    showIpAs: "kaboom"
  }
];

const bots = [];
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// ---------------- CREATE BOOT LOGO ----------------
async function createBootLogo() {
  const faviconUrl = 'https://mclist.co/api/render/favicon/3e125dfce627beac43b288de125824de15e7c2164adf6a5c42b48c88eb722526.png';
  const faviconPath = path.join(__dirname, 'favicon.png');

  try {
    const img = await loadImage(faviconUrl);
    const canvas = createCanvas(128, 128);
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 128, 128);

    // Draw favicon centered
    ctx.drawImage(img, 32, 32, 64, 64);

    // Draw "mewo"
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('mewo', 64, 120);

    fs.writeFileSync(faviconPath, canvas.toBuffer('image/png'));
    console.log('Boot logo created at', faviconPath);
  } catch (err) {
    console.error('Failed to create boot logo:', err);
  }
}

// ---------------- CREATE BOOT HTML ----------------
function createBootHTML() {
  const htmlPath = path.join(__dirname, 'boot.html');
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>GayBot Boot</title>
<style>
  html, body { margin:0; padding:0; width:100%; height:100%; background:black; color:#00ff00; font-family: monospace; display:flex; justify-content:center; align-items:center; flex-direction:column; }
  #boot-logo { width:128px; height:128px; margin-bottom:20px; }
  pre { text-align:left; max-width:90%; }
</style>
</head>
<body>
<img id="boot-logo" src="favicon.png" alt="mewo">
<pre id="boot-text">Booting GayBot OS...
Loading modules...
Initializing Mineflayer...
System ready.
</pre>
<pre id="neofetch"></pre>
<script>
async function fetchNeofetch() {
  const res = await fetch('/neofetch');
  const text = await res.text();
  document.getElementById('neofetch').innerHTML = text;
}
fetchNeofetch();
</script>
</body>
</html>
`;
  fs.writeFileSync(htmlPath, htmlContent);
  console.log('Boot HTML created at', htmlPath);
}

// ---------------- START HTTP SERVER ----------------
function startWebServer() {
  const app = express();
  const port = 3000;

  app.use(express.static(__dirname)); // serve favicon.png and boot.html

  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'boot.html')));

  app.get('/neofetch', (req, res) => {
    exec(`docker run --rm ubuntu:24.04 bash -c "apt update && apt install -y neofetch && neofetch --stdout"`, (err, stdout, stderr) => {
      if(err) return res.send(`<pre>Error: ${stderr}</pre>`);
      res.send(`<pre>${stdout}</pre>`);
    });
  });

  app.listen(port, () => console.log(`Web interface running at http://localhost:${port}`));
}

// ---------------- START MINEFLAYER BOTS ----------------
function startBots() {
  for (const opt of options) {
    const bot = mineflayer.createBot(opt);
    bots.push({ bot, info: opt });

    bot.once('spawn', () => {
      console.log(`[${opt.showIpAs}] Connected as ${opt.username}`);
      bot.chat(`ChatBridge connected on ${opt.showIpAs}! Type !help for commands.`);
    });

    bot.on('chat', (username, message) => {
      if (username === bot.username) return;
      const args = message.split(' ');
      const command = args[0]?.toLowerCase();

      switch (command) {
        case '!help':
          bot.chat("Commands: !say <msg>, !netmsg <msg>");
          break;

        case '!say':
          bot.chat(args.slice(1).join(' ') || "Usage: !say <message>");
          break;

        case '!netmsg':
          const other = bots.find(b => b.bot !== bot);
          if (!other) {
            bot.chat("No other server connection found.");
            return;
          }
          const msg = args.slice(1).join(' ');
          other.bot.chat(`[${opt.showIpAs}] ${msg}`);
          bot.chat(`Sent message to ${other.info.showIpAs}`);
          break;
      }
    });

    bot.on('death', () => bot.chat("Sybau."));
    bot.on('error', err => console.error(`[${opt.showIpAs}] i use arch btw`, err.message));
    bot.on('end', () => console.log(`[${opt.showIpAs}] Disconnected.`));
  }
}

// ---------------- TERMINAL INPUT ----------------
rl.on('line', (input) => {
  const [botIndex, ...cmd] = input.split(' ');
  const idx = parseInt(botIndex);
  if (isNaN(idx) || !bots[idx]) return console.log('Invalid bot index.');
  bots[idx].bot.chat(cmd.join(' '));
});

// ---------------- MAIN BOOT ----------------
(async () => {
  console.log('gaybot is booting...');
  await createBootLogo();
  createBootHTML();
  startWebServer();
  startBots();
})();
