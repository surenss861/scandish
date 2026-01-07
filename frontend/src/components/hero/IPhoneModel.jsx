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
  const screenBloomRef = useRef(null);
  const screenAnchorRef = useRef(null);
  const screenMeshRef = useRef(null);

  // Matrix helpers for transform calculations
  const tmpM = useMemo(() => new THREE.Matrix4(), []);
  const invParentM = useMemo(() => new THREE.Matrix4(), []);

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

    let foundScreenMesh = null;
    const glassMeshes = [];
    const notchMeshes = []; // Camera, notch, speaker - keep visible
    const filterMeshes = []; // Mirror_filter, Tint_back_glass, etc.

    root.traverse((obj) => {
      if (obj.isMesh) {
        // Find screen mesh (Object_55) - we'll use it for positioning, then hide it
        if (obj.name === SCREEN_MESH_NAME) {
          foundScreenMesh = obj;
        }
        // Find glass layers
        const matName = obj.material?.name?.toLowerCase?.() ?? "";
        const objName = (obj.name ?? "").toLowerCase();
        if (matName.includes("glass") || objName.includes("glass")) {
          glassMeshes.push(obj);
        }
        // Find notch/camera/speaker meshes (keep visible for realism)
        if (objName.includes("camera") || objName.includes("notch") || objName.includes("speaker") ||
          matName.includes("camera") || matName.includes("sapphire") ||
          (objName.includes("filter") && (objName.includes("camera") || objName.includes("37") || objName.includes("18") || objName.includes("28") || objName.includes("7")))) {
          notchMeshes.push(obj);
        }
        // Find filter/overlay meshes (tint, mirror - these can block screen)
        if ((objName.includes("filter") || objName.includes("mirror") || objName.includes("tint") ||
          matName.includes("filter") || matName.includes("mirror") || matName.includes("tint")) &&
          !notchMeshes.includes(obj)) {
          filterMeshes.push(obj);
        }
      }
    });

    // Store screen mesh ref for useFrame
    screenMeshRef.current = foundScreenMesh;

    // Hide original screen mesh (we replace it with our plane)
    if (foundScreenMesh) {
      console.log("🚫 Hiding original screen mesh:", foundScreenMesh.name);
      foundScreenMesh.visible = false;
    }

    // Hide tint/mirror filters that block the screen (but keep camera/notch)
    filterMeshes.forEach((filter) => {
      const name = (filter.name ?? "").toLowerCase();
      const matName = filter.material?.name?.toLowerCase?.() ?? "";
      // Hide tint/mirror filters, but keep camera-related ones
      if (name.includes("tint") || matName.includes("tint") ||
        (name.includes("mirror") && !name.includes("camera") && !name.includes("sapphire"))) {
        console.log("🚫 Hiding tint/mirror filter:", filter.name);
        filter.visible = false;
      }
    });

    // Keep notch/camera meshes visible (full opacity) - these create the cutout
    notchMeshes.forEach((notch) => {
      console.log("✅ Keeping notch/camera visible:", notch.name);
      notch.visible = true;
      // Ensure they render on top
      if (notch.material) {
        if (Array.isArray(notch.material)) {
          notch.material.forEach((mat) => {
            if (mat) {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.needsUpdate = true;
            }
          });
        } else {
          notch.material.transparent = false;
          notch.material.opacity = 1.0;
          notch.material.needsUpdate = true;
        }
      }
      notch.renderOrder = 1000; // Render last (on top)
    });

    // Front glass - HIDE GLB front glass/tint (they're brittle and block screen)
    // We'll add our own fake glass overlay instead
    glassMeshes.forEach((glass) => {
      const name = (glass.name ?? "").toLowerCase();
      const matName = glass.material?.name?.toLowerCase?.() ?? "";
      
      // Hide GLB front glass/tint that covers the whole screen (brittle materials)
      if (name.includes("14") || name.includes("53") || name.includes("front") ||
          name.includes("tint") || matName.includes("tint") ||
          (name.includes("glass") && (name.includes("front") || name.includes("display")))) {
        console.log("🚫 Hiding GLB front glass/tint (brittle):", glass.name);
        glass.visible = false; // Hide - we'll add our own glass overlay
      } else {
        // Other glass (bezel, back) - make transparent
        if (Array.isArray(glass.material)) {
          glass.material.forEach((mat) => {
            if (mat) {
              mat.opacity = 0.3;
              mat.transparent = true;
              mat.needsUpdate = true;
            }
          });
        } else {
          glass.material.opacity = 0.3;
          glass.material.transparent = true;
          glass.material.needsUpdate = true;
        }
      }
    });

    // Create anchor group that follows the screen mesh's transform
    const screenMesh = screenMeshRef.current;
    if (!screenMesh || !screenAnchorRef.current || !screenPlaneRef.current) {
      console.warn("⚠️ Screen mesh or refs not ready");
      return;
    }

    // IMPORTANT: use LOCAL size (geometry bbox), not Box3().setFromObject (world size)
    screenMesh.geometry.computeBoundingBox();
    const bbox = screenMesh.geometry.boundingBox;
    if (!bbox) {
      console.warn("⚠️ Screen mesh has no bounding box");
      return;
    }

    const size = new THREE.Vector3();
    bbox.getSize(size);

    // ✅ Perfect fit: match texture aspect ratio to screen bounds (no letterbox, no overspill)
    const texW = screenTex.image?.width ?? 1170;
    const texH = screenTex.image?.height ?? 2532;
    const texAspect = texW / texH;

    // Screen mesh size (local) from bounding box:
    const screenW = size.x;
    const screenH = size.y;
    const screenAspect = screenW / screenH;

    // We want "contain" so it never spills over edges.
    // Slight overscan (1.002) just to kill subpixel gaps without visible overspill.
    const overscan = 1.002;

    let planeW = screenW * overscan;
    let planeH = screenH * overscan;

    if (screenAspect > texAspect) {
      // screen wider than texture -> fit by height
      planeH = screenH * overscan;
      planeW = planeH * texAspect;
    } else {
      // screen taller than texture -> fit by width
      planeW = screenW * overscan;
      planeH = planeW / texAspect;
    }

    console.log("📐 Screen mesh local size:", size.x.toFixed(3), "x", size.y.toFixed(3));
    console.log("📐 Texture aspect:", texAspect.toFixed(3), "Screen aspect:", screenAspect.toFixed(3));
    console.log("📐 Plane size (perfect fit):", planeW.toFixed(3), "x", planeH.toFixed(3));

    screenPlaneRef.current.geometry.dispose();
    screenPlaneRef.current.geometry = new THREE.PlaneGeometry(planeW, planeH);

    // Z offset - slightly forward (toward camera) but still behind our fake glass overlay
    // Small positive offset ensures it's visible and in front of phone body
    screenPlaneRef.current.position.set(0, 0, 0.003);

    // Also update bloom plane geometry (slightly larger) - set after plane is ready
    if (screenBloomRef.current) {
      screenBloomRef.current.geometry.dispose();
      screenBloomRef.current.geometry = new THREE.PlaneGeometry(planeW * 1.04, planeH * 1.04);
    }

    // Apply texture to our plane - CRITICAL: flipY = true for PlaneGeometry (opposite of GLTF mesh)
    screenTex.flipY = true; // <-- DIFFERENT from GLTF screen mesh
    screenTex.needsUpdate = true;
    screenTex.wrapS = THREE.ClampToEdgeWrapping;
    screenTex.wrapT = THREE.ClampToEdgeWrapping;
    screenTex.minFilter = THREE.LinearFilter;
    screenTex.magFilter = THREE.LinearFilter;
    screenTex.generateMipmaps = false;
    screenTex.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
      map: screenTex,
      color: 0xffffff,
      toneMapped: false,
      side: THREE.DoubleSide,
      depthTest: true,     // once working, turn realism back on
      depthWrite: false,
    });

    screenPlaneRef.current.material = material;
    screenPlaneRef.current.material.needsUpdate = true;
    screenPlaneRef.current.visible = true;
    screenPlaneRef.current.renderOrder = 997; // Render before fake glass (998) and notch (1000)
    
    // Update fake glass overlay geometry (slightly larger than screen)
    if (fakeGlassRef.current) {
      fakeGlassRef.current.geometry.dispose();
      fakeGlassRef.current.geometry = new THREE.PlaneGeometry(planeW * 1.01, planeH * 1.01);
    }

    console.log("✅ Created replacement screen plane:", planeW.toFixed(3), "x", planeH.toFixed(3));

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
  // Convert screenMesh world matrix into anchor-parent local space
  useFrame(() => {
    const anchor = screenAnchorRef.current;
    const plane = screenPlaneRef.current;
    const screenMesh = screenMeshRef.current;

    if (!anchor || !plane || !screenMesh) return;

    // Update world matrices
    screenMesh.updateWorldMatrix(true, false);

    // Convert screenMesh world matrix into anchor-parent local space
    const parent = anchor.parent;
    if (!parent) return;

    parent.updateWorldMatrix(true, false);
    invParentM.copy(parent.matrixWorld).invert();
    tmpM.multiplyMatrices(invParentM, screenMesh.matrixWorld);

    tmpM.decompose(anchor.position, anchor.quaternion, anchor.scale);
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
        {/* Soft OLED bloom behind screen */}
        <mesh ref={screenBloomRef} position={[0, 0, -0.015]} renderOrder={996}>
          <planeGeometry args={[1, 2]} />
          <meshBasicMaterial
            color="#1E7A4A"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>

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
