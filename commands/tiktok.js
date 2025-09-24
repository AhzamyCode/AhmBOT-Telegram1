import axios from 'axios';

export async function tiktok(bot, chatId, tiktokUrl) {
  let loadingMsg;
  try {
    // VALIDASI CHAT ID
    if (typeof chatId !== 'number' && typeof chatId !== 'string') {
      if (chatId?.chat?.id) chatId = chatId.chat.id;
      else if (chatId?.id) chatId = chatId.id;
      else throw new Error('chat_id tidak valid');
    }

    // PESAN LOADING
    loadingMsg = await bot.sendMessage(chatId, '⏳ Memproses video TikTok...');

    // NORMALISASI URL
    let url = String(tiktokUrl).trim().replace(/[<>"]/g, '');
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const tiktokPatterns = [/tiktok\.com/, /vt\.tiktok\.com/, /vm\.tiktok\.com/, /m\.tiktok\.com/];
    if (!tiktokPatterns.some(p => p.test(url))) throw new Error('URL TikTok tidak valid');

    // API RYHAR
    const apiKey = 'oi2c6dum6q3obgf5mepk8';
    const apiUrl = `https://api.ryhar.my.id/api/downloader/tiktok?url=${encodeURIComponent(url)}&apikey=${apiKey}`;

    const res = await axios.get(apiUrl, { timeout: 15000 });
    if (!res.data.success || !res.data.result) throw new Error(res.data.message || 'Data video tidak ditemukan');

    const video = res.data.result;

    // METADATA
    const metadata = `
🎬 *Judul:* ${video.title || 'Tidak tersedia'}
👤 *Author:* ${video.author?.nickname || 'Unknown'} (@${video.author?.unique_id || 'Unknown'})
❤️ *Likes:* ${video.like_count || 0}
💬 *Comments:* ${video.comment_count || 0}
🔁 *Shares:* ${video.share_count || 0}
⏱️ *Durasi:* ${video.duration || 0} detik
🎵 *Audio:* ${video.music_info?.title || 'Original Audio'}
🔗 *URL Video:* [Klik di sini](${video.play})
`;

    // KIRIM PESAN METADATA
    await bot.sendMessage(chatId, metadata, { parse_mode: 'Markdown' });

    // KIRIM VIDEO
    await bot.sendVideo(chatId, video.play, {
      caption: `🎬 Video dari TikTok: ${video.title || 'Tidak tersedia'}`,
      duration: video.duration
    });

    // KIRIM AUDIO JIKA ADA
    if (video.music) {
      await bot.sendAudio(chatId, video.music, {
        caption: `🎵 Audio: ${video.music_info?.title || 'TikTok Audio'}`,
        title: video.music_info?.title || 'TikTok Audio'
      });
    }

    // HAPUS LOADING
    if (loadingMsg) await bot.deleteMessage(chatId, loadingMsg.message_id).catch(() => {});

  } catch (err) {
    console.error('TikTok Error:', err);

    const errorMsg = `❌ Gagal memproses video TikTok\n${err.message || ''}`;
    if (loadingMsg) {
      try {
        await bot.editMessageText(errorMsg, { chat_id: chatId, message_id: loadingMsg.message_id });
      } catch {
        await bot.sendMessage(chatId, errorMsg);
      }
    } else {
      await bot.sendMessage(chatId, errorMsg);
    }
  }
}
