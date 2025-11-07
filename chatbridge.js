// chatbridge.js — GayBot1
const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const mineflayerViewer = require('prismarine-viewer').mineflayer;
const readline = require('readline');
const mcData = require('minecraft-data')('1.19.1');

// Bot options
const options = {
  host: 'chipmunk.land',
  port: 25565,
  username: '§§ChatBridge1§§',
  version: '1.19.1',
  showIpAs: 'chipmunk'
};

// Create bot
const bot = mineflayer.createBot(options);

// Load pathfinder plugin
bot.loadPlugin(pathfinder);

// Keyboard movement setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const keys = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
  sprint: false
};

// Update movement based on keys
function updateMovement() {
  if (!bot.pathfinder) return;

  const movements = new Movements(bot, mcData);
  bot.pathfinder.setMovements(movements);

  bot.setControlState('forward', keys.forward);
  bot.setControlState('back', keys.back);
  bot.setControlState('left', keys.left);
  bot.setControlState('right', keys.right);
  bot.setControlState('jump', keys.jump);
  bot.setControlState('sprint', keys.sprint);
}

// Terminal input for movement + commands
rl.on('line', (input) => {
  const args = input.split(' ');
  const cmd = args[0].toLowerCase();

  switch (cmd) {
    case 'w': keys.forward = !keys.forward; break;
    case 's': keys.back = !keys.back; break;
    case 'a': keys.left = !keys.left; break;
    case 'd': keys.right = !keys.right; break;
    case 'space': keys.jump = !keys.jump; break;
    case 'shift': keys.sprint = !keys.sprint; break;
    case 'say':
      bot.chat(args.slice(1).join(' '));
      break;
    case 'netmsg':
      const msg = args.slice(1).join(' ');
      if (global.gayBot2) global.gayBot2.sendCustomChat(options.showIpAs, msg);
      bot.chat(`Sent message to GayBot2`);
      break;
    default:
      console.log('Unknown command. Use w/s/a/d/space/shift/say/netmsg');
  }

  updateMovement();
});

// Custom JSON chat function
bot.sendCustomChat = function(from, message) {
  const chatJSON = {
    text: "",
    extra: [
      {
        text: "ChipmunkMod",
        color: "#FFCCEE",
        clickEvent: { action: "open_url", value: "https://code.chipmunk.land/7cc5c4f330d47060/chipmunkmod" },
        hoverEvent: { action: "show_text", value: { text: "Click here to open the ChipmunkMod source code", color: "white" } }
      },
      { text: ` [${from}] › `, color: "#FF99DD" },
      {
        text: message,
        color: "white",
        clickEvent: { action: "copy_to_clipboard", value: message },
        hoverEvent: { action: "show_text", value: { text: "Click here to copy the message", color: "white" } }
      }
    ]
  };
  bot.chat(JSON.stringify(chatJSON));
};

// Bot events
bot.once('spawn', () => {
  console.log(`[${options.showIpAs}] Connected`);
  bot.chat(`§aChatBridge connected on ${options.showIpAs}! Type !help`);

  // Prismarine Viewer on port 3007
  mineflayerViewer(bot, { port: 3007, firstPerson: false });
  console.log('Prismarine Viewer running on http://localhost:3007');
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;

  const args = message.split(' ');
  const command = args[0].toLowerCase();

  switch (command) {
    case '!say':
      bot.sendCustomChat(username, args.slice(1).join(' ') || "Usage: !say <message>");
      break;
    case '!netmsg':
      const msg = args.slice(1).join(' ');
      if (!msg) return;
      if (global.gayBot2) global.gayBot2.sendCustomChat(options.showIpAs, msg);
      bot.sendCustomChat('SYSTEM', `Relayed message to GayBot2`);
      break;
    case '!help':
      bot.chat('Commands: !say <msg>, !netmsg <msg>, w/s/a/d/space/shift to move the bot');
      break;
  }
});

bot.on('death', () => console.log(`[${options.showIpAs}] Bot died.`));
bot.on('error', err => console.error(`[${options.showIpAs}] Error:`, err.message));
bot.on('end', () => console.log(`[${options.showIpAs}] Disconnected.`));

module.exports = bot;