export function sendMsg(bot, chatId, text) {
  return bot.sendMessage(chatId, text, { parse_mode: 'Markdown' })
}
