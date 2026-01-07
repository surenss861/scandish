import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePhoneDemoTexture } from "../../hooks/usePhoneDemoTexture.js";

// Screen mesh is "Object_55" with material "Display" - we'll use it for positioning, then hide it
const SCREEN_MESH_NAME = "Object_55";

function applyTextureToMesh(mesh, tex) {
  // Configure texture properly
  if (!tex || !tex.image) {
    console.error("❌ Texture or texture image is null!");
    return;
  }

  console.log("🎨 Applying texture:", {
    width: tex.image.width,
    height: tex.image.height,
    format: tex.format,
    type: tex.type
  });

  tex.flipY = false; // Critical: match GLTF UV expectations
  tex.needsUpdate = true;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false; // Disable mipmaps for crisp text
  tex.colorSpace = THREE.SRGBColorSpace; // Ensure sRGB for proper whites

  // Option A: MeshBasicMaterial (unlit billboard) - simplest + most reliable
  // MeshBasicMaterial doesn't support emissive properties, so we use map only
  const makeMat = () => {
    const mat = new THREE.MeshBasicMaterial({
      map: tex, // The demo texture as the main map
      color: new THREE.Color(0xffffff), // Pure white so texture shows at full brightness
      toneMapped: false, // Critical: don't tone map the screen
      transparent: false,
    });
    mat.needsUpdate = true;
    console.log("✅ Created MeshBasicMaterial with map:", !!mat.map);
    return mat;
  };

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(() => makeMat());
  } else {
    mesh.material = makeMat();
  }

  mesh.material.needsUpdate = true;
}

