const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'xread.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tweets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tweet_id TEXT UNIQUE,
    author TEXT NOT NULL,
    author_handle TEXT,
    content TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    posted_at TEXT,
    collected_at TEXT DEFAULT CURRENT_TIMESTAMP,
    tags TEXT,
    notes TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_author ON tweets(author);
  CREATE INDEX IF NOT EXISTS idx_posted_at ON tweets(posted_at);
  CREATE INDEX IF NOT EXISTS idx_collected_at ON tweets(collected_at);
`);

console.log('✓ 数据库初始化成功！');
console.log(`数据库位置: ${dbPath}`);

db.close();
