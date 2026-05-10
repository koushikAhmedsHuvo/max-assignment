const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || './quran.sqlite';
const db = new Database(dbPath, { readonly: true });

try {
  const surahs = db.prepare('SELECT COUNT(*) AS count FROM surahs').get();
  const ayahs = db.prepare('SELECT COUNT(*) AS count FROM ayahs').get();

  console.log(`Surahs: ${surahs.count}`);
  console.log(`Ayahs: ${ayahs.count}`);
} finally {
  db.close();
}
