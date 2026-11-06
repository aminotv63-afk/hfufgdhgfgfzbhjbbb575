import * as THREE from 'three';
import { soundManager } from '../utils/audio';

export interface PalaceSystem {
  group: THREE.Group;
  getHeight: (x: number, z: number, currentY?: number) => number | null;
  update: (delta: number, sultanPos?: THREE.Vector3) => void;
  isNearThrone: (sultanPos?: THREE.Vector3) => boolean;
}

// Procedural Canvas Texture for Sandstone Palace Walls
function createPalaceWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base warm Algerian limestone/sandstone
  ctx.fillStyle = '#d2be9b';
  ctx.fillRect(0, 0, 256, 256);

  // Brick block rows
  ctx.strokeStyle = '#a69070';
  ctx.lineWidth = 3;

  const rowHeight = 32;
  const colWidth = 64;

  for (let y = 0; y < 256; y += rowHeight) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();

    const offset = (y / rowHeight) % 2 === 0 ? 0 : colWidth / 2;
    for (let x = offset; x < 256; x += colWidth) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowHeight);
      ctx.stroke();
    }
  }

  // Stone grain texture noise
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 245, 230, 0.25)' : 'rgba(120, 100, 80, 0.2)';
    ctx.fillRect(rx, ry, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Floor Flagstone Texture
function createPalaceFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b8a892';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#8a7a66';
  ctx.lineWidth = 2;

  const size = 32;
  for (let y = 0; y < 256; y += size) {
    for (let x = 0; x < 256; x += size) {
      ctx.strokeRect(x, y, size, size);
      if ((x + y) % (size * 2) === 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Heavy Cedar Wood Door Texture with Iron Straps
function createWoodDoorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a2c11';
  ctx.fillRect(0, 0, 256, 256);

  // Planks
  const plankW = 42;
  ctx.strokeStyle = '#2d1808';
  ctx.lineWidth = 3;
  for (let x = 0; x <= 256; x += plankW) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  // Wood grain noise
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(90, 55, 25, 0.4)' : 'rgba(30, 15, 5, 0.35)';
    ctx.fillRect(rx, ry, 2, 8 + Math.random() * 12);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Creates an authentic Gate Guard soldier stationed at the entrance
function createStationedGateGuard(side: 'left' | 'right'): { root: THREE.Group; update: (t: number, isSaluting: boolean) => void } {
  const root = new THREE.Group();
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x5a636b, metalness: 0.8, roughness: 0.35 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9a726, metalness: 0.85, roughness: 0.25 });
  const crimsonMat = new THREE.MeshStandardMaterial({ color: 0x82141c, roughness: 0.65 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfb892, roughness: 0.8 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.7 });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.68, 0.28), crimsonMat);
  torso.position.y = 1.08;
  torso.castShadow = true;
  root.add(torso);

  // Breastplate
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.3), ironMat);
  plate.position.set(0, 1.12, 0.01);
  root.add(plate);

  // Golden Crest Emblem
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.32), goldMat);
  crest.position.set(0, 1.15, 0.01);
  root.add(crest);

  // Head & Helmet
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.62, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), ironMat);
  headGroup.add(head);

  // Face Visor cut
  const faceMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.04), skinMat);
  faceMesh.position.set(0, -0.02, 0.18);
  headGroup.add(faceMesh);

  // Helmet Crimson Plume
  const plume = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.36), crimsonMat);
  plume.position.set(0, 0.28, -0.02);
  headGroup.add(plume);
  root.add(headGroup);

  // Legs & Boots
  const legGeo = new THREE.BoxGeometry(0.18, 0.72, 0.2);
  const bootMat = new THREE.MeshStandardMaterial({ color: 0x2b3036, roughness: 0.6 });

  const leftLeg = new THREE.Mesh(legGeo, crimsonMat);
  leftLeg.position.set(-0.13, 0.36, 0);
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, crimsonMat);
  rightLeg.position.set(0.13, 0.36, 0);
  root.add(rightLeg);

  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.24, 0.24), bootMat);
  leftBoot.position.set(-0.13, 0.12, 0.02);
  root.add(leftBoot);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.24, 0.24), bootMat);
  rightBoot.position.set(0.13, 0.12, 0.02);
  root.add(rightBoot);

  // Shield on inner arm
  const shieldMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.45), ironMat);
  const shieldBoss = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.16), goldMat);
  shieldMesh.add(shieldBoss);

  if (side === 'left') {
    shieldMesh.position.set(0.35, 1.05, 0.1);
  } else {
    shieldMesh.position.set(-0.35, 1.05, 0.1);
  }
  root.add(shieldMesh);

  // Royal Halberd / Guard Spear held upright
  const spearPivot = new THREE.Group();
  spearPivot.position.set(side === 'left' ? -0.32 : 0.32, 1.25, 0.15);

  const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.5, 6), woodMat);
  const spearHead = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.45, 4), ironMat);
  spearHead.position.y = 1.35;
  spearShaft.add(spearHead);
  spearShaft.castShadow = true;
  spearPivot.add(spearShaft);
  root.add(spearPivot);

  // Soft shadow
  const shadowGeo = new THREE.CircleGeometry(0.55, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.02;
  root.add(shadow);

  const update = (time: number, isSaluting: boolean) => {
    // Subtle living guard breathing
    const breath = Math.sin(time * 2.0 + (side === 'left' ? 0 : 1.2)) * 0.008;
    torso.position.y = 1.08 + breath;
    headGroup.position.y = 1.62 + breath;

    if (isSaluting) {
      // Royal salute: Head turns toward the King entering, spear raises in salute
      headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, side === 'left' ? 0.35 : -0.35, 10, 0.016);
      spearPivot.rotation.x = THREE.MathUtils.damp(spearPivot.rotation.x, -0.4, 8, 0.016);
      spearPivot.position.z = THREE.MathUtils.damp(spearPivot.position.z, 0.28, 8, 0.016);
    } else {
      headGroup.rotation.y = THREE.MathUtils.damp(headGroup.rotation.y, 0.0, 6, 0.016);
      spearPivot.rotation.x = THREE.MathUtils.damp(spearPivot.rotation.x, 0.0, 6, 0.016);
      spearPivot.position.z = THREE.MathUtils.damp(spearPivot.position.z, 0.15, 6, 0.016);
    }
  };

  return { root, update };
}

