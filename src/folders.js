import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const FOLDER_RADIUS = 7.5;
const folderMeshes = new Map();
let edgesGroup = null;
let edgesData = [];

export function createFolders(folders) {
  const group = new THREE.Group();
  folderMeshes.clear();

  const positions = fibonacciSphere(Math.max(folders.length, 1), FOLDER_RADIUS);

  folders.forEach((folder, i) => {
    const mesh = createFolderMesh(folder);
    mesh.position.copy(positions[i]);
    mesh.lookAt(0, 0, 0);
    group.add(mesh);
    folderMeshes.set(folder.id, {
      group: mesh,
      basePos: positions[i].clone(),
      phase: Math.random() * Math.PI * 2,
      memoCards: [],
    });
  });

  return group;
}

// 領域間の関係線。LineSegments で edges 数 × 2 の頂点を毎フレーム更新する。
export function createEdges(edges) {
  edgesData = edges.filter(([a, b]) => folderMeshes.has(a) && folderMeshes.has(b));
  const positions = new Float32Array(Math.max(edgesData.length, 1) * 6);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // 関係線 = 白質の神経路
  const mat = new THREE.LineBasicMaterial({
    color: 0xe8ded0, transparent: true, opacity: 0.24,
  });
  edgesGroup = new THREE.LineSegments(geo, mat);
  return edgesGroup;
}

function updateEdges() {
  if (!edgesGroup || edgesData.length === 0) return;
  const attr = edgesGroup.geometry.attributes.position;
  edgesData.forEach(([a, b], i) => {
    const pa = folderMeshes.get(a)?.group.position;
    const pb = folderMeshes.get(b)?.group.position;
    if (!pa || !pb) return;
    attr.setXYZ(i * 2, pa.x, pa.y, pa.z);
    attr.setXYZ(i * 2 + 1, pb.x, pb.y, pb.z);
  });
  attr.needsUpdate = true;
}

function createFolderMesh(folder) {
  const group = new THREE.Group();

  // 違和感発火ハロー：違和感が溜まった領域でγ波リズムで脈動する
  const haloGeo = new THREE.PlaneGeometry(2.4, 1.8);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff3d5a, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.z = -0.12;
  group.add(halo);

  // 領域の本体 = 灰白質のマットな面
  const bodyGeo = new THREE.BoxGeometry(1.6, 1.2, 0.18);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x8a7d6e, roughness: 0.78, metalness: 0.06,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // タブ = inbox は発火の赤、他は皮質ハイライト色
  const isInbox = folder.id === 'inbox';
  const tabColor = isInbox ? 0xff3d5a : 0xc9bda8;
  const tabGeo = new THREE.BoxGeometry(0.55, 0.18, 0.18);
  const tabMat = new THREE.MeshStandardMaterial({ color: tabColor, roughness: 0.55 });
  const tab = new THREE.Mesh(tabGeo, tabMat);
  tab.position.set(-0.42, 0.6 + 0.09, 0);
  group.add(tab);

  // 下辺のアクセント = 白質のライン
  const accentGeo = new THREE.PlaneGeometry(1.3, 0.03);
  const accentMat = new THREE.MeshBasicMaterial({
    color: 0xe8ded0, transparent: true, opacity: 0.5,
  });
  const accent = new THREE.Mesh(accentGeo, accentMat);
  accent.position.set(0, -0.42, 0.092);
  group.add(accent);

  const labelDiv = document.createElement('div');
  labelDiv.className = 'folder-label';
  labelDiv.textContent = formatLabel(folder);
  const label = new CSS2DObject(labelDiv);
  label.position.set(0, -0.95, 0);
  group.add(label);

  group.userData = { type: 'folder', id: folder.id, labelDiv, halo };
  return group;
}

function formatLabel(folder) {
  const total = folder.memos?.length ?? 0;
  const friction = folder.memos?.filter(m => m.type === 'friction').length ?? 0;
  if (total === 0) return folder.name;
  if (friction > 0) return `${folder.name} · ${total}件 / 違和感 ${friction}`;
  return `${folder.name} · ${total}件`;
}

