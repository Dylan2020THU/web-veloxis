import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

export function createLearningAtlas(host, layout, { onSelect, onZoom, onUnavailable }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#081521');
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', '三维学习地图：方向键旋转，加减号缩放，Home 返回全景');
  host.append(canvas);
  const labels = document.createElement('div'); labels.className = 'learning-atlas-labels'; host.append(labels);
  scene.add(new THREE.HemisphereLight('#c9e8ff', '#24333e', 2.7));
  for (const [color, intensity, position] of [['#eef5ff', 3.4, [-15, 35, 20]], ['#5f9ec5', 2.2, [20, 12, -20]]]) {
    const light = new THREE.DirectionalLight(color, intensity); light.position.set(...position); scene.add(light);
  }
  const camera = new THREE.PerspectiveCamera(45, 1, .1, 1000);
  const controls = new OrbitControls(camera, canvas);
  controls.minPolarAngle = Math.PI / 12; controls.maxPolarAngle = Math.PI * 70 / 180;
  controls.rotateSpeed = .65; controls.zoomSpeed = .8; controls.screenSpacePanning = false;
  const abort = new AbortController(), geometries = new Set(), materials = new Set();
  const listen = (target, type, fn) => target.addEventListener(type, fn, { signal: abort.signal });
  const geo = g => (geometries.add(g), g);
  const material = (color, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, metalness: .45, roughness: .45, ...extra }); materials.add(m); return m; };
  const box = geo(new THREE.BoxGeometry(1, 1, 1)), gem = geo(new THREE.OctahedronGeometry(.55));
  const dark = material('#152c3c'), silver = material('#a6bbc9', { metalness: .7, roughness: .28 }), glass = material('#254c66');
  const objects = new Map(), buttons = new Map(), links = [];
  const colors = ['#63c9f2', '#a98cf5', '#5cdbc1', '#efb774'];
  let selected = null, hovered = null, frame = 0, disposed = false, fitDistance = 180;
  function mesh(group, geometry, mat, position, scale) { const m = new THREE.Mesh(geometry, mat); m.position.set(...position); if (scale) m.scale.set(...scale); group.add(m); return m; }
  // Use the existing course hierarchy, keeping every node and its original ID.
  function place(node, root, x, z, depth) {
    const group = new THREE.Group(); group.position.set(x, 0, z);
    const color = colors[layout.districts.findIndex(d => d.node.id === root) % colors.length];
    const accent = material(color, { emissive: color, emissiveIntensity: .35 });
    const size = depth === 1 ? 8 : depth === 2 ? 4.4 : 1.8;
    mesh(group, box, dark, [0, -.3, 0], [size, .6, size * .7]);
    mesh(group, box, silver, [0, .03, 0], [size * .98, .1, size * .69]);
    mesh(group, box, glass, [0, .13, 0], [size * .95, .08, size * .66]);
    mesh(group, box, accent, [0, -.12, size * .35 + .01], [size * .8, .04, .03]);
    if (depth === 1 && root === 'P1') {
      for (let i = 0; i < 3; i++) {
        const ring = mesh(group, geo(new THREE.TorusGeometry(1.6, .065, 8, 48)), i === 0 ? accent : silver, [0, 2, 0]);
        ring.rotation.set(i * Math.PI / 3, i * Math.PI / 3, 0);
      }
      mesh(group, gem, accent, [0, 2, 0]);
    } else if (depth === 1 && root === 'P2') {
      const points = [[-2, 1, 0], [-2, 3, 0], [0, 1, 0], [0, 2.5, 0], [2, 2, 0]];
      for (const p of points) mesh(group, gem, accent, p, [.6, .6, .6]);
      for (let i = 0; i < points.length - 1; i++) {
        const curve = new THREE.LineCurve3(new THREE.Vector3(...points[i]), new THREE.Vector3(...points[i + 1]));
        mesh(group, geo(new THREE.TubeGeometry(curve, 1, .05, 6, false)), silver, [0, 0, 0]);
      }
    } else if (depth === 1 && root === 'P3') {
      for (let i = 0; i < 5; i++) mesh(group, box, i % 2 ? silver : accent, [0, .5 + i * .65, 0], [4 - i * .3, .3, 2.8 - i * .2]);
    } else if (depth === 1 && root === 'P4') {
      const ring = mesh(group, geo(new THREE.TorusGeometry(1.8, .12, 8, 48)), silver, [0, 1.5, 0]); ring.rotation.x = Math.PI / 2;
      for (let i = 0; i < 4; i++) mesh(group, gem, accent, [Math.cos(i * Math.PI / 2) * 1.8, 1.5, Math.sin(i * Math.PI / 2) * 1.8], [.65, .65, .65]);
      mesh(group, box, accent, [0, .8, 0], [1.1, 1.3, 1.1]);
    } else if (depth < 3) {
      for (let i = -1; i <= 1; i++) {
        const h = depth === 1 ? 2.6 + (i + 1) * .4 : 1 + (i + 1) * .25;
        mesh(group, box, dark, [i * size / 3.5, h / 2 + .2, 0], [size / 5, h, size / 3]);
        mesh(group, box, silver, [i * size / 3.5, h + .25, 0], [size / 5, .1, size / 3]);
        for (let y = .6; y < h; y += .5) mesh(group, box, accent, [i * size / 3.5, y, size / 6 + .02], [size / 7, .05, .03]);
      }
    } else mesh(group, gem, accent, [0, .8, 0], [.7, .7, .7]);
    group.userData = { id: node.id, root, depth, accent, color, node };
    scene.add(group); objects.set(node.id, group);
    const b = document.createElement('button'); b.dataset.depth = depth; b.dataset.nodeId = node.id; b.style.setProperty('--sector', color);
    const number = document.createElement('small'); number.textContent = depth === 1 ? root : depth === 2 ? '◇' : '◆';
    const title = document.createElement('strong'); title.textContent = depth === 1 ? node.label.split('·').slice(1).join('·').replace(/（[^）]*）/g, '').trim() : node.label; b.title = node.label; b.append(number, title); labels.append(b); buttons.set(node.id, b);
    listen(b, 'click', () => { flyTo(node.id); onSelect(node.id); });
    listen(b, 'pointerenter', () => { hovered = node.id; request(); }); listen(b, 'pointerleave', () => { hovered = null; request(); });
    listen(b, 'focus', () => { hovered = node.id; request(); }); listen(b, 'blur', () => { hovered = null; request(); });
  }
  layout.districts.forEach(({ node }, index) => {
    const x = (index % 2 ? 1 : -1) * 38, z = (index < 2 ? -1 : 1) * 35;
    place(node, node.id, x, z, 1);
    node.children.forEach((chapter, i) => {
      const cx = x + (i % 4 - 1.5) * 12, cz = z + 9 + Math.floor(i / 4) * 12;
      place(chapter, node.id, cx, cz, 2);
      const descendants = [];
      function collect(n) { for (const child of n.children) { descendants.push(child); collect(child); } }
      collect(chapter);
      descendants.forEach((child, j) => {
        const angle = j * Math.PI * 2 / Math.min(10, descendants.length), radius = 4 + Math.floor(j / 10) * 2;
        place(child, node.id, cx + Math.cos(angle) * radius, cz + Math.sin(angle) * radius, child.depth);
      });
    });
  });
  function connect(from, to, prerequisite) {
    const a = objects.get(from), b = objects.get(to); if (!a || !b || from === to) return;
    const start = a.position.clone().add(new THREE.Vector3(0, .3, 0)), end = b.position.clone().add(new THREE.Vector3(0, .3, 0));
    const mid = start.clone().lerp(end, .5); mid.y = prerequisite ? Math.min(10, start.distanceTo(end) * .15 + 2) : .6;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    let line;
    if (prerequisite) {
      line = new THREE.Group(); const mat = material('#6196b8', { transparent: true, opacity: .4, emissive: '#6196b8', emissiveIntensity: .3 });
      mesh(line, geo(new THREE.TubeGeometry(curve, 24, .075, 6, false)), mat, [0, 0, 0]);
      const arrow = mesh(line, geo(new THREE.ConeGeometry(.24, .8, 8)), mat, curve.getPoint(.78).toArray());
      arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangent(.78)); line.userData.mat = mat;
    } else {
      const mat = new THREE.LineDashedMaterial({ color: '#6992a6', transparent: true, opacity: .3, dashSize: .22, gapSize: .2 }); materials.add(mat);
      line = new THREE.Line(geo(new THREE.BufferGeometry().setFromPoints(curve.getPoints(24))), mat); line.computeLineDistances();
    }
    scene.add(line); links.push({ from, to, prerequisite, line });
  }
  for (const [id, g] of objects) { connect(g.userData.node.parentId, id, false); for (const from of g.userData.node.prereqIds) connect(from, id, true); }
  host.dataset.nodeCount = objects.size; host.dataset.relationCount = links.filter(l => l.prerequisite).length;
  const bounds = new THREE.Box3().setFromPoints([...objects.values()].map(g => g.position)), center = bounds.getCenter(new THREE.Vector3()), size = bounds.getSize(new THREE.Vector3());
  function request() { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw); }
  function draw() {
    frame = 0; if (disposed) return;
    const active = hovered || selected, related = new Set([active]);
    for (const link of links) if (link.prerequisite && (link.from === active || link.to === active)) { related.add(link.from); related.add(link.to); }
    const ratio = getZoom(), occupied = [];
    camera.updateMatrixWorld();
    const ordered = [...objects].sort(([a, ga], [b, gb]) => Number(b === active) - Number(a === active) || ga.userData.depth - gb.userData.depth);
    for (const [id, g] of ordered) {
      const { depth, node, accent, color } = g.userData;
      g.visible = depth <= 2 || related.has(id) || node.parentId === selected || (ratio > 2 && g.userData.root === objects.get(selected)?.userData.root);
      accent.color.set(color); if (!related.has(id)) accent.color.lerp(new THREE.Color('#6d8290'), .72).multiplyScalar(.7);
      const b = buttons.get(id), p = g.position.clone().add(new THREE.Vector3(0, depth === 1 ? 4.8 : 2.4, 0)).project(camera);
      b.hidden = !g.visible || p.z < -1 || p.z > 1 || Math.abs(p.x) > .95 || Math.abs(p.y) > .86 || (depth > 1 && ratio < 1.25 && !related.has(id));
      b.classList.toggle('is-active', related.has(id)); b.setAttribute('aria-pressed', String(id === selected));
      if (b.hidden) continue;
      b.style.left = (p.x + 1) / 2 * host.clientWidth + 'px'; b.style.top = (1 - p.y) / 2 * host.clientHeight + 'px';
      const rect = b.getBoundingClientRect();
      if (id !== active && occupied.some(r => rect.left < r.right + 4 && rect.right > r.left - 4 && rect.top < r.bottom + 4 && rect.bottom > r.top - 4)) b.hidden = true;
      else occupied.push(rect);
    }
    for (const { from, to, line, prerequisite } of links) {
      const lit = from === active || to === active;
      line.visible = objects.get(from).visible && objects.get(to).visible && (!prerequisite || lit || (objects.get(from).userData.depth <= 2 && objects.get(to).userData.depth <= 2));
      if (prerequisite) { line.userData.mat.opacity = lit ? .95 : .4; line.userData.mat.color.set(lit ? '#9cdfff' : '#6196b8'); }
    }
    renderer.render(scene, camera); onZoom?.(ratio);
  }
  function reset() { fitDistance = Math.max(size.x / camera.aspect, size.z * .8) / (2 * Math.tan(Math.PI / 8)) * 1.4; controls.target.copy(center); camera.position.copy(center).add(new THREE.Vector3(0, fitDistance * .65, fitDistance * .76)); controls.minDistance = 5; controls.maxDistance = fitDistance * 2; controls.update(); request(); }
  function getZoom() { return fitDistance / camera.position.distanceTo(controls.target); }
  function zoomBy(factor) { const offset = camera.position.clone().sub(controls.target); offset.setLength(THREE.MathUtils.clamp(offset.length() / factor, controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(offset); controls.update(); request(); }
  function flyTo(id) { const g = objects.get(id); if (!g) return; selected = id; const offset = camera.position.clone().sub(controls.target).setLength(g.userData.depth === 1 ? 65 : 28); controls.target.copy(g.position); camera.position.copy(g.position).add(offset); controls.update(); request(); }
  function resize() { if (!host.clientWidth || !host.clientHeight) return; camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth, host.clientHeight); request(); }
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let down = null, moved = false; const pointers = new Set();
  function pick(e) { const r = canvas.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, 1 - (e.clientY - r.top) / r.height * 2); ray.setFromCamera(mouse, camera); const hit = ray.intersectObjects([...objects.values()].filter(g => g.visible), true)[0]; let o = hit?.object; while (o && !o.userData.id) o = o.parent; return o?.userData.id; }
  listen(canvas, 'pointerdown', e => { pointers.add(e.pointerId); if (pointers.size === 1) { down = [e.clientX, e.clientY]; moved = false; } else moved = true; });
  listen(canvas, 'pointermove', e => { if (down) moved ||= Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5; else { hovered = pick(e); canvas.style.cursor = hovered ? 'pointer' : 'grab'; request(); } });
  listen(canvas, 'pointerup', e => { pointers.delete(e.pointerId); if (down && !moved && e.button === 0) { const id = pick(e); if (id) { flyTo(id); onSelect(id); } } if (!pointers.size) down = null; });
  listen(canvas, 'pointercancel', e => { pointers.delete(e.pointerId); moved = true; if (!pointers.size) down = null; });
  listen(canvas, 'pointerleave', () => { hovered = null; request(); });
  listen(canvas, 'keydown', e => { if (!['Home', '+', '=', '-', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return; e.preventDefault(); if (e.key === 'Home') return reset(); if (['+', '=', '-'].includes(e.key)) return zoomBy(e.key === '-' ? 1 / 1.2 : 1.2); const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target)); if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') spherical.theta += e.key === 'ArrowLeft' ? -.1 : .1; else spherical.phi = THREE.MathUtils.clamp(spherical.phi + (e.key === 'ArrowUp' ? -.1 : .1), controls.minPolarAngle, controls.maxPolarAngle); camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update(); request(); });
  listen(canvas, 'webglcontextlost', e => { e.preventDefault(); controls.enabled = false; onUnavailable(); });
  listen(document, 'visibilitychange', request);
  controls.addEventListener('change', request);
  const observer = new ResizeObserver(resize); observer.observe(host); resize(); reset();
  return { flyTo, reset, zoomBy, getZoom, select(id) { selected = id; request(); }, destroy() { disposed = true; cancelAnimationFrame(frame); abort.abort(); observer.disconnect(); controls.dispose(); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); renderer.dispose(); canvas.remove(); labels.remove(); } };
}
