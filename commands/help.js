import { sendMsg } from '../utils/sendMsg.js'

export function cmdHelp(bot) {
  bot.onText(/^!help$/, (msg) => {
    sendMsg(
      bot,
      msg.chat.id,
      `📖 *List Perintah:*\n
💬 !halo - sapa bot  
⚡ !runjs <kode> - jalankan JavaScript  
🐍 !runpy <kode> - jalankan Python  
🎵 !yt <url> - download YouTube (mp3/mp4)  
📱 !tiktok <url> - download TikTok no WM  
ℹ️ !about - info bot`
    )
  })
}
