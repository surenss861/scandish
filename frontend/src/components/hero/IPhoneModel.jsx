import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { usePhoneDemoTexture } from "../../hooks/usePhoneDemoTexture.js";

// =====================
// DEBUG TOGGLES
// =====================
const NEON_TEST = false;              // neon the chosen visible screen surface
const DEBUG_SOLO_SCREEN = false;      // hide everything except visible screen (+ notch)
const DEBUG_HIDE_GLASS = false;       // hard-hide any glass-like meshes
const FORCE_DOUBLE_SIDE = true;       // fixes "screen is backfacing" issues
const LOG_RAYCAST = true;

// If your GLB changes, keep this as a fallback only:
const FALLBACK_SCREEN_NAME = "Object_55";

// =====================
// HELPERS
// =====================
const lower = (v) => (v || "").toString().toLowerCase();

function materialLabel(mat) {
  if (!mat) return "";
  return lower(mat.name || mat.type || "");
}

function meshLabel(obj) {
  return lower(obj?.name || "");
}

function isGlassLike(mesh) {
  const n = meshLabel(mesh);
  const m = materialLabel(mesh.material);

  // keyword-based
  const keyword =
    m.includes("glass") ||
    m.includes("tint") ||
    m.includes("mirror") ||
    m.includes("filter") ||
    n.includes("glass") ||
    n.includes("tint") ||
    n.includes("mirror") ||
    n.includes("filter");

  // material-property-based (very reliable)
  const mat = mesh.material;
  const physical =
    mat &&
    (mat.transmission > 0 ||
      mat.opacity < 1 ||
      mat.transparent === true ||
      mat.type === "MeshPhysicalMaterial");

  return keyword || physical;
}

function bboxArea(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  box.getSize(size);
  // approximate front-face area (best effort)
  // screen is usually X * Y in local-ish space; take 2 largest dims
  const dims = [Math.abs(size.x), Math.abs(size.y), Math.abs(size.z)].sort((a, b) => b - a);
  return dims[0] * dims[1];
}

function worldCenter(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  box.getCenter(center);
  return center;
}

function setCoverGlassLook(mesh) {
  // Replace with a simple sheen that cannot occlude the screen
  const sheen = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.06,
    depthWrite: false,
    depthTest: true,
    toneMapped: false,
    side: FORCE_DOUBLE_SIDE ? THREE.DoubleSide : THREE.FrontSide,
  });

  // Optional: make it feel like a highlight instead of a tint
  sheen.blending = THREE.AdditiveBlending;

  mesh.material = sheen;
  mesh.renderOrder = 998;
}

function ensureUVs(mesh) {
  const geo = mesh?.geometry;
  if (!geo || !geo.attributes?.position) return;

  // Already has UVs (check count matches position count)
  if (geo.attributes.uv && geo.attributes.uv.count === geo.attributes.position.count) {
    console.log(`✅ UVs already exist on ${mesh.name}`);
    return;
  }

  console.warn(`⚠️ Generating UVs for ${mesh.name}`);
  geo.computeBoundingBox();

  const bbox = geo.boundingBox;
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);

  // Planar projection on the 2 biggest axes (more robust than assuming X/Y)
  const dims = [
    { axis: "x", v: size.x },
    { axis: "y", v: size.y },
    { axis: "z", v: size.z },
  ].sort((a, b) => b.v - a.v);

  const a0 = dims[0].axis;
  const a1 = dims[1].axis;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const p = { x, y, z };
    const u = (p[a0] - bbox.min[a0]) / (size[a0] || 1);
    const v = (p[a1] - bbox.min[a1]) / (size[a1] || 1);

    uv[i * 2 + 0] = u;
    uv[i * 2 + 1] = v;
  }

  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.attributes.uv.needsUpdate = true;
  console.log(`✅ Generated UVs for ${mesh.name}`);
}

function setScreenMaterial(mesh, demoTexture) {
  const mat = new THREE.MeshBasicMaterial({
    color: NEON_TEST ? new THREE.Color("#00ff66") : new THREE.Color("#ffffff"),
    map: NEON_TEST ? null : demoTexture,
    transparent: false,
    toneMapped: false,
    side: FORCE_DOUBLE_SIDE ? THREE.DoubleSide : THREE.FrontSide,
  });

  // avoid z-fighting with nearby cover meshes
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -1;
  mat.polygonOffsetUnits = -1;

  mesh.material = mat;
  mesh.renderOrder = 997;

  // important when swapping materials
  mesh.material.needsUpdate = true;
}

