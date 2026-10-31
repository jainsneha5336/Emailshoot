// MenuScene: Title & Mode Selection (PRD Section 6, 11 & 14)

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    window.SpriteGenerator.generateAll(this);
    this.load.image('heart-img', 'heartimage.jpeg');
  }

  create() {
    const { width, height } = this.scale;

    // Background Starfield
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.9)
      );
      this.stars.push(star);
    }

    // Title & Subtitles
    this.add.text(width / 2, 110, 'GMAIL METEOR CLEANER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#38bdf8',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 155, 'TRIAGE MODE - RETRO ARCADE INBOX DEFENDER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#94a3b8',
      align: 'center',
    }).setOrigin(0.5);

    // Decorative sprites
    const red = this.add.sprite(width / 2 - 140, 215, 'meteor-red').setScale(3);
    const ship = this.add.sprite(width / 2, 215, 'player-ship').setScale(3);
    const green = this.add.sprite(width / 2 + 140, 215, 'meteor-green').setScale(3);

    this.tweens.add({
      targets: [red, green],
      y: '+=10',
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 1. PLAY DEMO MODE BUTTON (Instant offline play with 5,000 emails)
    this.createRetroButton(width / 2, 330, 'PLAY DEMO MODE (5,000 EMAILS)', '#10b981', () => {
      window.soundSystem.playUpgrade();
      const demoEmails = window.generateDemoInbox(window.CONFIG.DEMO_INBOX_SIZE);
      this.scene.start('PreGameScene', {
        mode: 'demo',
        rawEmails: demoEmails,
      });
    });

    // 2. CONNECT GMAIL BUTTON (Real Gmail OAuth)
    this.createRetroButton(width / 2, 400, 'CONNECT GMAIL (OAUTH)', '#38bdf8', () => {
      window.soundSystem.playHit();
      this.promptGmailAuth();
    });

    // 3. HOW TO PLAY & SAFETY MODAL BUTTON
    this.createRetroButton(width / 2, 470, 'HOW TO PLAY & SAFETY RULES', '#eab308', () => {
      window.soundSystem.playHit();
      this.showSafetyModal();
    });

    // 4. DRY_RUN MODE TOGGLE
    const isDry = window.gmailClient.dryRun;
    this.dryRunText = this.add.text(width / 2, 535, `DRY_RUN MODE: [ ${isDry ? 'ON (SAFE LOGS)' : 'OFF (REAL TRASH)'} ]`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: isDry ? '#a3e635' : '#f87171',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.dryRunText.on('pointerdown', () => {
      window.gmailClient.setDryRun(!window.gmailClient.dryRun);
      const active = window.gmailClient.dryRun;
      this.dryRunText.setText(`DRY_RUN MODE: [ ${active ? 'ON (SAFE LOGS)' : 'OFF (REAL TRASH)'} ]`);
      this.dryRunText.setColor(active ? '#a3e635' : '#f87171');
      window.soundSystem.playHit();
    });

    // Footer info
    this.add.text(width / 2, 650, 'CONTROLS: Aim with Mouse | Hold Left-Click/Space to Fire Laser\nK or Right-Click = Keep Sender | Esc = Let Go | Ctrl+Z = Undo', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#64748b',
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Audio Mute Toggle Button at top right
    this.audioBtn = this.add.text(width - 30, 30, window.soundSystem.muted ? '[SFX: OFF]' : '[SFX: ON]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#94a3b8',
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    this.audioBtn.on('pointerdown', () => {
      const isMuted = window.soundSystem.toggleMute();
      this.audioBtn.setText(isMuted ? '[SFX: OFF]' : '[SFX: ON]');
    });
  }

  createRetroButton(x, y, label, textColor, onClick) {
    const btn = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 480, 48, 0x0f172a)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(textColor).color);

    const text = this.add.text(0, 0, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: textColor,
    }).setOrigin(0.5);

    btn.add([bg, text]);
    btn.setSize(480, 48);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(textColor).color, 0.2);
    });
    btn.on('pointerout', () => {
      bg.setFillStyle(0x0f172a, 1.0);
    });
    btn.on('pointerdown', onClick);

    return btn;
  }

  promptGmailAuth() {
    const modal = document.getElementById('oauth-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  showSafetyModal() {
    const modal = document.getElementById('safety-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  update() {
    for (const star of this.stars) {
      star.y += 0.3;
      if (star.y > this.scale.height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, this.scale.width);
      }
    }
  }
}

window.MenuScene = MenuScene;
