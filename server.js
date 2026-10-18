const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

const dbPath = path.join(__dirname, 'xread.db');
const db = new Database(dbPath);

app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/api/tweets', (req, res) => {
  try {
    const { search, author, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM tweets WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (content LIKE ? OR author LIKE ? OR notes LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (author) {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }

    if (startDate) {
      query += ' AND posted_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND posted_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY posted_at DESC, collected_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const tweets = db.prepare(query).all(...params);
    
    let countQuery = 'SELECT COUNT(*) as total FROM tweets WHERE 1=1';
    const countParams = params.slice(0, -2);
    
    if (search) {
      countQuery += ' AND (content LIKE ? OR author LIKE ? OR notes LIKE ?)';
    }
    if (author) {
      countQuery += ' AND author LIKE ?';
    }
    if (startDate) {
      countQuery += ' AND posted_at >= ?';
    }
    if (endDate) {
      countQuery += ' AND posted_at <= ?';
    }

    const { total } = db.prepare(countQuery).get(...countParams);

    res.json({ tweets, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tweets/:id', (req, res) => {
  try {
    const tweet = db.prepare('SELECT * FROM tweets WHERE id = ?').get(req.params.id);
    if (tweet) {
      res.json(tweet);
    } else {
      res.status(404).json({ error: '推文未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tweets', (req, res) => {
  try {
    const { tweet_id, author, author_handle, content, link, posted_at, tags, notes } = req.body;

    if (!author || !content || !link) {
      return res.status(400).json({ error: '作者、内容和链接为必填项' });
    }

    const stmt = db.prepare(`
      INSERT INTO tweets (tweet_id, author, author_handle, content, link, posted_at, tags, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(tweet_id, author, author_handle, content, link, posted_at, tags, notes);
    
    res.status(201).json({ 
      id: result.lastInsertRowid,
      message: '推文添加成功' 
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: '该推文链接已存在' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.put('/api/tweets/:id', (req, res) => {
  try {
    const { author, author_handle, content, link, posted_at, tags, notes } = req.body;

    const stmt = db.prepare(`
      UPDATE tweets 
      SET author = ?, author_handle = ?, content = ?, link = ?, posted_at = ?, tags = ?, notes = ?
      WHERE id = ?
    `);

    const result = stmt.run(author, author_handle, content, link, posted_at, tags, notes, req.params.id);

    if (result.changes > 0) {
      res.json({ message: '推文更新成功' });
    } else {
      res.status(404).json({ error: '推文未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tweets/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM tweets WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes > 0) {
      res.json({ message: '推文删除成功' });
    } else {
      res.status(404).json({ error: '推文未找到' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/export/:format', (req, res) => {
  try {
    const tweets = db.prepare('SELECT * FROM tweets ORDER BY posted_at DESC').all();
    const format = req.params.format;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="xread-export.json"');
      res.json(tweets);
    } else if (format === 'markdown') {
      let markdown = '# Xread 导出数据\n\n';
      markdown += `导出时间: ${new Date().toLocaleString('zh-CN')}\n`;
      markdown += `总计: ${tweets.length} 条推文\n\n`;
      markdown += '---\n\n';

      tweets.forEach((tweet, index) => {
        markdown += `## ${index + 1}. ${tweet.author}\n\n`;
        markdown += `**发布时间**: ${tweet.posted_at || '未知'}\n\n`;
        markdown += `**链接**: ${tweet.link}\n\n`;
        markdown += `**内容**:\n\n${tweet.content}\n\n`;
        if (tweet.tags) {
          markdown += `**标签**: ${tweet.tags}\n\n`;
        }
        if (tweet.notes) {
          markdown += `**笔记**: ${tweet.notes}\n\n`;
        }
        markdown += '---\n\n';
      });

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="xread-export.md"');
      res.send(markdown);
    } else {
      res.status(400).json({ error: '不支持的导出格式' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM tweets').get().count;
    const authors = db.prepare('SELECT COUNT(DISTINCT author) as count FROM tweets').get().count;
    const recent = db.prepare("SELECT COUNT(*) as count FROM tweets WHERE collected_at >= datetime('now', '-7 days')").get().count;

    res.json({ total, authors, recent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Xread 服务已启动!`);
  console.log(`📍 访问地址: http://localhost:${PORT}`);
  console.log(`💾 数据库: ${dbPath}\n`);
});

process.on('SIGINT', () => {
  db.close();
  console.log('\n数据库连接已关闭');
  process.exit(0);
});
