const mineflayer = require('mineflayer');
const { exec } = require('child_process');
const readline = require('readline');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Configuration for multiple servers
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

// Terminal setup for interactive commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to download favicon and add a circle below it
async function createBootLogo() {
  const imageUrl = 'https://mclist.co/api/render/favicon/3e125dfce627beac43b288de125824de15e7c2164adf6a5c42b48c88eb722526.png';
  const outputPath = path.join(__dirname, 'boot_logo.png');

  try {
    const img = await loadImage(imageUrl);

    const circleRadius = 50; // Circle radius
    const padding = 20;      // Space between image and circle
    const width = img.width;
    const height = img.height + circleRadius * 2 + padding;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Draw circle below image
    ctx.fillStyle = 'red'; // Circle color
    ctx.beginPath();
    ctx.arc(width / 2, img.height + padding + circleRadius, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Save the final image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log('Boot logo created with circle:', outputPath);
  } catch (err) {
    console.error('Failed to create boot logo:', err);
  }
}

// Initialize bots
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
          bot.chat("Commands: !neofetch, !say <msg>, !netmsg <msg>, !curl, !wget");
          break;

        case '!neofetch':
          exec('neofetch --stdout', (err, stdout, stderr) => {
            if (err) {
              bot.chat("You seem to have not installed neofetch. Please install neofetch.");
              console.error(stderr);
              return;
            }
            const lines = stdout.trim().split('\n');
            lines.forEach(line => {
              if (line.length > 0) bot.chat(line.slice(0, 256));
            });
          });
          break;

        case '!say':
          const text = args.slice(1).join(' ');
          bot.chat(text || "Usage: !say <message>");
          break;

        case '!netmsg':
          const msg = args.slice(1).join(' ');
          if (!msg) {
            bot.chat("Usage: !netmsg <message>");
            return;
          }

          const other = bots.find(b => b.bot !== bot);
          if (!other) {
            bot.chat("No other server connection found.");
            return;
          }

          other.bot.chat(`[${opt.showIpAs}] ${msg}`);
          bot.chat(`Sent message to ${other.info.showIpAs}`);
          break;

        case '!curl':
        case '!wget':
          bot.chat("Fake network request complete.");
          break;

        default:
          break;
      }
    });

    bot.on('death', () => {
      bot.chat("You seem to kill mineflayer bots. Please stop killing mineflayer bots.");
      console.log(`[${opt.showIpAs}] Bot died.`);
    });

    bot.on('error', err => console.error(`[${opt.showIpAs}] Error:`, err.message));
    bot.on('end', () => console.log(`[${opt.showIpAs}] Disconnected.`));
  }
}

// Terminal input to interact with bots manually
rl.on('line', (input) => {
  const [botIndex, ...cmd] = input.split(' ');
  const idx = parseInt(botIndex);
  if (isNaN(idx) || !bots[idx]) {
    console.log('Invalid bot index. Format: <botIndex> <message>');
    return;
  }
  bots[idx].bot.chat(cmd.join(' '));
});

// Main boot process
(async () => {
  console.log('gaybot is booting...');
  await createBootLogo();
  console.log('Starting bots...');
  startBots();
})();
