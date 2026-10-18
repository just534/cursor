let currentTweets = [];
let currentFilters = {};

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadTweets();
});

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('authorCount').textContent = stats.authors;
    document.getElementById('recentCount').textContent = stats.recent;
  } catch (error) {
    console.error('加载统计信息失败:', error);
  }
}

async function loadTweets(filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/tweets?${params}`);
    const data = await response.json();
    
    currentTweets = data.tweets;
    displayTweets(data.tweets);
    loadStats();
  } catch (error) {
    console.error('加载推文失败:', error);
    document.getElementById('tweetsList').innerHTML = `
      <div class="empty-state">
        <h3>❌ 加载失败</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function displayTweets(tweets) {
  const container = document.getElementById('tweetsList');
  
  if (tweets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>📭 暂无推文</h3>
        <p>点击"添加推文"按钮开始收集内容</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tweets.map(tweet => `
    <div class="tweet-card">
      <div class="tweet-header">
        <div class="tweet-author">
          <h3>${escapeHtml(tweet.author)}</h3>
          ${tweet.author_handle ? `<span class="handle">${escapeHtml(tweet.author_handle)}</span>` : ''}
        </div>
        <div class="tweet-meta">
          ${tweet.posted_at ? `<div>📅 ${formatDate(tweet.posted_at)}</div>` : ''}
          <div>💾 ${formatDate(tweet.collected_at)}</div>
        </div>
      </div>
      
      <div class="tweet-content">${escapeHtml(tweet.content)}</div>
      
      ${tweet.tags ? `
        <div class="tweet-tags">
          ${tweet.tags.split(',').map(tag => `<span class="tag">#${tag.trim()}</span>`).join('')}
        </div>
      ` : ''}
      
      ${tweet.notes ? `
        <div class="tweet-notes">
          <strong>📝 笔记:</strong> ${escapeHtml(tweet.notes)}
        </div>
      ` : ''}
      
      <div class="tweet-footer">
        <a href="${escapeHtml(tweet.link)}" target="_blank" class="tweet-link">🔗 查看原推文</a>
        <div class="tweet-actions">
          <button class="btn btn-secondary" onclick="editTweet(${tweet.id})">✏️ 编辑</button>
          <button class="btn btn-danger" onclick="deleteTweet(${tweet.id})">🗑️ 删除</button>
        </div>
      </div>
    </div>
  `).join('');
}

function showAddForm() {
  document.getElementById('addFormContainer').style.display = 'block';
  document.getElementById('addTweetForm').reset();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAddForm() {
  document.getElementById('addFormContainer').style.display = 'none';
}

function autoFillFromLink() {
  const link = document.getElementById('link').value;
  if (!link) {
    alert('请先输入推文链接');
    return;
  }

  const match = link.match(/status\/(\d+)/);
  if (match) {
    document.getElementById('tweet_id').value = match[1];
  }

  const authorMatch = link.match(/x\.com\/([^\/]+)\//);
  if (authorMatch) {
    const handle = '@' + authorMatch[1];
    if (!document.getElementById('author_handle').value) {
      document.getElementById('author_handle').value = handle;
    }
  }

  alert('✓ 已从链接提取可用信息');
}

async function addTweet(event) {
  event.preventDefault();
  
  const formData = {
    tweet_id: document.getElementById('tweet_id').value,
    author: document.getElementById('author').value,
    author_handle: document.getElementById('author_handle').value,
    content: document.getElementById('content').value,
    link: document.getElementById('link').value,
    posted_at: document.getElementById('posted_at').value,
    tags: document.getElementById('tags').value,
    notes: document.getElementById('notes').value
  };

  try {
    const response = await fetch('/api/tweets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert('✓ 推文添加成功！');
      hideAddForm();
      loadTweets(currentFilters);
    } else {
      alert('❌ ' + result.error);
    }
  } catch (error) {
    alert('❌ 添加失败: ' + error.message);
  }
}

async function editTweet(id) {
  try {
    const response = await fetch(`/api/tweets/${id}`);
    const tweet = await response.json();

    document.getElementById('edit_id').value = tweet.id;
    document.getElementById('edit_link').value = tweet.link;
    document.getElementById('edit_author').value = tweet.author;
    document.getElementById('edit_author_handle').value = tweet.author_handle || '';
    document.getElementById('edit_content').value = tweet.content;
    document.getElementById('edit_posted_at').value = tweet.posted_at ? tweet.posted_at.slice(0, 16) : '';
    document.getElementById('edit_tags').value = tweet.tags || '';
    document.getElementById('edit_notes').value = tweet.notes || '';

    document.getElementById('editModal').style.display = 'flex';
  } catch (error) {
    alert('❌ 加载推文失败: ' + error.message);
  }
}

async function updateTweet(event) {
  event.preventDefault();
  
  const id = document.getElementById('edit_id').value;
  const formData = {
    author: document.getElementById('edit_author').value,
    author_handle: document.getElementById('edit_author_handle').value,
    content: document.getElementById('edit_content').value,
    link: document.getElementById('edit_link').value,
    posted_at: document.getElementById('edit_posted_at').value,
    tags: document.getElementById('edit_tags').value,
    notes: document.getElementById('edit_notes').value
  };

  try {
    const response = await fetch(`/api/tweets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (response.ok) {
      alert('✓ 推文更新成功！');
      closeEditModal();
      loadTweets(currentFilters);
    } else {
      alert('❌ ' + result.error);
    }
  } catch (error) {
    alert('❌ 更新失败: ' + error.message);
  }
}

async function deleteTweet(id) {
  if (!confirm('确定要删除这条推文吗？此操作无法撤销。')) {
    return;
  }

  try {
    const response = await fetch(`/api/tweets/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (response.ok) {
      alert('✓ 推文删除成功！');
      loadTweets(currentFilters);
    } else {
      alert('❌ ' + result.error);
    }
  } catch (error) {
    alert('❌ 删除失败: ' + error.message);
  }
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

function handleSearch() {
  const filters = {
    search: document.getElementById('searchInput').value,
    author: document.getElementById('authorFilter').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value
  };

  Object.keys(filters).forEach(key => {
    if (!filters[key]) delete filters[key];
  });

  currentFilters = filters;
  loadTweets(filters);
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('authorFilter').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  currentFilters = {};
  loadTweets();
}

function exportData(format) {
  window.location.href = `/api/export/${format}`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

window.onclick = function(event) {
  const modal = document.getElementById('editModal');
  if (event.target === modal) {
    closeEditModal();
  }
}
