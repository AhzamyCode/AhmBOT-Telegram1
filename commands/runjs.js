import { VM } from "vm2"

export function runjs(bot, msg, match) {
  const code = match[1]

  try {
    const vm = new VM({
      timeout: 1000,       // batas waktu 1 detik
      sandbox: {},         // environment kosong
    })

    let result = vm.run(code)

    bot.sendMessage(
      msg.chat.id,
      `✅ Output:\n\`${result}\``,
      { parse_mode: "Markdown" }
    )
  } catch (err) {
    bot.sendMessage(
      msg.chat.id,
      `❌ Error:\n\`${err.message}\``,
      { parse_mode: "Markdown" }
    )
  }
}
