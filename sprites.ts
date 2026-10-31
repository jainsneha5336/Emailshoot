import Phaser from 'phaser';

export interface SpriteDefinition {
  width: number;
  height: number;
  palette: Record<string, string>;
  map: string[];
}

// ============================================================================
// 1. SHIP (32x32)
// Top-down space fighter, pointing straight up, perfectly symmetrical across
// the vertical centerline (cols 15 & 16), light blue/white body,
// dual/triple engine glow with flame core at the bottom, triangular silhouette.
// Palette (7 colors):
//   . (transparent), w (white), b (light blue), B (medium blue),
//   D (dark outline), o (orange glow), d (dark flame core)
// ============================================================================
export const SHIP_DEF: SpriteDefinition = {
  width: 32,
  height: 32,
  palette: {
    '.': '#00000000',
    'w': '#ffffff',
    'b': '#80d4ff',
    'B': '#3399ff',
    'D': '#1a4d80',
    'o': '#ff7b00',
    'd': '#b34700', // FIXED: Added dark flame core key for engine thrust
  },
  // FIXED: Realigned wings, fuselage, and thrusters to be strictly symmetrical
  map: [
    "................................",
    "................................",
    "................................",
    "...............DD...............",
    "..............DwwD..............",
    "..............DbbD..............",
    ".............DbwwbD.............",
    ".............DbwwbD.............",
    "............DbBBBBbD............",
    "............DbBBBBbD............",
    "...........DbwBBBBwbD...........",
    "...........DbwwBBwwbD...........",
    "..........DbBBBBBBBBbD..........",
    "..........DbBBBBBBBBbD..........",
    ".........DbBBBBBBBBBBbD.........",
    ".........DbBBBBBBBBBBbD.........",
    "........DbBBBBBBBBBBBBbD........",
    "........DbBBBBBBBBBBBBbD........",
    ".......DbBBBBBBBBBBBBBBbD.......",
    "......DDDbBBBBBBBBBBBBbDDD......",
    ".....DDDbBBBBBBBBBBBBBBbDDD.....",
    "....DDDbBBBBBBBBBBBBBBBBbDDD....",
    "...DDDbBBBBBBBBBBBBBBBBBBbDDD...",
    "..DDDbBBBBBBBBBBBBBBBBBBBBbDDD..",
    ".DDDbBBBBBBBBBBBBBBBBBBBBBBbDDD.",
    ".DDDbBBwBBBBBBBBBBBBBBwBBbDDD.",
    ".DDDoobbboobbboobbboobbboobDDD.",
    "..DDooooodoooooooooooodoooooDD..",
    "...DDooddDDdoodddoobDDddooDD...",
    "....DDDDDDDDDDDDDDDDDDDDDDDD....",
    "................................",
    "................................",
  ]
};

// ============================================================================
// 2. METEOR RED (32x32)
// Jagged angular red-orange asteroid, spiky irregular silhouette, dark red outline,
// darker crater pixels. Hostile look.
// Palette (6 colors): . (transparent), R (bright red), r (medium red-orange), H (highlight orange), c (dark crater), D (dark red outline)
// ============================================================================
export const METEOR_RED_DEF: SpriteDefinition = {
  width: 32,
  height: 32,
  palette: {
    '.': '#00000000',
    'R': '#ff3b30',
    'r': '#d9381e',
    'H': '#ff7043',
    'c': '#4a0d0a',
    'D': '#61100c',
  },
  map: [
    "................................",
    "............DDD.................",
    "..........DDHHrDD...............",
    ".........DHRRRRRDD..............",
    "........DHRRHcRRRRD.............",
    ".......DHRRRccRRRRRD............",
    "......DHRRRRRRRRRRRD............",
    ".....DHRRRRcccccccRRD...........",
    "....DHRRRRccDDDDccRRDD..........",
    "....DRRRRRcDDDDDcRRRRD..........",
    "...DRRRRRDDDDDDDcRRRRRD.........",
    "..DRRRRRDDcHHHHcRRRRRRRD........",
    "..DRRRRRHcHHHHcRRRRRRRRD........",
    ".DRRRRRRHcHHHHcRRRRRRRRRD.......",
    ".DRRRRRRRRRRRRRRRRRRRRRRD.......",
    ".DRRRRccRRRRRRRRRRRRRRRRD.......",
    "DDRRRcccRRRRRRRRRRRRRRRRD.......",
    "DDRRRRccRRRRRccRRRRRRRRRD.......",
    ".DRRRRRRRRRRccccRRRRRRRRD.......",
    ".DRRRRRRRRRRccccRRRRRRRD........",
    ".DRRRRRRRRRRRRRRRRRRRRRD........",
    "..DRRRRRRRRRRRRRRRRRRRD.........",
    "..DRRRRRRRRccRRRRRRRRD..........",
    "...DRRRRRRccccRRRRRRD...........",
    "....DRRRRRccccRRRRRD............",
    ".....DRRRRRRRRRRRD..............",
    "......DDRRRRRRRRD...............",
    ".......DDDRRRRDD................",
    ".........DDDD...................",
    "................................",
    "................................",
    "................................",
  ]
};

