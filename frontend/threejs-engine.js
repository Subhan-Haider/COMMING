import * as THREE from "three";

const canvas = document.getElementById("void-canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2400);
camera.position.z = 58;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);

const pointer = new THREE.Vector2();
const inertialPointer = new THREE.Vector2();
const clock = new THREE.Clock();

const starCount = window.innerWidth < 700 ? 1200 : 2400;
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i += 1) {
  const i3 = i * 3;
  const radius = 12 + Math.random() * 78;
  const angle = Math.random() * Math.PI * 2;
  starPositions[i3] = Math.cos(angle) * radius;
  starPositions[i3 + 1] = Math.sin(angle) * radius;
  starPositions[i3 + 2] = -Math.random() * 1200;

  const color = new THREE.Color().setHSL(0.52 + Math.random() * 0.22, 0.74, 0.45);
  starColors[i3] = color.r;
  starColors[i3 + 1] = color.g;
  starColors[i3 + 2] = color.b;
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 0.78,
  vertexColors: true,
  transparent: true,
  opacity: 0.42,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const starfield = new THREE.Points(starGeometry, starMaterial);
scene.add(starfield);

const tunnelGeometry = new THREE.TorusGeometry(34, 0.06, 8, 180);
const tunnelGroup = new THREE.Group();
for (let i = 0; i < 28; i += 1) {
  const ring = new THREE.Mesh(
    tunnelGeometry,
    new THREE.MeshBasicMaterial({
      color: i % 2 ? 0x37f7ff : 0x9a5cff,
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
    }),
  );
  ring.position.z = -i * 28;
  ring.rotation.z = i * 0.21;
  tunnelGroup.add(ring);
}
scene.add(tunnelGroup);

const blackHole = new THREE.Mesh(
  new THREE.SphereGeometry(7, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 }),
);
blackHole.position.z = -180;
scene.add(blackHole);

const accretion = new THREE.Mesh(
  new THREE.TorusGeometry(11, 0.55, 16, 150),
  new THREE.MeshBasicMaterial({
    color: 0x00aecd,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
  }),
);
accretion.position.z = -180;
accretion.rotation.x = 1.12;
scene.add(accretion);

const gravityGlow = new THREE.PointLight(0x4d7dff, 2.4, 310);
gravityGlow.position.set(0, 0, -130);
scene.add(gravityGlow);

function updatePointer(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("pointermove", (event) => updatePointer(event.clientX, event.clientY), { passive: true });
window.addEventListener("touchmove", (event) => {
  if (event.touches[0]) updatePointer(event.touches[0].clientX, event.touches[0].clientY);
}, { passive: true });

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", resize);

function animate() {
  const elapsed = clock.getElapsedTime();
  const delta = Math.min(clock.getDelta(), 0.033);
  inertialPointer.lerp(pointer, 0.045);

  camera.position.x = inertialPointer.x * 5.2;
  camera.position.y = inertialPointer.y * 3.4;
  camera.rotation.z = -inertialPointer.x * 0.045;
  camera.lookAt(inertialPointer.x * 2.2, inertialPointer.y * 1.6, -160);

  const positions = starGeometry.attributes.position.array;
  for (let i = 0; i < starCount; i += 1) {
    const i3 = i * 3;
    const pull = Math.max(0.2, 1 - Math.abs(positions[i3 + 2]) / 1200);
    positions[i3] *= 1 - pull * delta * 0.18;
    positions[i3 + 1] *= 1 - pull * delta * 0.18;
    positions[i3 + 2] += (48 + pull * 92) * delta;

    if (positions[i3 + 2] > 45) {
      const radius = 18 + Math.random() * 86;
      const angle = Math.random() * Math.PI * 2;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = -1180;
    }
  }
  starGeometry.attributes.position.needsUpdate = true;

  starfield.rotation.z = elapsed * 0.018;
  tunnelGroup.rotation.z = elapsed * 0.075;
  tunnelGroup.children.forEach((ring, index) => {
    ring.position.z += 34 * delta;
    ring.scale.setScalar(1 + Math.sin(elapsed * 1.4 + index) * 0.018);
    if (ring.position.z > 38) ring.position.z = -760;
  });

  accretion.rotation.z = elapsed * 0.8;
  accretion.rotation.y = Math.sin(elapsed * 0.4) * 0.16;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
