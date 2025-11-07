// chatbridge2.js — GayBot2
const mineflayer = require('mineflayer');

const options = {
  host: 'kaboom.pw',
  port: 25565,
  username: '§§ChatBridge2§§',
  version: '1.19.1',
  showIpAs: "kaboom"
};

const bot = mineflayer.createBot(options);

// Function to send custom chat from GayBot2
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
  bot.chat(`§aChatBridge connected on ${options.showIpAs}!`);
});

bot.on('chat', (username, message) => {
  if (username === bot.username) return;

  const args = message.split(' ');
  const command = args[0]?.toLowerCase();

  switch (command) {
    case '!say':
      bot.sendCustomChat(username, args.slice(1).join(' ') || "Usage: !say <message>");
      break;

    case '!netmsg':
      const msg = args.slice(1).join(' ');
      if (!msg) return;
      // Relay message back to GayBot1 (main.js)
      if (global.gayBot1) global.gayBot1.sendCustomChat(options.showIpAs, msg);
      bot.sendCustomChat('SYSTEM', `Relayed message to GayBot1`);
      break;
  }
});

bot.on('death', () => console.log(`[${options.showIpAs}] Bot died.`));
bot.on('error', err => console.error(`[${options.showIpAs}] Error:`, err.message));
bot.on('end', () => console.log(`[${options.showIpAs}] Disconnected.`));

module.exports = bot;