export function refreshFolderLabel(folder) {
  const data = folderMeshes.get(folder.id);
  if (!data) return;
  const div = data.group.userData.labelDiv;
  if (div) div.textContent = formatLabel(folder);
}

function fibonacciSphere(count, radius) {
  const points = [];
  const phi = Math.PI * (Math.sqrt(5) - 1);
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    points.push(new THREE.Vector3(
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ));
  }
  return points;
}

export function updateFolders(t, messMode, cameraPos, folders) {
  folderMeshes.forEach(({ group, basePos, phase, memoCards }, id) => {
    const folder = folders?.find(f => f.id === id);
    const frictionCount = folder?.memos?.filter(m => m.type === 'friction').length ?? 0;

    if (messMode) {
      const dx = Math.sin(t * 0.6 + phase) * 0.4;
      const dy = Math.cos(t * 0.45 + phase * 1.2) * 0.4;
      const dz = Math.sin(t * 0.5 + phase * 0.8) * 0.4;
      group.position.set(basePos.x + dx, basePos.y + dy, basePos.z + dz);
      group.rotation.set(
        Math.sin(t * 0.3 + phase) * 0.4,
        t * 0.15 + phase,
        Math.sin(t * 0.5 + phase) * 0.25,
      );
    } else {
      const dy = Math.sin(t * 0.5 + phase) * 0.12;
      group.position.set(basePos.x, basePos.y + dy, basePos.z);
      if (cameraPos) group.lookAt(cameraPos);
      else group.lookAt(0, 0, 0);
    }

    // 違和感発火：違和感が3件以上でγ波リズム(~40Hz を可視化スケールに落として ~1.6Hz)
    const halo = group.userData.halo;
    if (halo) {
      const intensity = Math.min(frictionCount / 3, 1);
      const gamma = 0.55 + 0.45 * Math.sin(t * 3.8 + phase);
      halo.material.opacity = intensity * 0.5 * gamma;
      halo.scale.setScalar(1 + intensity * 0.22 * gamma);
    }

    memoCards.forEach((card, i) => {
      const offset = card.userData.offset;
      const drift = Math.sin(t * 0.8 + card.userData.phase) * 0.18;
      const orbit = t * 0.25 + i;
      // 自動化候補は中央コア側へ寄せる（システム化レイヤーへ流れる動き）
      const inward = card.userData.inward ?? 0;
      const shrink = 1 - inward * 0.35;
      card.position.set(
        offset.x * shrink + Math.sin(orbit) * 0.35,
        offset.y * shrink + drift,
        offset.z * shrink + Math.cos(orbit) * 0.35,
      );
    });
  });

  updateEdges();
}

export function setMessMode(messMode, folders) {
  folderMeshes.forEach((data) => {
    data.memoCards.forEach(card => data.group.remove(card));
    data.memoCards = [];
  });

  if (!messMode) return;

  folders.forEach(folder => {
    const data = folderMeshes.get(folder.id);
    if (!data) return;
    folder.memos.forEach((memo, i) => {
      const div = document.createElement('div');
      div.className = `memo-card memo-type-${memo.type || 'observation'}`;
      div.textContent = memo.text;
      const card = new CSS2DObject(div);
      const angle = (i / Math.max(folder.memos.length, 1)) * Math.PI * 2 + Math.random() * 0.6;
      const radial = 1.8 + Math.random() * 1.0;
      card.position.set(
        Math.cos(angle) * radial,
        Math.sin(angle * 1.3) * 1.4 + (Math.random() - 0.5) * 0.5,
        Math.sin(angle) * radial * 0.5,
      );
      card.userData = {
        offset: card.position.clone(),
        phase: Math.random() * Math.PI * 2,
        inward: memo.type === 'system' ? 1 : 0,
      };
      data.group.add(card);
      data.memoCards.push(card);
    });
  });
}
