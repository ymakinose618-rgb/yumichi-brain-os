import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { DEFAULT_FOLDERS, EDGES, DEFAULT_NOTE_TYPE } from './data.js';
import { loadState, saveState } from './storage.js';
import { createCore, updateCore } from './core.js';
import { createFolders, createEdges, updateFolders, setMessMode, refreshFolderLabel } from './folders.js';
import { initUI, openFolderPanel } from './ui.js';

const canvas = document.getElementById('scene');
const labelsRoot = document.getElementById('labels');

const scene = new THREE.Scene();
// 脳スープの深度を fog で表現
scene.fog = new THREE.Fog(0x0a0d14, 22, 60);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3.5, 17);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const labelRenderer = new CSS2DRenderer({ element: labelsRoot });
labelRenderer.setSize(window.innerWidth, window.innerHeight);

// 環境光 = default-mode の冷たい青
scene.add(new THREE.AmbientLight(0x8faed4, 0.55));
// キーライト = 皮質を照らす暖色（琥珀寄りのシナプス光）
const keyLight = new THREE.DirectionalLight(0xf4d9b0, 0.75);
keyLight.position.set(5, 8, 6);
scene.add(keyLight);
// フィルライト = 逆側から default-mode blue の弱光
const fillLight = new THREE.DirectionalLight(0x4a8fd6, 0.35);
fillLight.position.set(-6, -2, 4);
scene.add(fillLight);
// リムライト = コアから放つ発火の赤
const rimLight = new THREE.PointLight(0xff3d5a, 1.2, 26);
rimLight.position.set(0, 0, 0);
scene.add(rimLight);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.5;
controls.minDistance = 6;
controls.maxDistance = 28;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.25;

const particleCount = 220;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 50;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// 空間に漂う微粒子 = 神経路の残光。琥珀色の微光で脳空間を満たす
const particles = new THREE.Points(
  particleGeo,
  new THREE.PointsMaterial({ color: 0xf4a95c, size: 0.04, transparent: true, opacity: 0.48 }),
);
scene.add(particles);

const core = createCore();
scene.add(core);

let state = loadState() || {
  folders: DEFAULT_FOLDERS.map(f => ({ ...f, memos: [] })),
  messMode: false,
};
// 旧データに type を補う（観察）
state.folders.forEach(f => {
  if (!Array.isArray(f.memos)) f.memos = [];
  f.memos.forEach(m => { if (!m.type) m.type = DEFAULT_NOTE_TYPE; });
});

let foldersGroup = createFolders(state.folders);
scene.add(foldersGroup);

let edgesMesh = createEdges(EDGES);
scene.add(edgesMesh);

initUI({
  state,
  onMessModeChange: (mode) => {
    state.messMode = mode;
    document.body.classList.toggle('mess-mode', mode);
    setMessMode(mode, state.folders);
    saveState(state);
  },
  onAddFolder: (name) => {
    const id = 'f-' + Date.now().toString(36);
    state.folders.push({ id, name, memos: [] });
    saveState(state);
    rebuildFolders();
  },
  onDeleteFolder: (id) => {
    state.folders = state.folders.filter(f => f.id !== id);
    saveState(state);
    rebuildFolders();
  },
  onAddMemo: (folderId, text, type) => {
    const folder = state.folders.find(f => f.id === folderId);
    if (!folder) return;
    folder.memos.push({
      id: 'm-' + Date.now().toString(36),
      text,
      type: type || DEFAULT_NOTE_TYPE,
      createdAt: Date.now(),
    });
    saveState(state);
    refreshFolderLabel(folder);
    if (state.messMode) setMessMode(true, state.folders);
  },
  onDeleteMemo: (folderId, memoId) => {
    const folder = state.folders.find(f => f.id === folderId);
    if (!folder) return;
    folder.memos = folder.memos.filter(m => m.id !== memoId);
    saveState(state);
    refreshFolderLabel(folder);
    if (state.messMode) setMessMode(true, state.folders);
  },
});

function rebuildFolders() {
  scene.remove(foldersGroup);
  scene.remove(edgesMesh);
  foldersGroup.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  });
  if (edgesMesh.geometry) edgesMesh.geometry.dispose();
  if (edgesMesh.material) edgesMesh.material.dispose();
  foldersGroup = createFolders(state.folders);
  scene.add(foldersGroup);
  edgesMesh = createEdges(EDGES);
  scene.add(edgesMesh);
  setMessMode(state.messMode, state.folders);
}

if (state.messMode) {
  document.body.classList.add('mess-mode');
  setMessMode(true, state.folders);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDownPos = null;

canvas.addEventListener('pointerdown', (e) => {
  pointerDownPos = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('pointerup', (e) => {
  if (!pointerDownPos) return;
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  const moved = Math.hypot(dx, dy);
  pointerDownPos = null;
  if (moved > 6) return;

  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(foldersGroup.children, true);
  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj && !obj.userData?.id) obj = obj.parent;
    if (obj?.userData?.id) {
      controls.autoRotate = false;
      openFolderPanel(obj.userData.id);
    }
  }
});

let userInteracted = false;
controls.addEventListener('start', () => {
  controls.autoRotate = false;
  if (!userInteracted) {
    userInteracted = true;
    document.getElementById('hint')?.classList.add('fade');
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function animate() {
  const t = clock.getElapsedTime();
  controls.update();
  updateCore(t);
  updateFolders(t, state.messMode, camera.position, state.folders);
  particles.rotation.y = t * 0.015;
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

setTimeout(() => {
  if (!userInteracted) document.getElementById('hint')?.classList.add('fade');
}, 8000);
