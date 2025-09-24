import { exec } from 'child_process'

export function runpy(bot, msg, match) {
  const code = match[1]
  exec(`python3 -c "${code.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
    if (err) return bot.sendMessage(msg.chat.id, `❌ Error:\n\`${stderr}\``, { parse_mode: "Markdown" })
    bot.sendMessage(msg.chat.id, `✅ Output:\n\`${stdout}\``, { parse_mode: "Markdown" })
  })
}
