// RescueScene: Round 2 Star Rescue (PRD Section 9 & 11)

class RescueScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RescueScene' });
  }

  init(data) {
    this.mode = data.mode || 'demo';
    this.classifier = data.classifier;
    this.allEmails = data.allEmails || [];
    this.trashedCount = data.trashedCount || 0;
    this.score = data.score || 0;
    this.comboRecord = data.comboRecord || 1;
    this.startTime = data.startTime || Date.now();
    this.trashQueue = data.trashQueue;

    this.candidateEmails = this.allEmails.filter(email => {
      const cls = this.classifier.classify(email);
      return cls && (cls.color === 'green' || cls.color === 'yellow');
    });

    this.starredCount = 0;
    this.activeMeteors = [];
    this.isFiring = false;
    this.targetX = window.CONFIG.GAME_WIDTH / 2;
    this.targetY = 0;
  }

  create() {
    const { width, height } = this.scale;

    this.stars = [];
    for (let i = 0; i < 90; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        Phaser.Math.Between(1, 2),
        0xfef08a,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
      this.stars.push(star);
    }

    this.playerShip = this.add.sprite(width / 2, height - 75, 'player-ship')
      .setScale(2.5)
      .setTint(0xfef08a)
      .setDepth(10);

    this.laserGraphics = this.add.graphics().setDepth(8);

    const banner = document.getElementById('round2-banner');
    if (banner) banner.classList.remove('hidden');

    this.updateRescueHUD();

    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.isFiring = true;
        window.soundSystem.startLaser(false);
      }
    });

    this.input.on('pointerup', () => {
      this.isFiring = false;
      window.soundSystem.stopLaser();
    });

    this.input.on('pointermove', (pointer) => {
      this.targetX = pointer.x;
      this.targetY = pointer.y;
      this.playerShip.x = Phaser.Math.Clamp(pointer.x, 40, width - 40);
      this.updateInspectorAt(pointer.x, pointer.y);
    });

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    const skipBtn = document.getElementById('rescue-skip-btn');
    if (skipBtn) {
      skipBtn.onclick = () => this.finishRound2();
    }

    this.spawnTimer = 0;
  }

  updateRescueHUD() {
    const counter = document.getElementById('rescue-counter');
    if (counter) {
      counter.textContent = `STARRED: ${this.starredCount} / ${this.candidateEmails.length}`;
    }
  }

  update(time, delta) {
    const dt = delta / 1000;

    if (this.spaceKey.isDown && !this.isFiring) {
      this.isFiring = true;
      window.soundSystem.startLaser(false);
    } else if (this.spaceKey.isUp && this.isFiring && !this.input.activePointer.leftButtonDown()) {
      this.isFiring = false;
      window.soundSystem.stopLaser();
    }

    for (const star of this.stars) {
      star.y += 0.4;
      if (star.y > this.scale.height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, this.scale.width);
      }
    }

    this.spawnTimer += delta;
    if (this.spawnTimer > 1600 && this.activeMeteors.length < 5 && this.candidateEmails.length > 0) {
      this.spawnRescueMeteor();
      this.spawnTimer = 0;
    }

    const { height } = this.scale;
    for (let i = this.activeMeteors.length - 1; i >= 0; i--) {
      const m = this.activeMeteors[i];
      m.sprite.y += window.CONFIG.ROUND2.METEOR_SPEED * dt;
      m.label.y = m.sprite.y + (window.CONFIG.METEORS.LABEL_TAG.OFFSET_Y * 1.5);

      if (m.sprite.y > height - 60) {
        m.sprite.destroy();
        m.label.destroy();
        this.activeMeteors.splice(i, 1);
      }
    }

    this.updateGoldLaser(delta);
  }

  spawnRescueMeteor() {
    const email = this.candidateEmails.shift();
    const { width } = this.scale;
    const x = Phaser.Math.Between(80, width - 80);

    const sprite = this.add.sprite(x, -30, 'meteor-gold')
      .setScale(window.CONFIG.METEORS.SPRITE_SCALES.SINGLE)
      .setDepth(5);

    let shortName = email.senderName || email.sender;
    if (shortName.length > 12) shortName = shortName.substring(0, 12) + '…';

    const label = this.add.text(x, -30 + 35, shortName, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#fef08a',
      backgroundColor: '#172554',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(6);

    this.activeMeteors.push({
      email,
      sprite,
      label,
      holdTime: 0,
    });
  }

  updateGoldLaser(delta) {
    this.laserGraphics.clear();
    if (!this.isFiring) return;

    const shipX = this.playerShip.x;
    const shipY = this.playerShip.y - 18;

    this.laserGraphics.lineStyle(window.CONFIG.WEAPON.BEAM_WIDTH + 2, window.CONFIG.WEAPON.GOLD_BEAM_COLOR, 0.4);
    this.laserGraphics.lineBetween(shipX, shipY, this.targetX, this.targetY);
    this.laserGraphics.lineStyle(window.CONFIG.WEAPON.BEAM_WIDTH, 0xffffff, 0.95);
    this.laserGraphics.lineBetween(shipX, shipY, this.targetX, this.targetY);

    for (let i = this.activeMeteors.length - 1; i >= 0; i--) {
      const m = this.activeMeteors[i];
      const dist = Phaser.Math.Distance.Between(this.targetX, this.targetY, m.sprite.x, m.sprite.y);

      if (dist < 35) {
        m.holdTime += delta;
        m.sprite.setTint(0xffffff);

        if (m.holdTime >= window.CONFIG.ROUND2.HOLD_TO_STAR_MS) {
          this.starEmail(m, i);
        }
        break;
      } else {
        m.sprite.setTint(0xfbbf24);
      }
    }
  }

  async starEmail(meteor, index) {
    window.soundSystem.playStar();
    this.starredCount++;
    this.score += window.CONFIG.SCORE.ROUND2_STARRED;

    if (this.mode !== 'demo') {
      try {
        await window.gmailClient.batchStar([meteor.email.id]);
      } catch (e) {
        console.error('Star failed', e);
      }
    }

    meteor.sprite.destroy();
    meteor.label.destroy();
    this.activeMeteors.splice(index, 1);
    this.updateRescueHUD();
  }

  updateInspectorAt(x, y) {
    let hoveredMeteor = null;
    for (const m of this.activeMeteors) {
      const dist = Phaser.Math.Distance.Between(x, y, m.sprite.x, m.sprite.y);
      if (dist < 35) {
        hoveredMeteor = m;
        break;
      }
    }

    const panel = document.getElementById('inspector-panel');
    if (!panel) return;

    if (hoveredMeteor) {
      panel.style.opacity = '1.0';
      const email = hoveredMeteor.email;
      panel.innerHTML = `
        <div class="insp-col"><span class="insp-tag green">[STAR RESCUE]</span> <strong>${email.senderName || email.sender}</strong></div>
        <div class="insp-subject">${email.subject}</div>
        <div class="insp-meta">Hold laser 1s to Star this email in your mailbox | Date: ${email.date}</div>
      `;
    }
  }

  finishRound2() {
    window.soundSystem.stopLaser();
    const banner = document.getElementById('round2-banner');
    if (banner) banner.classList.add('hidden');

    this.scene.start('StatsScene', {
      mode: this.mode,
      allEmails: this.allEmails,
      trashedCount: this.trashedCount,
      starredCount: this.starredCount,
      score: this.score,
      comboRecord: this.comboRecord,
      startTime: this.startTime,
      trashQueue: this.trashQueue,
    });
  }
}

window.RescueScene = RescueScene;