export default function IPhoneModel({ heroScale = 2.45, onLoaded }) {
  const group = useRef();
  const { camera } = useThree();
  const { scene: gltfScene } = useGLTF("/models/scandish.glb");
  const demoTexture = usePhoneDemoTexture();

  // CRITICAL: Don't clone - modify the actual scene instance that gets rendered
  const scene = useMemo(() => gltfScene, [gltfScene]);

  useEffect(() => {
    if (!scene || !camera || !demoTexture || !demoTexture.image) {
      console.warn("⚠️ Scene, camera, or texture not ready yet");
      return;
    }

    const meshes = [];
    scene.traverse((obj) => {
      if (obj && obj.isMesh) {
        meshes.push(obj);
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    // 1) Find a reasonable "target" point to raycast toward (fallback screen by name if present)
    let fallbackScreen = meshes.find((m) => m.name === FALLBACK_SCREEN_NAME);

    // also treat "display" material as strong hint
    if (!fallbackScreen) {
      fallbackScreen = meshes.find((m) => materialLabel(m.material).includes("display"));
    }

    if (!fallbackScreen) {
      console.warn("⚠️ No fallback display mesh found (Object_55 / material: display). Raycast will still run.");
      // use overall phone center as a last resort
    }

    const targetPoint = fallbackScreen ? worldCenter(fallbackScreen) : worldCenter(scene);

    // 2) Raycast from camera -> targetPoint to find what is ACTUALLY visible
    const dir = new THREE.Vector3().subVectors(targetPoint, camera.position).normalize();
    const raycaster = new THREE.Raycaster(camera.position.clone(), dir);
    raycaster.firstHitOnly = false;

    const intersects = raycaster.intersectObjects(meshes, true);

    if (LOG_RAYCAST) {
      console.log("🎯 RAYCAST hits (nearest first):");
      intersects.slice(0, 8).forEach((hit, i) => {
        const obj = hit.object;
        console.log(
          `  ${i + 1}. ${obj.name} | mat: ${obj.material?.name || obj.material?.type} | dist: ${hit.distance.toFixed(4)} | glassLike: ${isGlassLike(obj)}`
        );
      });
    }

    // 3) Choose the "visible screen surface" = first ray hit that is NOT glass-like
    const visibleSurface =
      intersects.map((h) => h.object).find((obj) => obj.isMesh && !isGlassLike(obj)) || fallbackScreen;

    if (!visibleSurface) {
      console.error("❌ No visible screen surface could be determined (raycast + fallback failed).");
      return;
    }

    // 4) Only soften/hack the glass that's actually in front of the screen (ray-hit glass)
    // Glass that is *actually between camera and screen* (from ray hits)
    const rayHitMeshes = intersects.map((h) => h.object);

    // Everything before visibleSurface in the hit stack
    const idx = rayHitMeshes.findIndex((m) => m === visibleSurface);
    const blockersInFront = idx > 0 ? rayHitMeshes.slice(0, idx) : rayHitMeshes;

    // Only convert those glass-like layers (don't touch the whole phone)
    blockersInFront.forEach((m) => {
      if (!m.isMesh) return;
      if (!isGlassLike(m)) return;

      if (DEBUG_HIDE_GLASS) {
        m.visible = false;
        return;
      }

      // Replace material completely (don't tweak PBR glass)
      m.material = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
        side: FORCE_DOUBLE_SIDE ? THREE.DoubleSide : THREE.FrontSide,
      });

      m.renderOrder = 998; // always above screen
      console.log(`🔧 Made ray-hit glass transparent: ${m.name}`);
    });

    console.log(
      `✅ Visible screen surface selected: ${visibleSurface.name} | mat: ${visibleSurface.material?.name || visibleSurface.material?.type}`
    );

    // 5) If you want a brutal confirmation: hide everything but the chosen surface (+ notch bits)
    if (DEBUG_SOLO_SCREEN) {
      meshes.forEach((m) => (m.visible = false));
      visibleSurface.visible = true;

      // keep notch/camera if you want
      meshes
        .filter((m) => {
          const n = meshLabel(m);
          return n.includes("notch") || n.includes("camera") || ["object_32", "object_28", "object_41", "object_37"].includes(n);
        })
        .forEach((m) => (m.visible = true));
    }

    // 6) Ensure UVs exist, then apply the demo material to the actual visible surface
    ensureUVs(visibleSurface);
    setScreenMaterial(visibleSurface, demoTexture);

    // if the fallback screen is different, don't let it fight for pixels
    if (fallbackScreen && fallbackScreen !== visibleSurface) {
      fallbackScreen.renderOrder = 996;
    }

    onLoaded?.();
  }, [scene, camera, demoTexture, onLoaded]);

  return (
    <group ref={group} scale={heroScale}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/scandish.glb");
