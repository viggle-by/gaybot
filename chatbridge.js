const mineflayer = require('mineflayer');
const { exec } = require('child_process');

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

        // Find the other bot
        const other = bots.find(b => b.bot !== bot);
        if (!other) {
          bot.chat("No other server connection found.");
          return;
        }

        // Send message to the other server
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