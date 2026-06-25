import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { AXIS_STATEMENTS } from './data.js';

let coreMesh, wireframe, coreGlow, axisDiv;
let currentAxisIndex = 0;
let lastSwitchTime = 0;

export function createCore() {
  const group = new THREE.Group();

  const innerGeo = new THREE.IcosahedronGeometry(1.45, 2);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xfffaf0, roughness: 0.45, metalness: 0.18,
    emissive: 0xff8a8a, emissiveIntensity: 0.12,
  });
  coreMesh = new THREE.Mesh(innerGeo, innerMat);
  group.add(coreMesh);

  const wireGeo = new THREE.IcosahedronGeometry(1.62, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xd64545, wireframe: true, transparent: true, opacity: 0.28,
  });
  wireframe = new THREE.Mesh(wireGeo, wireMat);
  group.add(wireframe);

  const glowGeo = new THREE.SphereGeometry(2.1, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffa0a0, transparent: true, opacity: 0.08, side: THREE.BackSide,
  });
  coreGlow = new THREE.Mesh(glowGeo, glowMat);
  group.add(coreGlow);

  // ブランド
  const brandDiv = document.createElement('div');
  brandDiv.className = 'core-label';
  brandDiv.textContent = 'Yumichi OS';
  const brand = new CSS2DObject(brandDiv);
  brand.position.set(0, 0, 0);
  group.add(brand);

  // 軸（巡回表示）
  axisDiv = document.createElement('div');
  axisDiv.className = 'core-axis';
  axisDiv.textContent = AXIS_STATEMENTS[0];
  const axis = new CSS2DObject(axisDiv);
  axis.position.set(0, 0, 0);
  group.add(axis);

  return group;
}

export function updateCore(t) {
  if (!coreMesh) return;
  coreMesh.rotation.y = t * 0.18;
  coreMesh.rotation.x = Math.sin(t * 0.3) * 0.08;
  wireframe.rotation.y = -t * 0.12;
  wireframe.rotation.z = t * 0.06;
  const pulse = 1 + Math.sin(t * 1.4) * 0.05;
  coreGlow.scale.setScalar(pulse);

  // 軸を5秒ごとに切り替え（フェード付き）
  if (axisDiv && t - lastSwitchTime > 5) {
    lastSwitchTime = t;
    currentAxisIndex = (currentAxisIndex + 1) % AXIS_STATEMENTS.length;
    axisDiv.style.opacity = '0';
    setTimeout(() => {
      axisDiv.textContent = AXIS_STATEMENTS[currentAxisIndex];
      axisDiv.style.opacity = '0.75';
    }, 400);
  }
}
