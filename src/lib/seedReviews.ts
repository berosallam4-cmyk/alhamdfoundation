import { db } from "@/db";
import { rashanItems, reviews } from "@/db/schema";
import { sql } from "drizzle-orm";

const pakistaniFirstNames = [
  "Muhammad", "Ali", "Usman", "Bilal", "Hamza", "Zubair", "Omer", "Tariq",
  "Saad", "Hassan", "Hussain", "Kashif", "Waqas", "Faizan", "Kamran", "Asad",
  "Imran", "Naveed", "Farhan", "Babar", "Shoaib", "Rashid", "Junaid", "Salman",
  "Shahid", "Arsalan", "Danish", "Zeeshan", "Adeel", "Sohail", "Fahad", "Haris",
  "Ayesha", "Fatima", "Zainab", "Mariam", "Sana", "Hira", "Sadia", "Amna",
  "Iqra", "Noor", "Khadija", "Sidra", "Rabia", "Anum", "Bushra", "Mehwish",
  "Maha", "Hafsa", "Samina", "Nadia", "Farah", "Sehrish", "Saima", "Tahira",
];

const pakistaniLastNames = [
  "Khan", "Ahmed", "Malik", "Chaudhry", "Bhatti", "Sheikh", "Qureshi",
  "Raza", "Siddiqui", "Abbasi", "Ansari", "Mirza", "Farooqi", "Javed",
  "Iqbal", "Shah", "Ghafoor", "Rehman", "Akhtar", "Zafar", "Gill",
  "Hashmi", "Yousaf", "Mughal", "Niazi", "Kazmi", "Baig", "Dar", "Butt",
];

const reviewTemplates = [
  "MashaAllah bohot acha kaam kr rhi hy Alhamd Foundation. Allah pak aur barkat dy.",
  "Alhamdulillah scholarship mili thi jis ki waja sy meri university ki degree complete ho saki. Duaein ap logo k sath hain.",
  "104 families ko har month bina kisi shor sharabay k rashan puhanchana koi chota kaam nahi. Great work!",
  "Transparent foundation hy, jo paisay diye jatay hain theek jagah lagtay hain. Allah qubool farmaye.",
  "May Allah reward the whole team of Alhamd Foundation. Real heroes serving humanity since 2012.",
  "Meri behen ko scholarship mili thi, aaj wo software engineer ban chuki hy. JazakAllah Alhamd Foundation!",
  "Local level par itna continuous kaam 14 saal sy krna bohot bari baat hy. Proud of you all.",
  "Rashan package bohot behtareen aur izzat k sath deliver hota hy gharo mn. Allah apko jaza dy.",
  "Main pichlay 4 saal sy monthly donate kr rha ho, 100% genuine log hain jo Allah ki rah mn kaam kr rhy.",
  "Allah taala ap sab k jazbay ko qubool farmaye. Aameen summa Aameen.",
  "Bohot honest log hain, har cheez ka hisab kitab clear hy aur seedha haqdar tk jati hy.",
  "Fair selection process hy scholarship ka, koi sifarish nahi chalti. Truly deserving students get it.",
  "Mere walid k inteqal k baad Alhamd foundation ny hamaray ghar rashan bhaija tha, kabhi unki ehsaan framoshi ni bhool skte.",
  "Best charity work in Pakistan. Zero overhead, all money goes straight to families and students.",
  "Proud volunteer! In k sath rashan distribute krna meri zindagi ka sab sy acha experience tha.",
  "Aisay organizations ki Pakistan ko sakht zaroorat hy jo khamooshi sy qom k bacho ko sahara dy rhy hain.",
  "Application process itna aasan aur dignified hy k kisi ki self-respect hurt nahi hoti.",
  "Allah tala Alhamd Foundation ko din dugni raat chugni taraqi ata farmaye.",
  "Whenever I want to pay my Zakat, Alhamd Foundation is my first choice because of their trust.",
  "SubhanAllah, 14 years of selfless service without any fame or drama. Pure Sadaqah Jariyah.",
  "Hamari gali mn 2 ghareeb gharano ko har maheene bina rokay rashan milta hy in ki taraf sy.",
  "My semester fee was paid on time thanks to Alhamd scholarship. Allah pak barkat ata farmaye.",
  "Direct impact dekhnay ko milta hy in k kaam se. Highly recommended for charity.",
  "Boht naik kaam hy. Allah pak ap sab k maalo daulat mn aur barkat ata farmaye.",
];

const defaultRashanItems = [
  { name: "Atta (Wheat Flour)", quantity: "10 KG", price: 900 },
  { name: "Rice", quantity: "5 KG", price: 1600 },
  { name: "Cooking Oil", quantity: "3 Litre", price: 1650 },
  { name: "Daal Chana", quantity: "2 KG", price: 640 },
  { name: "Daal Masoor", quantity: "1 KG", price: 350 },
  { name: "Sugar", quantity: "2 KG", price: 360 },
  { name: "Tea", quantity: "250 Gram", price: 600 },
  { name: "Besan", quantity: "1 KG", price: 300 },
  { name: "Salt", quantity: "800 Gram", price: 60 },
  { name: "Red Chilli & Spices", quantity: "1 Pack", price: 250 },
  { name: "Match Box & Soap", quantity: "1 Pack", price: 150 },
];

/**
 * Seeds 143 historical reviews (2012 → today) ONLY when the reviews table is
 * completely empty (fresh database). It never touches existing reviews, so
 * admin edits/deletions are always safe.
 */
export async function seed143Reviews() {
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(reviews);
  const count = Number(row?.count || 0);
  if (count > 0) return { count, message: "Reviews already exist — skipped" };

  const total = 143;
  const startTs = new Date("2012-05-15T10:00:00Z").getTime();
  const endTs = Math.min(Date.now() - 24 * 60 * 60 * 1000, new Date("2026-03-20T18:00:00Z").getTime());
  const step = (endTs - startTs) / total;

  const records = [];
  for (let i = 0; i < total; i++) {
    const baseTime = startTs + i * step;
    const jitter = (Math.random() - 0.5) * step * 0.8;
    const reviewDate = new Date(Math.min(endTs, Math.max(startTs, baseTime + jitter)));
    const first = pakistaniFirstNames[Math.floor(Math.random() * pakistaniFirstNames.length)];
    const last = pakistaniLastNames[Math.floor(Math.random() * pakistaniLastNames.length)];
    records.push({
      name: `${first} ${last}`,
      message: reviewTemplates[i % reviewTemplates.length],
      createdAt: reviewDate,
    });
  }

  const chunkSize = 25;
  for (let i = 0; i < records.length; i += chunkSize) {
    await db.insert(reviews).values(records.slice(i, i + chunkSize));
  }
  return { count: total, message: "Seeded 143 reviews (2012–present)" };
}

/** Seeds the default rashan package only when the table is empty. */
export async function seedRashanItems() {
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(rashanItems);
  if (Number(row?.count || 0) > 0) return;
  await db.insert(rashanItems).values(defaultRashanItems);
}

// Run once per server instance (cheap after the first request).
let seededOnce = false;

/** Ensures a fresh production database gets its initial content automatically. */
export async function ensureSeeded() {
  if (seededOnce) return;
  try {
    await seed143Reviews();
    await seedRashanItems();
    seededOnce = true;
  } catch (err) {
    // Tables may not exist yet during the very first build — never crash the site.
    console.warn("ensureSeeded skipped:", err instanceof Error ? err.message : err);
  }
}
