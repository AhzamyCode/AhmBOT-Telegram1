import ytdl from "@distube/ytdl-core";
import fs from "fs";

export default async function ytmp4(bot, msg, match) {
  const chatId = msg.chat.id;
  let url = match[1]?.trim();

  const loadingMsg = await bot.sendMessage(chatId, "⏳ Sedang memproses, tunggu sebentar...");

  if (!ytdl.validateURL(url)) {
    await bot.editMessageText("❌ URL YouTube tidak valid.", { chat_id: chatId, message_id: loadingMsg.message_id });
    return;
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails.pop().url;

    await bot.sendPhoto(chatId, thumbnail, {
      caption: `🎥 *${title}*\n📹 360p`,
      parse_mode: "Markdown",
    });

    const filePath = `./tmp_${Date.now()}.mp4`;
    const writeStream = fs.createWriteStream(filePath);

    ytdl(url, { quality: "18" })
      .pipe(writeStream)
      .on("finish", async () => {
        await bot.sendVideo(chatId, filePath, {
          caption: `🎬 ${title}`,
          parse_mode: "Markdown",
        });

        fs.unlinkSync(filePath); // hapus setelah dikirim
        await bot.deleteMessage(chatId, loadingMsg.message_id); // hapus loading pas selesai
      })
      .on("error", async (err) => {
        console.error("YTMP4 Stream Error:", err);
        await bot.editMessageText("❌ Gagal download video.", { chat_id: chatId, message_id: loadingMsg.message_id });
      });

  } catch (err) {
    console.error("YTMP4 Error:", err);
    await bot.editMessageText("❌ Gagal download video.", { chat_id: chatId, message_id: loadingMsg.message_id });
  }
}
