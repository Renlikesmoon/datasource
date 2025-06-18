import axios from 'axios'
import * as cheerio from 'cheerio'

let handler = async (m, { conn, args }) => {
  if (!args[0]) throw `⚠️ Masukkan UID member!\n🔗 Cek UID di: https://jkt48.com/member/list?lang=id`
  if (isNaN(args[0])) throw `❗ UID harus berupa angka!\n🔗 Lihat daftarnya di: https://jkt48.com/member/list?lang=id`

  const uid = args[0]
  const url = `https://jkt48.com/member/detail/id/${uid}?lang=id`

  try {
    const res = await axios.get(`https://cors.caliph.my.id/${url}`)
    const $ = cheerio.load(res.data)

    const profileBlock = $('div > div[class="row mb-5"]').html()
    if (!profileBlock) throw '❌ Member tidak ditemukan!'

    const $$ = cheerio.load(profileBlock)

    const photo = 'https://jkt48.com' + $$('img').attr('src')
    const text = $$.text()

    const nama = text.split('Nama')[1]?.split('Tanggal Lahir')[0]?.trim() || 'Tidak diketahui'
    const tanggal = text.split('Tanggal Lahir')[1]?.split('Golongan Darah')[0]?.trim() || '-'
    const tinggi = text.split('Tinggi Badan')[1]?.split('Nama Panggilan')[0]?.trim() || '-'
    const panggilan = text.split('Nama Panggilan')[1]?.trim() || '-'

    let caption = `
❏──「  *Member Ditemukan* 」
│👤 *Nama:* ${nama}
│🆔 *UID:* ${uid}
│🎂 *Tanggal Lahir:* ${tanggal}
│📏 *Tinggi Badan:* ${tinggi}
│💬 *Nama Panggilan:* ${panggilan}
│🔗 *URL:* ${url}
❏──────────────๑
    `.trim()

    await conn.sendFile(m.chat, photo, `${uid}.jpg`, caption, m)

    if (global.db?.data?.peopwl?.includes(uid)) {
      await conn.reply(m.chat, `✅ Member ID ini termasuk whitelist.`, m)
    } else {
      await conn.reply(m.chat, `📥 Silakan ajukan lamaran jika ingin interaksi lebih lanjut.`, m)
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Member tidak ditemukan atau terjadi kesalahan saat mengakses data.')
  }
}

handler.help = ['jkt48 <uid>']
handler.tags = ['search']
handler.command = /^jkt48$/i
handler.developer = true

export default handler