export function buildGrandPalace(scene: THREE.Scene): PalaceSystem {
  const palaceGroup = new THREE.Group();
  palaceGroup.name = 'GrandPalace_Achour10';

  // Shared lightweight materials (Zero-lag PBR)
  const wallTexture = createPalaceWallTexture();
  const floorTexture = createPalaceFloorTexture();

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTexture,
    roughness: 0.85,
    metalness: 0.1,
  });

  const darkWallMat = new THREE.MeshStandardMaterial({
    color: 0x3d3a36,
    roughness: 0.9,
    metalness: 0.15,
  });

  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.7,
    metalness: 0.1,
  });

  const carpetMat = new THREE.MeshStandardMaterial({
    color: 0x8a101b,
    roughness: 0.85,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4a528,
    metalness: 0.85,
    roughness: 0.25,
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x24282c,
    metalness: 0.9,
    roughness: 0.4,
  });

  const columnMat = new THREE.MeshStandardMaterial({
    color: 0xe8dcce,
    roughness: 0.6,
  });

  // -------------------------------------------------------------
  // 1. PALACE FOUNDATION & FLOORS (Walkable ground floor)
  // -------------------------------------------------------------
  // Main Palace Floor (Z: 14 to 48, X: -20 to 20, Y: 0.12)
  const floorGeo = new THREE.BoxGeometry(40, 0.24, 34);
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.set(0, 0.12, 31);
  floorMesh.receiveShadow = true;
  palaceGroup.add(floorMesh);

  // Grand Royal Red Carpet Runner leading to the Throne
  const carpetGeo = new THREE.BoxGeometry(3.6, 0.04, 25);
  const carpetMesh = new THREE.Mesh(carpetGeo, carpetMat);
  carpetMesh.position.set(0, 0.26, 26.5);
  carpetMesh.receiveShadow = true;
  palaceGroup.add(carpetMesh);

  // Gold carpet borders
  const carpetBorderL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 25), goldMat);
  carpetBorderL.position.set(-1.85, 0.26, 26.5);
  palaceGroup.add(carpetBorderL);

  const carpetBorderR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 25), goldMat);
  carpetBorderR.position.set(1.85, 0.26, 26.5);
  palaceGroup.add(carpetBorderR);

  // -------------------------------------------------------------
  // 2. PALACE WALLS & PARTITIONS (Grand Hall, Rooms, Prison)
  // -------------------------------------------------------------
  const WALL_H = 6.8;

  // Outer Back Wall (Z = 48)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(40, WALL_H, 1.2), wallMat);
  backWall.position.set(0, WALL_H / 2 + 0.2, 48);
  backWall.castShadow = true;
  palaceGroup.add(backWall);

  // Outer Left Wall (X = -20)
  const leftOuterWall = new THREE.Mesh(new THREE.BoxGeometry(1.2, WALL_H, 34), wallMat);
  leftOuterWall.position.set(-20, WALL_H / 2 + 0.2, 31);
  leftOuterWall.castShadow = true;
  palaceGroup.add(leftOuterWall);

  // Outer Right Wall (X = 20)
  const rightOuterWall = new THREE.Mesh(new THREE.BoxGeometry(1.2, WALL_H, 34), wallMat);
  rightOuterWall.position.set(20, WALL_H / 2 + 0.2, 31);
  rightOuterWall.castShadow = true;
  palaceGroup.add(rightOuterWall);

  // Front Facade Walls with Grand Archway Entrance (Z = 14)
  // Left front section
  const frontWallL = new THREE.Mesh(new THREE.BoxGeometry(17, WALL_H, 1.2), wallMat);
  frontWallL.position.set(-11.5, WALL_H / 2 + 0.2, 14);
  frontWallL.castShadow = true;
  palaceGroup.add(frontWallL);

  // Right front section
  const frontWallR = new THREE.Mesh(new THREE.BoxGeometry(17, WALL_H, 1.2), wallMat);
  frontWallR.position.set(11.5, WALL_H / 2 + 0.2, 14);
  frontWallR.castShadow = true;
  palaceGroup.add(frontWallR);

  // Archway lintel above main entrance (Opening is X: -3 to +3, Height 4.2m)
  const archLintel = new THREE.Mesh(new THREE.BoxGeometry(6.2, WALL_H - 4.2, 1.2), wallMat);
  archLintel.position.set(0, 4.2 + (WALL_H - 4.2) / 2 + 0.2, 14);
  palaceGroup.add(archLintel);

  // Ornate Arabesque Arch Molding over Entrance
  const archMolding = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.35, 1.35), goldMat);
  archMolding.position.set(0, 4.3, 14);
  palaceGroup.add(archMolding);

  // Royal Golden Gate Crest Plaque: "قصر السلطان عاشور العاشر"
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 0.18), goldMat);
  plaque.position.set(0, 5.0, 13.35);
  palaceGroup.add(plaque);

  // Emerald Gem on Plaque
  const plaqueGem = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.22), new THREE.MeshStandardMaterial({ color: 0x008f39, roughness: 0.2, metalness: 0.6 }));
  plaqueGem.position.set(0, 5.0, 13.38);
  palaceGroup.add(plaqueGem);

  // -------------------------------------------------------------
  // ANIMATED PALACE DOUBLE DOORS (بوابتا القصر الملكي التي يفتحها الحارسان)
  // -------------------------------------------------------------
  const doorWoodMat = new THREE.MeshStandardMaterial({
    map: createWoodDoorTexture(),
    roughness: 0.65,
    metalness: 0.15,
  });

  const doorStudMat = new THREE.MeshStandardMaterial({
    color: 0xd4a528,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Helper to build an ornate palace door leaf
  const buildDoorLeaf = (side: 'left' | 'right') => {
    const doorGroup = new THREE.Group();
    const DOOR_W = 2.95;
    const DOOR_H = 4.15;
    const DOOR_D = 0.22;
    const offsetX = side === 'left' ? DOOR_W / 2 : -DOOR_W / 2;

    // Main wooden door slab
    const slab = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W, DOOR_H, DOOR_D), doorWoodMat);
    slab.position.set(offsetX, DOOR_H / 2, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    doorGroup.add(slab);

    // Iron reinforcement horizontal bands (3 bands)
    const bandHeights = [0.8, DOOR_H / 2, DOOR_H - 0.8];
    bandHeights.forEach((by) => {
      const band = new THREE.Mesh(new THREE.BoxGeometry(DOOR_W + 0.02, 0.22, DOOR_D + 0.04), ironMat);
      band.position.set(offsetX, by, 0);
      doorGroup.add(band);

      // Golden rivets along the band
      for (let rx = -DOOR_W / 2 + 0.3; rx < DOOR_W / 2; rx += 0.55) {
        const rivetF = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, DOOR_D + 0.08), doorStudMat);
        rivetF.position.set(offsetX + rx, by, 0);
        doorGroup.add(rivetF);
      }
    });

    // Golden lion knocker / ring handle
    const handleX = side === 'left' ? offsetX + (DOOR_W / 2 - 0.4) : offsetX - (DOOR_W / 2 - 0.4);
    const knockerPlate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, DOOR_D + 0.08), goldMat);
    knockerPlate.position.set(handleX, 1.9, 0);
    doorGroup.add(knockerPlate);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 16), goldMat);
    ring.position.set(handleX, 1.82, (DOOR_D / 2) + 0.06);
    doorGroup.add(ring);

    return doorGroup;
  };

  // Left Door Pivot (hinge at x = -2.95, z = 14.0)
  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-2.95, 0.2, 14.0);
  const leftDoorMesh = buildDoorLeaf('left');
  leftDoorPivot.add(leftDoorMesh);
  palaceGroup.add(leftDoorPivot);

  // Right Door Pivot (hinge at x = +2.95, z = 14.0)
  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(2.95, 0.2, 14.0);
  const rightDoorMesh = buildDoorLeaf('right');
  rightDoorPivot.add(rightDoorMesh);
  palaceGroup.add(rightDoorPivot);

  // -------------------------------------------------------------
  // 3. INTERNAL PARTITION WALLS (Rooms & Prison)
  // -------------------------------------------------------------
  // Left Wing Partition (Separating Grand Hall from Empty Royal Chambers at X = -7)
  // Room 1 wall with archway door
  const leftWingWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, WALL_H, 12), wallMat);
  leftWingWall1.position.set(-7, WALL_H / 2 + 0.2, 22);
  palaceGroup.add(leftWingWall1);

  const leftWingWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, WALL_H, 12), wallMat);
  leftWingWall2.position.set(-7, WALL_H / 2 + 0.2, 40);
  palaceGroup.add(leftWingWall2);

  // Room divider wall inside Left Wing (at Z = 31)
  const roomDivider = new THREE.Mesh(new THREE.BoxGeometry(12, WALL_H, 0.8), wallMat);
  roomDivider.position.set(-13, WALL_H / 2 + 0.2, 31);
  palaceGroup.add(roomDivider);

  // Right Wing Partition (Separating Grand Hall from Royal Dungeon at X = 7)
  const dungeonWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, WALL_H, 10), darkWallMat);
  dungeonWall1.position.set(7, WALL_H / 2 + 0.2, 21);
  palaceGroup.add(dungeonWall1);

  const dungeonWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, WALL_H, 12), darkWallMat);
  dungeonWall2.position.set(7, WALL_H / 2 + 0.2, 40);
  palaceGroup.add(dungeonWall2);

  // -------------------------------------------------------------
  // 4. ROYAL DUNGEON / PRISON CELLS (سجن المملكة العاشورية)
  // -------------------------------------------------------------
  // Prison Cell 1 at X: 11 to 19, Z: 20 to 29
  // Iron bars front
  for (let bx = 10; bx <= 18; bx += 0.55) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.8, 6), ironMat);
    bar.position.set(bx, 1.9 + 0.2, 26);
    palaceGroup.add(bar);
  }
  const topRail1 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.1, 0.1), ironMat);
  topRail1.position.set(14, 3.8, 26);
  palaceGroup.add(topRail1);

  // Prison Cell 2 at X: 11 to 19, Z: 32 to 43
  for (let bx = 10; bx <= 18; bx += 0.55) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.8, 6), ironMat);
    bar.position.set(bx, 1.9 + 0.2, 38);
    palaceGroup.add(bar);
  }
  const topRail2 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.1, 0.1), ironMat);
  topRail2.position.set(14, 3.8, 38);
  palaceGroup.add(topRail2);

  // Dungeon Wall Sign
  const dungeonSign = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.08), ironMat);
  dungeonSign.position.set(7.5, 3.2, 27);
  dungeonSign.rotation.y = -Math.PI / 2;
  palaceGroup.add(dungeonSign);

  // -------------------------------------------------------------
  // 5. THE ROYAL THRONE (عرش السلطان عاشور العاشر)
  // -------------------------------------------------------------
  const throneGroup = new THREE.Group();
  throneGroup.position.set(0, 0, 42.5);

  // Tier 1 Dais Platform (Y = 0.35)
  const dais1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.35, 5.0), wallMat);
  dais1.position.set(0, 0.175, 0);
  dais1.receiveShadow = true;
  throneGroup.add(dais1);

  // Tier 2 Dais Platform (Y = 0.65)
  const dais2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.3, 4.0), carpetMat);
  dais2.position.set(0, 0.35 + 0.15, 0.2);
  dais2.receiveShadow = true;
  throneGroup.add(dais2);

  // Tier 3 Dais Platform (Y = 0.95)
  const dais3 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.3, 3.0), goldMat);
  dais3.position.set(0, 0.65 + 0.15, 0.5);
  dais3.receiveShadow = true;
  throneGroup.add(dais3);

  // --- THE THRONE CHAIR ---
  const throneChair = new THREE.Group();
  throneChair.position.set(0, 0.95, 0.8);

  // Throne Seat
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 1.1), carpetMat);
  seat.position.y = 0.55;
  throneChair.add(seat);

  // Golden Frame
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.45, 1.2), goldMat);
  seatBase.position.y = 0.225;
  seatBase.castShadow = true;
  throneChair.add(seatBase);

  // Throne Armrests
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.2), goldMat);
  armL.position.set(-0.7, 0.7, 0);
  throneChair.add(armL);

  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 1.2), goldMat);
  armR.position.set(0.7, 0.7, 0);
  throneChair.add(armR);

  // Throne Tall Crown Backrest
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.22), goldMat);
  backrest.position.set(0, 1.6, -0.45);
  backrest.castShadow = true;
  throneChair.add(backrest);

  // Velvet Backrest Cushion
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.7, 0.12), carpetMat);
  cushion.position.set(0, 1.5, -0.38);
  throneChair.add(cushion);

  // Royal Star Emblem on Throne Crown
  const star = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), goldMat);
  star.position.set(0, 2.8, -0.45);
  throneChair.add(star);

  throneGroup.add(throneChair);
  palaceGroup.add(throneGroup);

  // Grand Columns lining the Throne Room Aisle
  const columnPositions = [
    [-4.5, 20], [4.5, 20],
    [-4.5, 26], [4.5, 26],
    [-4.5, 32], [4.5, 32],
    [-4.5, 38], [4.5, 38],
  ];

  columnPositions.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, WALL_H, 8), columnMat);
    col.position.set(cx, WALL_H / 2 + 0.2, cz);
    col.castShadow = true;
    palaceGroup.add(col);

    // Capital & Base
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.1), goldMat);
    cap.position.set(cx, WALL_H + 0.05, cz);
    palaceGroup.add(cap);

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.35, 1.1), goldMat);
    base.position.set(cx, 0.3, cz);
    palaceGroup.add(base);
  });

  // -------------------------------------------------------------
  // 6. GRAND STAIRCASE LEADING TO ROOFTOP TERRACE (درج القصر الملكي)
  // -------------------------------------------------------------
  // Wide ramp-staircase from Z: 20 to 32 at X: -5.8
  const stairSteps = 16;
  const stairStartZ = 20;
  const stairEndZ = 32;
  const stairHeight = 6.8;

  for (let s = 0; s < stairSteps; s++) {
    const t = s / stairSteps;
    const sz = stairStartZ + t * (stairEndZ - stairStartZ);
    const sy = 0.2 + t * stairHeight;
    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, (stairHeight / stairSteps) + 0.1, 0.8), wallMat);
    stepMesh.position.set(-5.6, sy, sz);
    stepMesh.receiveShadow = true;
    palaceGroup.add(stepMesh);

    // Golden Balusters along staircase edge
    if (s % 2 === 0) {
      const baluster = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), goldMat);
      baluster.position.set(-4.4, sy + 0.55, sz);
      palaceGroup.add(baluster);
    }
  }

  // Staircase Handrail
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 13.5), goldMat);
  rail.position.set(-4.4, 4.0, 26);
  rail.rotation.x = Math.atan2(stairHeight, stairEndZ - stairStartZ);
  palaceGroup.add(rail);

  // -------------------------------------------------------------
  // PALACE ENHANCEMENTS: CHANDELIER, TORCHES, BANNERS, BRAZIERS
  // -------------------------------------------------------------
  // A) Grand Golden Chandelier (ثريا ذهبية ملكية كبرى في بهو القصر)
  const chandelierGroup = new THREE.Group();
  chandelierGroup.position.set(0, 5.2, 28);

  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), goldMat);
  chain.position.y = 0.9;
  chandelierGroup.add(chain);

  const chandelierHub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.4, 8), goldMat);
  chandelierGroup.add(chandelierHub);

  const chandelierRing = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 8, 16), goldMat);
  chandelierRing.rotation.x = Math.PI / 2;
  chandelierGroup.add(chandelierRing);

  // Candles & Warm Light
  for (let a = 0; a < 8; a++) {
    const angle = (a / 8) * Math.PI * 2;
    const cx = Math.cos(angle) * 1.4;
    const cz = Math.sin(angle) * 1.4;

    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), columnMat);
    candle.position.set(cx, 0.2, cz);
    chandelierGroup.add(candle);

    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 5), new THREE.MeshBasicMaterial({ color: 0xffaa22 }));
    flame.position.set(cx, 0.42, cz);
    chandelierGroup.add(flame);
  }

  const chandelierLight = new THREE.PointLight(0xffe2a3, 2.0, 24, 1.5);
  chandelierLight.position.set(0, -0.2, 0);
  chandelierGroup.add(chandelierLight);
  palaceGroup.add(chandelierGroup);

  // B) Royal Wall Torches (مشاعل جدارية متوهجة على الأعمدة)
  const torchFlames: THREE.Mesh[] = [];
  const torchPositions = [
    [-4.0, 2.8, 20], [4.0, 2.8, 20],
    [-4.0, 2.8, 26], [4.0, 2.8, 26],
    [-4.0, 2.8, 32], [4.0, 2.8, 32],
    [-4.0, 2.8, 38], [4.0, 2.8, 38],
  ];

  torchPositions.forEach(([tx, ty, tz]) => {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.3), ironMat);
    bracket.position.set(tx, ty, tz);
    palaceGroup.add(bracket);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.05, 0.15, 6), goldMat);
    cup.position.set(tx, ty + 0.15, tz);
    palaceGroup.add(cup);

    const flameMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.28, 5),
      new THREE.MeshBasicMaterial({ color: 0xff9911 })
    );
    flameMesh.position.set(tx, ty + 0.3, tz);
    torchFlames.push(flameMesh);
    palaceGroup.add(flameMesh);
  });

  // C) Royal Banners of the Kingdom of Achour 10 (رايات المملكة العاشورية)
  const bannerMat = new THREE.MeshStandardMaterial({ color: 0x0f5b32, roughness: 0.7 }); // Achour green
  const bannerPositions = [
    [-4.0, 4.2, 23], [4.0, 4.2, 23],
    [-4.0, 4.2, 35], [4.0, 4.2, 35],
  ];

  bannerPositions.forEach(([bx, by, bz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), goldMat);
    pole.rotation.z = Math.PI / 2;
    pole.position.set(bx, by + 1.1, bz);
    palaceGroup.add(pole);

    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.2, 0.03), bannerMat);
    cloth.position.set(bx, by, bz);
    palaceGroup.add(cloth);

    const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), goldMat);
    emblem.position.set(bx, by + 0.2, bz);
    palaceGroup.add(emblem);
  });

  // D) Golden Braziers flanking the Throne Dais (مباخر العرش الملكي)
  [-3.2, 3.2].forEach((brazierX) => {
    const bBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.8, 8), goldMat);
    bBase.position.set(brazierX, 0.4, 42.5);
    palaceGroup.add(bBase);

    const bBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.25, 0.35, 8), goldMat);
    bBowl.position.set(brazierX, 0.95, 42.5);
    palaceGroup.add(bBowl);

    const embers = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff5511 }));
    embers.position.set(brazierX, 1.05, 42.5);
    palaceGroup.add(embers);
  });

  // -------------------------------------------------------------
  // 7. UPPER ROOFTOP / OBSERVATION TERRACE (مكان في الفوق لرؤية المملكة)
  // -------------------------------------------------------------
  const ROOF_Y = 7.0;

  // Rooftop Walkway Slab (Span: X: -19 to 19, Z: 15 to 47)
  const roofGeo = new THREE.BoxGeometry(38, 0.35, 32);
  const roofMesh = new THREE.Mesh(roofGeo, floorMat);
  roofMesh.position.set(0, ROOF_Y, 31);
  roofMesh.receiveShadow = true;
  palaceGroup.add(roofMesh);

  // Surrounding Battlements / Parapets (الحواجز وشرفات المراقبة البانورامية)
  const BATTLEMENT_H = 1.2;

  // Front Parapet (Z = 15.2) with crenellations
  const frontParapet = new THREE.Mesh(new THREE.BoxGeometry(38, BATTLEMENT_H, 0.6), wallMat);
  frontParapet.position.set(0, ROOF_Y + BATTLEMENT_H / 2, 15.2);
  palaceGroup.add(frontParapet);

  // Back Parapet (Z = 46.8)
  const backParapet = new THREE.Mesh(new THREE.BoxGeometry(38, BATTLEMENT_H, 0.6), wallMat);
  backParapet.position.set(0, ROOF_Y + BATTLEMENT_H / 2, 46.8);
  palaceGroup.add(backParapet);

  // Left Parapet (X = -18.8)
  const leftParapet = new THREE.Mesh(new THREE.BoxGeometry(0.6, BATTLEMENT_H, 32), wallMat);
  leftParapet.position.set(-18.8, ROOF_Y + BATTLEMENT_H / 2, 31);
  palaceGroup.add(leftParapet);

  // Right Parapet (X = 18.8)
  const rightParapet = new THREE.Mesh(new THREE.BoxGeometry(0.6, BATTLEMENT_H, 32), wallMat);
  rightParapet.position.set(18.8, ROOF_Y + BATTLEMENT_H / 2, 31);
  palaceGroup.add(rightParapet);

  // Corner Watchtowers on the Rooftop with Golden Finials
  const cornerPositions = [
    [-18.5, 15.5], [18.5, 15.5],
    [-18.5, 46.5], [18.5, 46.5],
  ];

  cornerPositions.forEach(([px, pz]) => {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 2.4), wallMat);
    tower.position.set(px, ROOF_Y + 1.6, pz);
    palaceGroup.add(tower);

    // Golden Royal Finial on top
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 6), goldMat);
    finial.position.set(px, ROOF_Y + 3.2 + 0.9, pz);
    palaceGroup.add(finial);

    // Royal Banner Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 6), goldMat);
    pole.position.set(px, ROOF_Y + 3.2 + 2.1, pz);
    palaceGroup.add(pole);

    // Red Royal Flag
    const flag = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.04), carpetMat);
    flag.position.set(px + 0.8, ROOF_Y + 3.2 + 3.4, pz);
    palaceGroup.add(flag);
  });

  // -------------------------------------------------------------
  // 8. TWO GATE GUARDS STATIONED AT THE PALACE DOOR (2 جنود في الباب)
  // -------------------------------------------------------------
  const leftGateGuard = createStationedGateGuard('left');
  leftGateGuard.root.position.set(-3.6, 0.04, 13.5);
  leftGateGuard.root.rotation.y = Math.PI; // Vigilantly facing outward towards kingdom meadow
  palaceGroup.add(leftGateGuard.root);

  const rightGateGuard = createStationedGateGuard('right');
  rightGateGuard.root.position.set(3.6, 0.04, 13.5);
  rightGateGuard.root.rotation.y = Math.PI; // Vigilantly facing outward towards kingdom meadow
  palaceGroup.add(rightGateGuard.root);

  // Add the Palace to scene
  scene.add(palaceGroup);

  // -------------------------------------------------------------
  // 9. PALACE WALKABLE SURFACE ELEVATION FUNCTION
  // -------------------------------------------------------------
  const getPalaceHeight = (x: number, z: number, currentY: number = 0): number | null => {
    // Check if within Palace Footprint
    if (x < -20 || x > 20 || z < 13.6 || z > 48) {
      return null;
    }

    // A) If character is on the Upper Observation Terrace (Y >= 4.5)
    if (currentY >= 4.5) {
      if (x >= -19 && x <= 19 && z >= 15 && z <= 47) {
        return ROOF_Y + 0.18; // Walkable rooftop terrace height
      }
    }

    // B) Grand Staircase (ascending from Z: 20 to 32 at X: -7 to -4.2)
    if (x >= -7.0 && x <= -4.2 && z >= 20 && z <= 32.5) {
      const t = Math.max(0, Math.min(1, (z - 20) / 12));
      return 0.12 + t * (ROOF_Y - 0.12);
    }

    // C) Throne Dais Elevated Platforms (at Z: 38 to 44.5, X: -3.5 to 3.5)
    if (x >= -3.5 && x <= 3.5 && z >= 38 && z <= 44.5) {
      if (z >= 41) return 0.95; // Top tier
      if (z >= 39.5) return 0.65; // Middle tier
      return 0.35; // Bottom tier
    }

    // D) Ground floor inside Palace (Grand Hall, Empty Rooms, Prison)
    return 0.12;
  };

  // Helper to test if Sultan is near the throne chair
  const isNearThrone = (sultanPos?: THREE.Vector3): boolean => {
    if (!sultanPos) return false;
    return Math.abs(sultanPos.x) <= 2.8 && sultanPos.z >= 39.5 && sultanPos.z <= 44.5;
  };

  let animTimer = 0;
  let wasDoorOpen = false;

  const update = (delta: number, sultanPos?: THREE.Vector3) => {
    animTimer += delta;

    // Detect if Sultan is within 6.8m of the entrance gate (Z: 14.0)
    // or passing through the gate opening
    const isNearGate = sultanPos
      ? (Math.hypot(sultanPos.x, sultanPos.z - 14.0) < 6.8 ||
         (Math.abs(sultanPos.x) <= 3.2 && sultanPos.z >= 11.5 && sultanPos.z <= 17.0))
      : false;

    // Sound effect trigger on gate opening
    if (isNearGate && !wasDoorOpen) {
      soundManager.playGateOpen();
      wasDoorOpen = true;
    } else if (!isNearGate && wasDoorOpen) {
      wasDoorOpen = false;
    }

    // Double doors open automatically when approaching and close when leaving
    const targetLeftAngle = isNearGate ? -Math.PI * 0.48 : 0.0;
    const targetRightAngle = isNearGate ? Math.PI * 0.48 : 0.0;

    leftDoorPivot.rotation.y = THREE.MathUtils.damp(leftDoorPivot.rotation.y, targetLeftAngle, 4.0, delta);
    rightDoorPivot.rotation.y = THREE.MathUtils.damp(rightDoorPivot.rotation.y, targetRightAngle, 4.0, delta);

    // Gate guards salute the Sultan when he enters
    leftGateGuard.update(animTimer, isNearGate);
    rightGateGuard.update(animTimer, isNearGate);

    // Subtle torch flame flicker
    for (let i = 0; i < torchFlames.length; i++) {
      const fl = torchFlames[i];
      const s = 1.0 + Math.sin(animTimer * 10 + i * 1.3) * 0.15;
      fl.scale.set(s, s * 1.1, s);
    }
  };

  return {
    group: palaceGroup,
    getHeight: getPalaceHeight,
    update,
    isNearThrone,
  };
}
