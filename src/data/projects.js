/**
 * Har bir loyiha — keys tuzilmasida:
 *   problem      muammo va cheklovlar
 *   constraints  cheklovlar roʻyxati (chip)
 *   decisions    arxitektura qarorlari va nega aynan shunday
 *   results      raqamlardagi natija (value + label)
 *
 * Raqamlar loyihalarning oʻz kodidan va jonli nusxalaridan olingan, taxmin emas.
 */
export const projects = [
  {
    id: 'teachermuzaffar',
    index: '01',
    title: 'teachermuzaffar.uz',
    tagline: 'Veb portal',
    status: { label: 'Onlayn', tone: 'green' },
    description:
      'Uyga vazifa, baholar va davomatni bitta joyda yuritadigan, Telegram Mini App sifatida ham ochiladigan oʻquv platformasi.',
    stack: ['Supabase', 'PostgreSQL', 'Supabase Auth', 'JavaScript', 'Realtime DB'],
    url: 'https://teachermuzaffar.uz',
    shots: {
      alt: 'teachermuzaffar.uz bosh sahifasi: "English Teacher — Muzaffar Amirov" sarlavhasi, tizimga kirish tugmasi va uyga vazifa, baholar hamda Telegram bot boʻlimlari',
      caption: 'Haqiqiy skrinshot · teachermuzaffar.uz',
      width: 1440,
      height: 900,
    },
    problem:
      'Oʻqituvchi baholarni qogʻoz jurnalda, uyga vazifani Telegram chatlarida, davomatni alohida daftarda yuritardi — oylik hisobot uchun uchta manbani qoʻlda solishtirish kerak edi. Oʻquvchilar platformaga asosan telefonidan, koʻpincha Telegram ichidan kiradi; sinfda kompyuter yoʻq.',
    constraints: [
      'Telegram WebView, mobil-birinchi',
      'Serversiz statik hosting',
      'Rolga qarab kirish',
      'Ochiq dashboardlar orasida jonli sinxron',
    ],
    decisions: [
      {
        choice: 'Supabase: PostgreSQL + Auth + Realtime',
        why: 'Alohida backend yozmaslik uchun jadval, kirish va realtime obuna bitta xizmatdan olinadi. RLS siyosatlari rolni bazaning oʻzida tekshiradi, yaʼni himoyani kliyentga tashlab qoʻyish shart emas.',
      },
      {
        choice: 'Frameworkʼsiz vanilla JavaScript',
        why: 'Telegram WebView uchun eng arzon variant: build qadami yoʻq, sahifa `python3 -m http.server` bilan ham ishlaydi, bundle va gidratsiya kutish vaqti yoʻq.',
      },
      {
        choice: 'Jurnal (10 ballik) va davomat — alohida jadvallar',
        why: 'Bir darsda qatnashuv va baho bitta ekranda kiritiladi, lekin oylik hisobot ikki jadvalni sanash bilan yigʻiladi. Hammasini bitta jadvalga tiqishtirish hisobotni buzardi.',
      },
      {
        choice: 'Speaking topshirigʻi Telegram bot orqali',
        why: 'Ovozli yoki video javobni saytga yuklashdan koʻra Telegramʼda yuborish osonroq; bot faylni qabul qiladi va natija jurnalga tushadi.',
      },
      {
        choice: 'jsdom smoke va Python bot-check testlari',
        why: 'Build tizimi yoʻqligi sababli DOM oqimlari jsdomʼda, bot oqimi esa alohida Python skriptida tekshiriladi — deploydan oldingi yagona toʻsiq shu.',
      },
    ],
    results: [
      { value: '0', label: 'framework / build qadami' },
      { value: '3', label: 'modul: vazifa, jurnal, davomat' },
      { value: '2', label: 'interfeys tili: UZ / EN' },
      { value: '10', label: 'ballik baholash shkalasi' },
    ],
  },
  {
    id: 'echoes-of-room-404',
    index: '02',
    title: 'Echoes of Room 404',
    tagline: '3D veb oʻyin',
    status: { label: 'Prototip', tone: 'amber' },
    description:
      'St. Jude kasalxonasining 404-xonasida kechadigan, brauzerda oflayn oʻynaladigan birinchi shaxs qoʻrqinchli oʻyin.',
    stack: ['Three.js', 'Web Audio API', 'TypeScript', 'Vite'],
    url: null,
    shots: {
      alt: 'Echoes of Room 404 oʻyinning titul ekrani: "DR. ARIS — THE MAD SURGEON", Room 404, 1987 va "OPEN YOUR EYES" tugmasi',
      caption: 'Haqiqiy skrinshot · oʻyinning ochilish ekrani',
      width: 1440,
      height: 829,
    },
    problem:
      'Brauzerda qoʻrqinchli atmosfera uchun yorugʻlik, pozitsion ovoz va kolliziya kerak, lekin toʻliq oʻyin dvigateli (Unity, Godot) oʻnlab megabayt yuk va WebGL eksport muammosini olib kelardi. Oʻyin server va tashqi APIʼsiz, oddiy statik hostingda ishlashi shart edi.',
    constraints: [
      'Oflayn: server soʻrovi yoʻq',
      'Bitta statik host (GitHub Pages)',
      'Yuklab olishni kutmaslik',
    ],
    decisions: [
      {
        choice: 'Three.js — yagona runtime kutubxona',
        why: 'Dvigatel oʻrniga faqat renderer: 0.170 versiyasidan boshqa runtime bogʻliqlik yoʻq, TypeScript va Vite bilan build qilinadi. WebGL ustidan toʻliq nazorat qoladi, yuk esa bitta paketga tushadi.',
      },
      {
        choice: 'Procedural raycast kolliziya, fizika dvigatelsiz',
        why: 'Xona toʻrtburchak koridorlardan iborat: tayyor fizika dvigateli ortiqcha ogʻirlik va nozik sozlash talab qilardi. Raycast devor boʻylab sirpanishni kam kod bilan aniq beradi.',
      },
      {
        choice: 'Web Audio API bilan pozitsion ovoz',
        why: 'Ovoz manbai xonadagi joyiga bogʻlanadi (qadamlar, monitor shovqini), tashqi audio kutubxonasiz — qoʻshimcha hajm va litsenziya tashvishisiz.',
      },
      {
        choice: 'standalone/ nusxasi va ildiz index.html yoʻnaltirishi',
        why: 'GitHub Pages “Deploy from a branch” rejimida qolishi mumkin: u holda repo ildizidagi build qilinmagan index.html eʼlon qilinadi. Shuning uchun build natijasi standalone/ ga koʻchiriladi, ildiz fayl esa visitorʼni oʻsha yerga yoʻnaltiradi — repo sozlamalariga tegmasdan.',
      },
    ],
    results: [
      { value: '1', label: 'runtime kutubxona (three)' },
      { value: '0', label: 'server soʻrovi — oflayn' },
      { value: '26 MB', label: 'audio va tekstura aktivlari' },
      { value: '1', label: 'qoʻlda yozilgan kolliziya qatlami' },
    ],
  },
  {
    id: 'telegram-automation',
    index: '03',
    title: 'Telegram Auto-Bots',
    tagline: 'Avtomatlashtirish',
    status: { label: 'Ishlamoqda', tone: 'cyan' },
    description:
      'Sayt formasi va Telegram botini bitta jarayonda birlashtirgan avtomatlashtirish: xabar yoʻqolmaydi, ochiq endpoint esa flooddan himoyalangan.',
    stack: ['Python', 'aiogram', 'aiohttp', 'Telegram Bot API', 'Render'],
    url: null,
    problem:
      'Saytdagi bogʻlanish formasi xabarni toʻgʻridan-toʻgʻri Telegramga yetkazishi kerak edi, lekin bu endpoint autentifikatsiyasiz va dunyoning istalgan IPʼsidan keladi. Bot tokeni esa faqat serverda turishi shart, alohida backend va alohida bot jarayoni esa byudjetga sigʻmasdi.',
    constraints: [
      'Ochiq, authsiz HTTP endpoint',
      'Bitta kichik jarayon',
      'Token kliyentga chiqmasin',
    ],
    decisions: [
      {
        choice: 'aiohttp va aiogram — bitta processda',
        why: 'HTTP qatlam va bot polling bitta asyncio loopʼda ishlaydi: alohida servis, navbat yoki proksi kerak emas. / yoʻli health-check boʻlib, hostingning tiriklik tekshiruviga javob beradi.',
      },
      {
        choice: 'Fail-closed: token yoki ADMIN_ID yoʻq boʻlsa 503',
        why: 'Yetkazib boʻlmaydigan xabarni “qabul qildim” deb qaytarish — jimgina yoʻqotish. Shuning uchun konfiguratsiya toʻliq boʻlmasa endpoint ochiq xato qaytaradi va log sababni yozadi.',
      },
      {
        choice: 'IP boʻyicha 5 soʻrov / 10 daqiqa, 2048 IP chegarasi',
        why: 'Oyna floodni toʻxtatish uchun yetarli, xotira esa cheklangan: eng eski IPʼlar tashlab yuboriladi, shuning uchun lugʻat cheksiz oʻsmaydi.',
      },
      {
        choice: 'Maydon chegaralari 80/120/3500 va HTML escape',
        why: 'Telegram xabar limitidan oshmaslik uchun, hamda parse_mode HTML ichida foydalanuvchi matni teglarni buzmasligi uchun har bir qiymat escape qilinadi.',
      },
      {
        choice: '17 ta pytest — tarmoqsiz',
        why: 'Handler oqimi mock bot bilan sinaladi: 405, 400, 422, 429, 502, 503 javoblari va muvaffaqiyatli yetkazish — deploy va haqiqiy token boʻlmasa ham.',
      },
    ],
    results: [
      { value: '5', label: 'soʻrov / 10 daqiqa / IP' },
      { value: '3.5k', label: 'belgi — xabar chegarasi' },
      { value: '3', label: 'handler: start, buyurtma, matn' },
      { value: '17', label: 'pytest testi' },
    ],
  },
];