export default function IPhoneModel({ heroScale = 2.45, onLoaded }) {
  const { scene } = useGLTF("/models/scandish.glb");
  const screenTex = usePhoneDemoTexture();
  const screenPlaneRef = useRef(null);
  const screenAnchorRef = useRef(null);

  // CRITICAL: Don't clone - modify the actual scene instance that gets rendered
  // Cloning was causing us to modify the wrong object
  const root = useMemo(() => scene, [scene]);

  // Debug: Print mesh info to find the real screen mesh
  useEffect(() => {
    const meshes = [];

    root.traverse((obj) => {
      if (obj.isMesh) {
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);

        const area = size.x * size.y;
        const flat = Math.max(size.x, size.y) / Math.max(1e-6, size.z);

        meshes.push({ name: obj.name, area, flat, material: obj.material?.name });
      }
    });

    console.log("📱 Mesh analysis (sorted by screen-likeness):");
    meshes
      .sort((a, b) => b.flat * b.area - a.flat * a.area)
      .slice(0, 25)
      .forEach((m) =>
        console.log(
          "[mesh]",
          m.name,
          "| material:",
          m.material,
          "| area:",
          m.area.toFixed(4),
          "| flat:",
          m.flat.toFixed(1)
        )
      );
  }, [root]);

  // OPTION A: Replace GLB screen with our own plane (bulletproof approach)
  useEffect(() => {
    if (!screenTex || !screenTex.image) {
      console.warn("⚠️ Screen texture not ready yet");
      return;
    }

    let screenMesh = null;
    const glassMeshes = [];
    const filterMeshes = []; // Mirror_filter, Tint_back_glass, etc.

    root.traverse((obj) => {
      if (obj.isMesh) {
        // Find screen mesh (Object_55) - we'll use it for positioning, then hide it
        if (obj.name === SCREEN_MESH_NAME) {
          screenMesh = obj;
        }
        // Find glass layers
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        const objName = (obj.name ?? "").toLowerCase();
        if (matName.includes("glass") || objName.includes("glass")) {
          glassMeshes.push(obj);
        }
        // Find filter/overlay meshes that might block the screen
        if (objName.includes("filter") || objName.includes("mirror") || objName.includes("tint") ||
          matName.includes("filter") || matName.includes("mirror") || matName.includes("tint")) {
          filterMeshes.push(obj);
        }
      }
    });

    // Hide ALL original screen-related meshes
    if (screenMesh) {
      console.log("🚫 Hiding original screen mesh:", screenMesh.name);
      screenMesh.visible = false;
    }

    filterMeshes.forEach((filter) => {
      console.log("🚫 Hiding filter/overlay mesh:", filter.name);
      filter.visible = false;
    });

    glassMeshes.forEach((glass) => {
      const name = (glass.name ?? "").toLowerCase();
      const matName = glass.material?.name?.toLowerCase?.() ?? "";
      if (name.includes("14") || name.includes("53") || name.includes("front") ||
        name.includes("tint") || matName.includes("tint") || matName.includes("mirror") ||
        name.includes("display") || matName.includes("display")) {
        console.log("🚫 Hiding front glass/display:", glass.name);
        glass.visible = false;
      } else {
        // Other glass - make very transparent
        if (Array.isArray(glass.material)) {
          glass.material.forEach((mat) => {
            if (mat) {
              mat.opacity = 0.2;
              mat.transparent = true;
              mat.needsUpdate = true;
            }
          });
        } else {
          glass.material.opacity = 0.2;
          glass.material.transparent = true;
          glass.material.needsUpdate = true;
        }
      }
    });

    // Create anchor group that follows the screen mesh's world position
    if (screenMesh && screenAnchorRef.current) {
      screenMesh.updateWorldMatrix(true, false);
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      const worldScale = new THREE.Vector3();
      screenMesh.matrixWorld.decompose(worldPos, worldQuat, worldScale);

      // Get screen mesh LOCAL size (before world transforms) to avoid double-scaling
      // We'll use the mesh's geometry bounding box, not world-space size
      screenMesh.updateMatrixWorld(false);
      const localBox = new THREE.Box3();
      screenMesh.geometry.computeBoundingBox();
      if (screenMesh.geometry.boundingBox) {
        localBox.copy(screenMesh.geometry.boundingBox);
        // Apply local transform to get actual local size
        localBox.applyMatrix4(screenMesh.matrix);
      } else {
        // Fallback: use world size but account for scale
        const worldBox = new THREE.Box3().setFromObject(screenMesh);
        const worldSize = new THREE.Vector3();
        worldBox.getSize(worldSize);
        localBox.setFromCenterAndSize(new THREE.Vector3(), worldSize);
      }

      const localSize = new THREE.Vector3();
      localBox.getSize(localSize);

      console.log("📐 Screen mesh local size:", localSize.x.toFixed(3), "x", localSize.y.toFixed(3));
      console.log("📍 Screen world position:", worldPos.x.toFixed(3), worldPos.y.toFixed(3), worldPos.z.toFixed(3));
      console.log("🔍 World scale:", worldScale.x.toFixed(3), worldScale.y.toFixed(3), worldScale.z.toFixed(3));

      // Position anchor at screen location (use world position/rotation, but scale = 1 to avoid double-scaling)
      screenAnchorRef.current.position.copy(worldPos);
      screenAnchorRef.current.quaternion.copy(worldQuat);
      screenAnchorRef.current.scale.set(1, 1, 1); // Don't apply world scale - we'll size the plane directly

      // Create plane geometry using LOCAL size (already accounts for mesh scale)
      // Slightly inset to avoid edge clipping
      const planeWidth = localSize.x * 0.95;
      const planeHeight = localSize.y * 0.95;

      if (screenPlaneRef.current) {
        screenPlaneRef.current.geometry.dispose();
        screenPlaneRef.current.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

        // Apply texture to our plane
        screenTex.flipY = false;
        screenTex.needsUpdate = true;
        screenTex.wrapS = THREE.ClampToEdgeWrapping;
        screenTex.wrapT = THREE.ClampToEdgeWrapping;
        screenTex.minFilter = THREE.LinearFilter;
        screenTex.magFilter = THREE.LinearFilter;
        screenTex.generateMipmaps = false;
        screenTex.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({
          map: screenTex,
          color: new THREE.Color(0xffffff),
          toneMapped: false,
          transparent: false,
        });

        screenPlaneRef.current.material = material;
        screenPlaneRef.current.material.needsUpdate = true;
        screenPlaneRef.current.visible = true;

        // Make plane "unmissable" for testing: double-sided, render on top, bigger z-offset
        screenPlaneRef.current.material.side = THREE.DoubleSide;
        screenPlaneRef.current.renderOrder = 999; // Render on top
        screenPlaneRef.current.material.depthTest = false; // Ignore depth for testing
        screenPlaneRef.current.material.depthWrite = false;

        // Bigger Z offset to ensure it's in front (0.01 instead of 0.001)
        screenPlaneRef.current.position.z += 0.01;

        console.log("✅ Created replacement screen plane:", planeWidth.toFixed(3), "x", planeHeight.toFixed(3));
      }
    }

    // Hide holder/stand meshes
    const holderNames = ["holder", "stand", "base", "mount", "support", "dock"];
    root.traverse((obj) => {
      if (obj.isMesh) {
        const name = (obj.name ?? "").toLowerCase();
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        if (holderNames.some((h) => name.includes(h) || matName.includes(h))) {
          obj.visible = false;
        }
      }
    });

    onLoaded?.();
  }, [root, screenTex, onLoaded]);

  // Keep plane aligned with screen mesh (in case phone rotates)
  useFrame(() => {
    if (!screenAnchorRef.current || !screenPlaneRef.current) return;

    // Find screen mesh again to track its position
    let screenMesh = null;
    root.traverse((obj) => {
      if (obj.isMesh && obj.name === SCREEN_MESH_NAME) {
        screenMesh = obj;
      }
    });

    if (screenMesh) {
      screenMesh.updateWorldMatrix(true, false);
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      const worldScale = new THREE.Vector3();
      screenMesh.matrixWorld.decompose(worldPos, worldQuat, worldScale);

      screenAnchorRef.current.position.copy(worldPos);
      screenAnchorRef.current.quaternion.copy(worldQuat);
      screenAnchorRef.current.scale.copy(worldScale);
    }
  });

  // Hide holder/stand meshes (one-time setup)
  useEffect(() => {
    const holderNames = ["holder", "stand", "base", "mount", "support", "dock"];
    root.traverse((obj) => {
      if (obj.isMesh) {
        const name = (obj.name ?? "").toLowerCase();
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        if (holderNames.some((h) => name.includes(h) || matName.includes(h))) {
          obj.visible = false;
        }
      }
    });
  }, [root]);

  return (
    <group>
      {/* Original iPhone model (screen hidden, body visible) */}
      <primitive object={root} scale={heroScale} />

      {/* Replacement screen plane - positioned where original screen was */}
      <group ref={screenAnchorRef}>
        <mesh ref={screenPlaneRef}>
          {/* Geometry will be set in useEffect based on screen mesh size */}
          <planeGeometry args={[1, 2]} />
          <meshBasicMaterial
            color={0x00ff00} // Temporary green until texture loads
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload("/models/scandish.glb");
