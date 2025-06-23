const api = {
  register: body => fetch('/api/auth/register', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
  }).then(res => res.json()),
  login: body => fetch('/api/auth/login', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body)
  }).then(res => res.json()),
  getPosts: () => fetch('/api/posts').then(r => r.json()),
  createPost: (content, token) => fetch('/api/posts', {
    method: 'POST', headers: {
      'Content-Type':'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ content })
  }).then(r => r.json()),
  likePost: (id, token) => fetch(`/api/posts/${id}/like`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  }).then(r => r.json()),
  commentPost: (id, text, token) => fetch(`/api/posts/${id}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ text })
  }).then(r => r.json()),
};

let token = null;

document.getElementById('login-btn').onclick = async () => {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const res = await api.login({ username: u, password: p });
  if (res.token) { token = res.token; showFeed(); }
  else alert(res.error);
};

document.getElementById('reg-btn').onclick = async () => {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  const res = await api.register({ username: u, password: p });
  alert(res.message || res.error);
};

document.getElementById('post-btn').onclick = async () => {
  const content = document.getElementById('new-post').value;
  await api.createPost(content, token);
  loadPosts();
};

async function showFeed() {
  document.getElementById('login-area').classList.add('hidden');
  document.getElementById('main-feed').classList.remove('hidden');
  loadPosts();
}

async function loadPosts() {
  const posts = await api.getPosts();
  const container = document.getElementById('posts');
  container.innerHTML = '';
  posts.forEach(p => {
    const el = document.createElement('div');
    el.className = 'post';
    el.innerHTML = `
      <p><strong>${p.user.username}</strong> · ${new Date(p.createdAt).toLocaleString()}</p>
      <p>${p.content}</p>
      <button data-id="${p._id}" class="like-btn">❤️ ${p.likes.length}</button>
      <div>
        <input placeholder="Comment..." data-id="${p._id}" class="comment-input"/>
        <button data-id="${p._id}" class="comment-btn">Comment</button>
      </div>
      <div class="comments"></div>
    `;
    container.appendChild(el);
  });

  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const res = await api.likePost(id, token);
      btn.innerText = `❤️ ${res.likes}`;
    };
  });

  document.querySelectorAll('.comment-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const input = document.querySelector(`.comment-input[data-id="${id}"]`);
      const res = await api.commentPost(id, input.value, token);
      const div = document.querySelector(`.post button[data-id="${id}"]`).parentNode.nextElementSibling;
      div.innerHTML += `<p><em>${res.user.username}</em>: ${res.text}</p>`;
      input.value = '';
    };
  });
}
