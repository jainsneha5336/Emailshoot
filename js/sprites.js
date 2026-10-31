// Procedural Retro Pixel Art Generator (PRD Section 15)

class SpriteGenerator {
  static createTextureFromGrid(scene, key, grid, palette, pixelSize = 2) {
    if (scene.textures.exists(key)) return;

    const height = grid.length;
    const width = grid[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < height; y++) {
      const row = grid[y];
      for (let x = 0; x < width; x++) {
        const char = row[x];
        const color = palette[char];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    scene.textures.addCanvas(key, canvas);
  }

  static generateAll(scene) {
    // 1. PLAYER SHIP
    const shipGrid = [
      '.......XX.......',
      '......XXXX......',
      '......XXXX......',
      '.....XXXXXX.....',
      '.....XWXXWX.....',
      '....XXWXXWXX....',
      '....XXXXXXXX....',
      '...XXXXXXXXXX...',
      '...XXXCCCCXXX...',
      '..XXCCCCCCCCXX..',
      '..XXCCCCCCCCXX..',
      '.XXXX.CCCC.XXXX.',
      'XXXX...CC...XXXX',
      'XXX..........XXX',
      'XX....YYYY....XX',
      '.X....OOOO....X.',
    ];
    const shipPalette = {
      '.': null,
      'X': '#e2e8f0',
      'W': '#38bdf8',
      'C': '#64748b',
      'Y': '#facc15',
      'O': '#f97316',
    };
    this.createTextureFromGrid(scene, 'player-ship', shipGrid, shipPalette, 2);

    // 2. RED METEOR
    const redGrid = [
      '....XXXXXX......',
      '..XXXXXXXXXX....',
      '.XXXXXXXXXXXX...',
      'XXXXXXXXDXXXXX..',
      'XXXXXXDDDDXXXXX.',
      'XXXXXDDDDDDXXXXX',
      'XXXXXDDDMDDXXXXX',
      'XXXXXXDMMDXXXXXX',
      '.XXXXXXXXXXXXXXX',
      '.XXXXXXXXXXXXXX.',
      '..XXXXXXXXXXXXX.',
      '..XXXXXXXXXXXX..',
      '...XXXXXXXXXXX..',
      '....XXXXXXXX....',
      '......XXXX......',
      '................',
    ];
    const redPalette = {
      '.': null,
      'X': '#ef4444',
      'D': '#b91c1c',
      'M': '#7f1d1d',
    };
    this.createTextureFromGrid(scene, 'meteor-red', redGrid, redPalette, 2);

    // 3. YELLOW METEOR
    const yellowGrid = [
      '.......XX.......',
      '......XXXX......',
      '.....XXXXXX.....',
      '....XXXXXXXX....',
      '...XXXXXXXXXX...',
      '..XXXXXXDXXXXX..',
      '.XXXXXXDDXXXXXX.',
      'XXXXXXXXDXXXXXXX',
      'XXXXXXXXDXXXXXXX',
      '.XXXXXXDDXXXXXX.',
      '..XXXXXXDXXXXX..',
      '...XXXXXXXXXX...',
      '....XXXXXXXX....',
      '.....XXXXXX.....',
      '......XXXX......',
      '.......XX.......',
    ];
    const yellowPalette = {
      '.': null,
      'X': '#eab308',
      'D': '#a16207',
    };
    this.createTextureFromGrid(scene, 'meteor-yellow', yellowGrid, yellowPalette, 2);

    // 4. GREEN METEOR
    const greenGrid = [
      '....XXXXXXXX....',
      '..XXXXXXXXXXXX..',
      '.XXXXXXXXXXXXXX.',
      '.XXXXXXSSXXXXXX.',
      'XXXXXXSSSSXXXXXX',
      'XXXXXSSSSSSXXXXX',
      'XXXXXSSSSSSXXXXX',
      'XXXXXXSSSSXXXXXX',
      'XXXXXXXSSXXXXXXX',
      'XXXXXXXXSXXXXXXX',
      '.XXXXXXXXXXXXXX.',
      '.XXXXXXXXXXXXXX.',
      '..XXXXXXXXXXXX..',
      '....XXXXXXXX....',
      '................',
      '................',
    ];
    const greenPalette = {
      '.': null,
      'X': '#22c55e',
      'S': '#ffffff',
    };
    this.createTextureFromGrid(scene, 'meteor-green', greenGrid, greenPalette, 2);

    // 5. GOLD METEOR
    const goldGrid = [
      '....XXXXXXXX....',
      '..XXXXXXXXXXXX..',
      '.XXXXXXXXXXXXXX.',
      '.XXXXXX**XXXXXX.',
      'XXXXXX****XXXXXX',
      'XXXXX******XXXXX',
      'XXXXX******XXXXX',
      'XXXXXX****XXXXXX',
      'XXXXXXX**XXXXXXX',
      'XXXXXXXX*XXXXXXX',
      '.XXXXXXXXXXXXXX.',
      '.XXXXXXXXXXXXXX.',
      '..XXXXXXXXXXXX..',
      '....XXXXXXXX....',
      '................',
      '................',
    ];
    const goldPalette = {
      '.': null,
      'X': '#fbbf24',
      '*': '#ffffff',
    };
    this.createTextureFromGrid(scene, 'meteor-gold', goldGrid, goldPalette, 2);

    // 6. POWER-UP CAPSULE
    const capsuleGrid = [
      '....XXXXXX....',
      '..XXXXXXXXXX..',
      '.XXWWXXXXXXXX.',
      '.XXWWXXXXXXXX.',
      'XXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXX',
      '.XXXXXXXXXXXX.',
      '.XXXXXXXXXXXX.',
      '..XXXXXXXXXX..',
      '....XXXXXX....',
    ];
    const capsulePalette = {
      '.': null,
      'X': '#ffffff',
      'W': '#94a3b8',
    };
    this.createTextureFromGrid(scene, 'powerup-capsule', capsuleGrid, capsulePalette, 2);
  }
}

window.SpriteGenerator = SpriteGenerator;
