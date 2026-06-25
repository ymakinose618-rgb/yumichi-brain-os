import { NOTE_TYPES, DEFAULT_NOTE_TYPE } from './data.js';

let _state, _opts;
let currentFolderId = null;
let currentNoteType = DEFAULT_NOTE_TYPE;

const panel = document.getElementById('panel');
const panelTitle = document.getElementById('panelTitle');
const memoList = document.getElementById('memoList');
const memoInput = document.getElementById('memoInput');
const addMemoBtn = document.getElementById('addMemoBtn');
const closeBtn = document.getElementById('closeBtn');
const messToggle = document.getElementById('messToggle');
const addFolderBtn = document.getElementById('addFolderBtn');
const deleteFolderBtn = document.getElementById('deleteFolderBtn');
const addFolderModal = document.getElementById('addFolderModal');
const newFolderName = document.getElementById('newFolderName');
const cancelAddFolder = document.getElementById('cancelAddFolder');
const confirmAddFolder = document.getElementById('confirmAddFolder');
const typePills = document.getElementById('memoTypes');

export function initUI(opts) {
  _state = opts.state;
  _opts = opts;

  // 観察の4類型 ピル生成
  Object.entries(NOTE_TYPES).forEach(([key, def]) => {
    const btn = document.createElement('button');
    btn.className = 'type-pill' + (key === currentNoteType ? ' active' : '');
    btn.dataset.type = key;
    btn.textContent = def.label;
    btn.title = def.desc;
    btn.style.setProperty('--type-color', def.color);
    btn.addEventListener('click', () => {
      currentNoteType = key;
      typePills.querySelectorAll('.type-pill').forEach(p =>
        p.classList.toggle('active', p.dataset.type === key));
    });
    typePills.appendChild(btn);
  });

  messToggle.checked = !!_state.messMode;

  messToggle.addEventListener('change', () => {
    _opts.onMessModeChange(messToggle.checked);
  });

  closeBtn.addEventListener('click', closePanel);

  addMemoBtn.addEventListener('click', addMemo);
  memoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addMemo();
  });

  addFolderBtn.addEventListener('click', openAddFolderModal);
  cancelAddFolder.addEventListener('click', closeAddFolderModal);
  confirmAddFolder.addEventListener('click', confirmFolderAdd);
  newFolderName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmFolderAdd();
    if (e.key === 'Escape') closeAddFolderModal();
  });
  addFolderModal.addEventListener('click', (e) => {
    if (e.target === addFolderModal) closeAddFolderModal();
  });

  deleteFolderBtn.addEventListener('click', () => {
    if (!currentFolderId) return;
    if (confirm('この領域を削除しますか？中の観察も全て消えます。')) {
      _opts.onDeleteFolder(currentFolderId);
      closePanel();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (addFolderModal.getAttribute('aria-hidden') === 'false') {
        closeAddFolderModal();
      } else if (panel.getAttribute('aria-hidden') === 'false') {
        closePanel();
      }
    }
  });
}

function openAddFolderModal() {
  addFolderModal.setAttribute('aria-hidden', 'false');
  newFolderName.value = '';
  setTimeout(() => newFolderName.focus(), 80);
}

function closeAddFolderModal() {
  addFolderModal.setAttribute('aria-hidden', 'true');
}

function confirmFolderAdd() {
  const name = newFolderName.value.trim();
  if (!name) return;
  _opts.onAddFolder(name);
  closeAddFolderModal();
}

export function openFolderPanel(folderId) {
  const folder = _state.folders.find(f => f.id === folderId);
  if (!folder) return;
  currentFolderId = folderId;
  panelTitle.textContent = folder.name;
  renderMemos(folder);
  panel.setAttribute('aria-hidden', 'false');
  setTimeout(() => memoInput.focus(), 200);
}

function closePanel() {
  panel.setAttribute('aria-hidden', 'true');
  currentFolderId = null;
}

function renderMemos(folder) {
  memoList.innerHTML = '';
  if (!folder.memos || folder.memos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'memo-empty';
    empty.textContent = 'まだ観察はありません';
    memoList.appendChild(empty);
    return;
  }
  folder.memos.slice().reverse().forEach(memo => {
    const type = memo.type || DEFAULT_NOTE_TYPE;
    const typeDef = NOTE_TYPES[type] || NOTE_TYPES[DEFAULT_NOTE_TYPE];

    const li = document.createElement('li');
    li.className = `memo-item memo-type-${type}`;

    const badge = document.createElement('span');
    badge.className = 'memo-badge';
    badge.textContent = typeDef.label;
    badge.style.setProperty('--type-color', typeDef.color);
    li.appendChild(badge);

    const textSpan = document.createElement('span');
    textSpan.className = 'memo-text';
    textSpan.textContent = memo.text;
    li.appendChild(textSpan);

    const delBtn = document.createElement('button');
    delBtn.className = 'del';
    delBtn.textContent = '×';
    delBtn.title = '削除';
    delBtn.addEventListener('click', () => {
      _opts.onDeleteMemo(folder.id, memo.id);
      const refreshed = _state.folders.find(f => f.id === folder.id);
      if (refreshed) renderMemos(refreshed);
    });
    li.appendChild(delBtn);
    memoList.appendChild(li);
  });
}

function addMemo() {
  const text = memoInput.value.trim();
  if (!text || !currentFolderId) return;
  _opts.onAddMemo(currentFolderId, text, currentNoteType);
  memoInput.value = '';
  const folder = _state.folders.find(f => f.id === currentFolderId);
  if (folder) renderMemos(folder);
}