// ============================================================================
// 3. METEOR YELLOW (32x32)
// Clear four-pointed diamond (rhombus) silhouette, bright yellow with pale highlight,
// amber shading bevels, and orange outline.
// Palette (8 colors):
//   . (transparent), Y (bright yellow), H (pale highlight), h (soft glint),
//   F (flat yellow fill), f (warm amber shading), O (orange outline), o (dark shadow)
// ============================================================================
export const METEOR_YELLOW_DEF: SpriteDefinition = {
  width: 32,
  height: 32,
  palette: {
    '.': '#00000000',
    'Y': '#ffea00',
    'H': '#ffff99',
    'h': '#fff275', // FIXED: Defined soft glint highlight for lowercase 'h'
    'F': '#ffcc00',
    'f': '#e6a800', // FIXED: Defined warm amber bevel for lowercase 'f'
    'O': '#ff8800',
    'o': '#b35900',
  },
  map: [
    "................................",
    "................................",
    "................OO..............",
    "..............OOYYOO............",
    ".............OYYHHYYO...........",
    "............OYYYYYYYYO..........",
    "...........OYYYYYYYYYYO.........",
    "..........OYYYYYYYYYYYYO........",
    ".........OYYYYYYYYYYYYYYO.......",
    "........OYYHHHHFFFFYYYYYO.......",
    ".......OYYHHhhhhFFFFYYYYYO......",
    "......OYYHHhhhhffffFFFFYYYO.....",
    ".....OYYHHHHhhhhffffFFFFYYYO....",
    "....OYYYYHHHHhhhhffffFFFFYYYO...",
    "...OYYYYYYHHHHhhhhffffFFFFYYYO..",
    "..OYYYYYYYYHHHHhhhhffffFFFFYYYO.",
    ".OYYYYYYYYYYHHHHhhhhffffFFFFYYO.",
    "oOYYYYYYYYYYYYHHHHhhhhffffYYOO..",
    ".oOOYYYYYYYYYYYYHHHHhhhhffOO....",
    "...oOOYYYYYYYYYYYYHHHHhhOO......",
    ".....oOOYYYYYYYYYYYYHHOO........",
    ".......oOOYYYYYYYYYYOO..........",
    ".........oOOYYYYYYOO............",
    "...........oOYYOO...............",
    ".............OO.................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ]
};

// ============================================================================
// 4. METEOR GREEN (32x32)
// Smooth round green asteroid with a white shield mark in the center, dark green outline.
// Friendly and protected look.
// ============================================================================
export const METEOR_GREEN_DEF: SpriteDefinition = {
  width: 32,
  height: 32,
  palette: {
    '.': '#00000000',
    'G': '#44cc44',
    'g': '#228822',
    'D': '#114411',
    'W': '#ffffff',
    's': '#88ff88',
  },
  map: [
    "................................",
    "................................",
    "..............DDDD..............",
    "...........DDGGGGGGDD...........",
    ".........DDGGggggggGDD..........",
    "........DGgggggggggggDD.........",
    ".......DGgggggggggggggDD........",
    "......DGgggGDDDDGggggggDD.......",
    ".....DGggggDWDWGDgggggggDD......",
    ".....DGgggDDWWWDGgggggggDD......",
    "....DGggggDWDWWDGggggggggDD.....",
    "....DGggggDWWWWWDGgggggggDD.....",
    "....DGggggDDWWWDGggggggggDD.....",
    "....DGgggggDDDDGgggggggggDD.....",
    "....DGgggggggggggggggggggDD.....",
    "....DGgggggggggggggggggggDD.....",
    "....DGgggggggggggggggggggDD.....",
    "....DGgggggggggggggggggggDD.....",
    ".....DGgggggggggggggggggDD......",
    ".....DGgggggggggggggggggDD......",
    "......DGgggggggggggggggDD.......",
    ".......DGgggggggggggggDD........",
    "........DGgggggggggggDD.........",
    ".........DDGgggggggGDD..........",
    "...........DDGGGGGGDD...........",
    "..............DDDD..............",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
    "................................",
  ]
};

// ============================================================================
// 5. CAPSULE (24x24)
// Small round glass orb with shiny highlight, thin dark outline,
// and neutral fill that receives color tints cleanly in code.
// ============================================================================
export const CAPSULE_DEF: SpriteDefinition = {
  width: 24,
  height: 24,
  palette: {
    '.': '#00000000',
    'D': '#222222',
    'G': '#bbbbbb',
    'g': '#999999',
    'W': '#ffffff',
    'E': '#ffffff', // Base fill tinted dynamically for power-up types
    'C': '#888888',
  },
  map: [
    "........................",
    "..........DDDD..........",
    "........DDGGGGDD........",
    ".......DGGEEEEGDD.......",
    "......DGGWWEEEEgDD......",
    ".....DGGWWEEEEEEgDD.....",
    "....DGGWWEEEEEEEEgDD....",
    "....DGGEEEEEEEEEEgDD....",
    "...DGGEEEEEEEEEEEEgDD...",
    "...DGGEEEEEEEEEEEEgDD...",
    "...DGGEEEEEEEEEEEEgDD...",
    "...DGGEEEEEEEEEEEEgDD...",
    "...DGGEEEEEEEEEEEEgDD...",
    "...DGGEEEEEEEEEEEEgDD...",
    "....DGGEEEEEEEEEEgDD....",
    "....DGGEEEEEEEEEEgDD....",
    ".....DGGEEEEEEEEgDD.....",
    "......DGGEEEEEEgDD......",
    ".......DGGEEEEgDD.......",
    "........DDGGGGDD........",
    "..........DDDD..........",
    "........................",
    "........................",
    "........................",
  ]
};

// ============================================================================
// TEXTURE RENDERER HELPER
// ============================================================================
export function renderSpriteToTexture(scene: Phaser.Scene, key: string, def: SpriteDefinition): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const canvasTexture = scene.textures.createCanvas(key, def.width, def.height);
  if (!canvasTexture) return;

  const ctx = canvasTexture.context;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, def.width, def.height);

  for (let y = 0; y < def.map.length; y++) {
    const row = def.map[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      const colorHex = def.palette[char];
      if (colorHex && colorHex !== '#00000000') {
        ctx.fillStyle = colorHex;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  canvasTexture.refresh();
}

/**
 * Loads and registers all 5 game sprites into Phaser's texture manager.
 */
export function loadAllSprites(scene: Phaser.Scene): void {
  renderSpriteToTexture(scene, 'ship', SHIP_DEF);
  renderSpriteToTexture(scene, 'meteorRed', METEOR_RED_DEF);
  renderSpriteToTexture(scene, 'meteorYellow', METEOR_YELLOW_DEF);
  renderSpriteToTexture(scene, 'meteorGreen', METEOR_GREEN_DEF);
  renderSpriteToTexture(scene, 'capsule', CAPSULE_DEF);
}

// ============================================================================
// TINT HELPERS
// ============================================================================

/**
 * Applies a color tint to a capsule sprite.
 * @param sprite Phaser Sprite game object
 * @param color Hex number or string (e.g. 0x60a5fa for Shield, 0xf87171 for Overcharge, 0x4ade80 for Slow-mo, 0xffd700 for Gold)
 */
export function tintCapsule(sprite: Phaser.GameObjects.Sprite, color: number | string): void {
  const tintVal = typeof color === 'string' ? Phaser.Display.Color.HexStringToColor(color).color : color;
  sprite.setTint(tintVal);
}

/**
 * Standard gold tint value for Round 2 items/UI.
 */
export function getRound2GoldTint(): number {
  return 0xffd700;
}

// ============================================================================
// PREVIEW SCENE FOR VERIFICATION
// ============================================================================
export class SpritePreviewScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SpritePreviewScene' });
  }

  preload() {
    loadAllSprites(this);
  }

  create() {
    this.cameras.main.setBackgroundColor('#0b0f19');

    this.add.text(24, 24, 'Sprite Preview (1x, 2x Single, 3x Cluster, 6x Boss)', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    const spriteKeys = ['ship', 'meteorRed', 'meteorYellow', 'meteorGreen', 'capsule'];
    const startY = 85;
    const rowSpacing = 95;

    spriteKeys.forEach((key, index) => {
      const y = startY + index * rowSpacing;

      this.add.text(24, y + 20, key, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#9ca3af'
      });

      // 1x Native
      this.add.sprite(180, y + 25, key).setOrigin(0.5).setScale(1);

      // 2x Single Email
      this.add.sprite(260, y + 25, key).setOrigin(0.5).setScale(2);

      // 3x Cluster
      this.add.sprite(370, y + 25, key).setOrigin(0.5).setScale(3);

      // 6x Boss Scale
      this.add.sprite(530, y + 25, key).setOrigin(0.5).setScale(6);

      // Tint demonstration for capsules
      if (key === 'capsule') {
        const shield = this.add.sprite(690, y + 25, key).setOrigin(0.5).setScale(3);
        tintCapsule(shield, 0x60a5fa); // Shield Blue

        const overcharge = this.add.sprite(770, y + 25, key).setOrigin(0.5).setScale(3);
        tintCapsule(overcharge, 0xf87171); // Overcharge Red

        const goldR2 = this.add.sprite(850, y + 25, key).setOrigin(0.5).setScale(3);
        tintCapsule(goldR2, getRound2GoldTint()); // Gold Round 2
      }
    });
  }
}
