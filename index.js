const axios = require('axios')
const cheerio = require('cheerio')
const fs_promise = require('fs').promises

const formatDate = (dateStr) => {
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    const [hari, tanggalBulanTahun] = dateStr.split(', ')
    const [tanggal, bulanAngka, tahun] = tanggalBulanTahun.split('.')
    
    const bulanNama = bulan[parseInt(bulanAngka, 10) - 1]
    
    return `${hari}, ${tanggal} ${bulanNama} ${tahun}`
}

const detail_theater = (title) => {
    const theater_data = {
        "Cara Meminum Ramune": {
            "banner": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723710050/48drl_ramune_banner_gwan76.png",
            "poster": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723710134/48drl_ramune_poster_ha8et0.jpg",
            "title_jp": "Ramune no Nomikata",
            "description": "Pernahkah kamu meminum Ramune? Meskipun tidak bisa diminum sekaligus, tapi Ramune tetap dapat kita rasakan kesegarannya dalam setiap tetesnya. Seperti nikmatnya Ramune tersebut, para member JKT48 New Era siap untuk memberikanmu keceriaan dan semangat baru, melalui setiap lagu yang ada di dalam setlist Cara Meminum Ramune (Ramune no Nomikata) ini."
        },
        "Aturan Anti Cinta": {
            "banner": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723707536/48drl_rkj_banner_knyfkp.png",
            "poster": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723707723/48drl_rkj_poster_q9ecov.jpg",
            "title_jp": "Renai Kinshi Jourei",
            "description": "Setlist legendaris telah kembali! Ini adalah pertunjukan yang menjadi langkah awal JKT48 saat pertama kali berdiri. Seperti apakah new era JKT48 membawakannya? Bersiaplah menyaksikan 16 lagu yang akan menggetarkan hatimu dengan beragam bentuk dari cinta."
        },
        "Tunas di Balik Seragam": {
            "banner": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723710050/48drl_snm_banner_igora1.png",
            "poster": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723710050/48drl_snm_poster_txqfnv.png",
            "title_jp": "Seifuku no Me",
            "description": "Satu lagi setlist yang dinanti dari JKT48 kini telah kembali. Seperti apakah warna dari para member JKT48 New Era ini pada saat membawakannya? Tentunya pertunjukan dengan penuh sisi energik dan perasaan dari member di setiap lagunya akan menggetarkan hatimu."
        },
        "Sambil Menggandeng Erat Tanganku": {
            "banner": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1725884210/48drl_twt_banner_smk1i9.jpg",
            "poster": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1725884210/48drl_twt_poster_ycjmew.jpg",
            "title_jp": "Te Wo Tsunaginagara",
            "description": ""
        },
        "Ingin Bertemu": {
            "banner": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723710048/48drl_aitakatta_banner_pl4z4w.jpg",
            "poster": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723710048/48drl_aitakatta_poster_bupowd.jpg",
            "title_jp": "Aitakatta",
            "description": "Manis dan pahitnya sebuah pertemuan akan dapat kalian rasakan melalui pertunjukan “Ingin Bertemu” yang dipersembahkan oleh JKT48 Trainee."
        },
        "Pajama Drive": {
            "banner": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723708198/48drl_pajama_banner_kluw81.jpg",
            "poster": "https://res.cloudinary.com/dyad4ewsx/image/upload/v1723708198/48drl_pajama_poster_v9ldp5.jpg",
            "title_jp": "Pajama Drive",
            "description": "Dengan penuh semangat dan keceriaan, Trainee JKT48 siap membawakan pertunjukan legendaris, yang pertama kali dibawakan pada tahun 2012 oleh Generasi 1 JKT48. Seperti apakah penampilan yang akan ditunjukkan oleh para generasi penerus? Mari bersama-sama rasakan energi yang luar biasa dari para member Trainee JKT48, dengan formasi yang jauh berbeda dari biasanya!"
        }
    }
    return theater_data[title]
}

const getTheater = async () => {
    try {
        const response = await axios.get("https://takagi.sousou-no-frieren.workers.dev/theater/schedule")
        const html = response.data
        const $ = cheerio.load(html)
        
        const title_web = $('title').text()
        if (title_web !== "Teater JKT48 | Jadwal Pertunjukan") {
            console.log("Data not found")
            return
        }
        
        // select body content
        const table = $('div.table-responsive.table-pink__scroll').eq(1)
        const tbody = table.find('table tbody')
        const rows = tbody.find('tr').toArray()
        
        // theater content data
        const data_theater = []
        
        for (const element of rows) {
            // setting date time
            const date_raw = $(element).find('td').eq(0).text().trim().split('Show ')
            const date = formatDate(date_raw[0])
            const time = `${date_raw[1]} WIB`
            const show_date = `${date} | ${time}`
            
            // setting details
            const setlist = $(element).find('td').eq(1).text().trim()
            let member = $(element).find('td').eq(2).find('a').map((i, el) => $(el).text().trim()).get()
            const birthday = $(element).find('td').eq(2).find('a[style="color:#616D9D"]').map((i, el) => $(el).text().trim()).get().join(', ')
            
            const detail = await detail_theater(setlist)
            const poster = detail ? detail.poster : ''
            const banner = detail ? detail.banner : ''
            const setlist_jp = detail ? detail.title_jp : ''
            const description = detail ? detail.description : ''            

            if (member.length > 16) member.splice(16);
            
            // push to array
            data_theater.push({
                show_date: show_date,
                setlist: setlist,
                setlist_jp: setlist_jp,
                description: description,
                image: {
                    banner: banner,
                    poster: poster,
                },
                birthday: birthday,
                lineups: member
            })
        }
        data_theater.reverse()
        
        const filepath = "theater.json"
        try {
            await fs_promise.writeFile(filepath, JSON.stringify(data_theater, null, 2))
            console.log('Theater data successfully written to theater.json')
        } catch (error) {
            console.log('Error writing theater data to theater.json')
        }
    } catch (error) {
        console.log("Error get data")
    }
}

async function main() {
    await getTheater()
}
main()
