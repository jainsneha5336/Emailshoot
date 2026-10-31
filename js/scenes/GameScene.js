// GameScene: Round 1 Meteor Cleanup Engine (PRD Sections 7, 8, 10, 11, 15)

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.mode = data.mode || 'demo';
    this.classifier = data.classifier;
    this.meteorsPayload = [...(data.meteorsPayload || [])];
    this.bossSenders = data.bossSenders || [];
    this.allEmails = data.allEmails || [];

    // Player state
    this.lives = window.CONFIG.CHECKPOINTS.INITIAL_LIVES;
    this.score = 0;
    this.combo = 1;
    this.correctKillsInRow = 0;
    this.gunLevel = 1;
    this.waveNumber = 1;

    // Checkpoint tracking
    this.emailsTrashedTotal = 0;
    this.lastCheckpointThreshold = 0;

    // Power-up state
    this.activePowerup = null;
    this.powerupTimer = 0;
    this.nextPowerupSpawnTime = Phaser.Math.Between(window.CONFIG.POWERUPS.COOLDOWN_MIN_S, window.CONFIG.POWERUPS.COOLDOWN_MAX_S) * 1000;
    this.timeSinceLastPowerup = 0;
    this.powerupCooldownReduction = 1.0;

    // Chain blast tracking
    this.redStreak = 0;

    // Firing state
    this.isFiring = false;
    this.targetX = window.CONFIG.GAME_WIDTH / 2;
    this.targetY = 0;

    // Active entities
    this.activeMeteors = [];
    this.activePowerupCapsules = [];

    // Yellow freeze state
    this.frozenMeteor = null;
    this.freezeTimer = 0;

    // Inspector panel state
    this.inspectedMeteor = null;
    this.inspectorFadeTimer = null;

    // Performance & pace tracking
    this.startTime = Date.now();
    this.totalEmailsToTrash = this.meteorsPayload
      .filter(m => m.color === 'red')
      .reduce((sum, m) => sum + m.count, 0);

    // Initialise Trash Queue
    this.trashQueue = new window.TrashQueue({
      onFlush: async (ids, items) => {
        if (this.mode === 'demo') {
          console.log(`[DEMO TRASH] Moved ${ids.length} emails to virtual Trash`);
          return;
        }
        await window.gmailClient.batchTrash(ids);
      },
      onUndo: async (ids, items) => {
        if (this.mode === 'demo') {
          console.log(`[DEMO UNDO] Restored ${ids.length} emails from virtual Trash`);
          return;
        }
        await window.gmailClient.batchRestoreFromTrash(ids);
      },
      onQueueUpdate: (counts) => {
        this.updateHUDCounts(counts);
      },
    });
  }

  create() {
    const { width, height } = this.scale;

    // 1. Starfield background
    this.stars = [];
    for (let i = 0; i < 110; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.9)
      );
      this.stars.push(star);
    }

    // 2. Player Defender Ship
    this.playerShip = this.add.sprite(width / 2, height - 75, 'player-ship')
      .setScale(2.5)
      .setDepth(10);

    // Ship power-up translucent aura/bubble
    this.shipBubble = this.add.circle(this.playerShip.x, this.playerShip.y, 36, 0x38bdf8, 0)
      .setDepth(9);

    // 3. Laser graphics container
    this.laserGraphics = this.add.graphics().setDepth(8);

    // 4. Input handling: Mouse aim & fire
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.handleKeepSenderAt(pointer.x, pointer.y);
      } else if (pointer.leftButtonDown()) {
        this.isFiring = true;
        window.soundSystem.startLaser(this.activePowerup === 'overcharge');
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (!pointer.leftButtonDown()) {
        this.isFiring = false;
        window.soundSystem.stopLaser();
      }
    });

    this.input.on('pointermove', (pointer) => {
      this.targetX = pointer.x;
      this.targetY = pointer.y;
      this.playerShip.x = Phaser.Math.Clamp(pointer.x, 40, width - 40);
      this.shipBubble.x = this.playerShip.x;

      this.updateInspectorAt(pointer.x, pointer.y);
    });

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.kKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.game.canvas.oncontextmenu = (e) => e.preventDefault();

    this.setupHUD();
    this.spawnTimer = 0;
  }

  setupHUD() {
    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.remove('hidden');

    this.updateHUDDisplay();

    const undoBtn = document.getElementById('hud-undo-btn');
    if (undoBtn) {
      undoBtn.onclick = () => this.triggerUndo();
    }
  }

  updateHUDDisplay() {
    const heartsElem = document.getElementById('hud-hearts');
    if (heartsElem) {
      heartsElem.innerHTML = '❤️'.repeat(this.lives) + '🖤'.repeat(Math.max(0, window.CONFIG.CHECKPOINTS.MAX_LIVES - this.lives));
    }

    const scoreElem = document.getElementById('hud-score');
    if (scoreElem) scoreElem.textContent = this.score.toLocaleString();

    const comboElem = document.getElementById('hud-combo');
    if (comboElem) comboElem.textContent = `x${this.combo}`;

    const gunElem = document.getElementById('hud-gun');
    if (gunElem) gunElem.textContent = `Lv.${this.gunLevel}`;

    const paceElem = document.getElementById('hud-pace');
    if (paceElem) {
      const elapsedMins = Math.max(0.1, (Date.now() - this.startTime) / 60000);
      const estTotalMins = Math.round((this.totalEmailsToTrash / Math.max(1, this.emailsTrashedTotal)) * elapsedMins);
      paceElem.textContent = `${this.emailsTrashedTotal.toLocaleString()} / ${this.totalEmailsToTrash.toLocaleString()} trashed (Est. ~${Math.min(45, estTotalMins)}m)`;
    }

    const progressFill = document.getElementById('hud-checkpoint-fill');
    if (progressFill) {
      const currentWaveProgress = (this.emailsTrashedTotal % window.CONFIG.CHECKPOINTS.EMAILS_PER_CHECKPOINT);
      const pct = (currentWaveProgress / window.CONFIG.CHECKPOINTS.EMAILS_PER_CHECKPOINT) * 100;
      progressFill.style.width = `${pct}%`;
    }

    const dryRunBadge = document.getElementById('hud-dryrun');
    if (dryRunBadge) {
      dryRunBadge.style.display = window.gmailClient.dryRun ? 'inline-block' : 'none';
    }
  }

  updateHUDCounts(counts) {
    const trashCounter = document.getElementById('hud-counter');
    if (trashCounter) {
      trashCounter.textContent = `TRASHED: ${counts.trashed} | QUEUED: ${counts.queued}`;
    }
  }

  update(time, delta) {
    const dt = delta / 1000;

    if (this.spaceKey.isDown && !this.isFiring) {
      this.isFiring = true;
      window.soundSystem.startLaser(this.activePowerup === 'overcharge');
    } else if (this.spaceKey.isUp && this.isFiring && !this.input.activePointer.leftButtonDown()) {
      this.isFiring = false;
      window.soundSystem.stopLaser();
    }

    if (Phaser.Input.Keyboard.JustDown(this.kKey)) {
      this.handleKeepSenderAt(this.targetX, this.targetY);
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.releaseFrozenYellow();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.frozenMeteor) {
      this.trashFrozenYellow();
    }

    if (Phaser.Input.Keyboard.JustDown(this.mKey)) {
      window.soundSystem.toggleMute();
    }

    const speedFactor = this.activePowerup === 'slowmo' ? 0.5 : 1.0;
    for (const star of this.stars) {
      star.y += 0.8 * speedFactor;
      if (star.y > this.scale.height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, this.scale.width);
      }
    }

    if (this.activePowerup) {
      this.powerupTimer -= delta;
      this.updatePowerupHUD();
      if (this.powerupTimer <= 0) {
        this.deactivatePowerup();
      }
    } else {
      this.timeSinceLastPowerup += delta;
      if (this.timeSinceLastPowerup >= this.nextPowerupSpawnTime && this.activePowerupCapsules.length === 0) {
        this.spawnPowerupCapsule();
        this.timeSinceLastPowerup = 0;
        this.nextPowerupSpawnTime = Phaser.Math.Between(window.CONFIG.POWERUPS.COOLDOWN_MIN_S, window.CONFIG.POWERUPS.COOLDOWN_MAX_S) * 1000 * this.powerupCooldownReduction;
      }
    }

    this.spawnTimer += delta;
    const spawnInterval = (this.activeMeteors.length < 3) ? 1000 : 2000;
    if (this.spawnTimer > spawnInterval && this.activeMeteors.length < window.CONFIG.METEORS.MAX_ON_SCREEN) {
      this.spawnMeteor();
      this.spawnTimer = 0;
    }

    this.updateMeteors(delta, speedFactor);
    this.updatePowerupCapsules(delta, speedFactor);
    this.updateLaser(delta);

    if (this.frozenMeteor) {
      this.updateYellowFreeze(delta);
    }
  }

  /**
   * Spaced column picker to prevent label overlaps (PRD Section 7)
   */
  pickSpawnLane() {
    const lanes = [120, 240, 360, 480, 600, 720, 840];
    const availableLanes = lanes.filter(laneX => {
      // Check if any active meteor is in this lane near the top
      return !this.activeMeteors.some(m => Math.abs(m.sprite.x - laneX) < 90 && m.sprite.y < 120);
    });

    if (availableLanes.length > 0) {
      return availableLanes[Phaser.Math.Between(0, availableLanes.length - 1)];
    }
    return lanes[Phaser.Math.Between(0, lanes.length - 1)];
  }

  spawnMeteor() {
    if (this.meteorsPayload.length === 0) {
      if (this.activeMeteors.length === 0) {
        this.triggerVictoryRound2();
      }
      return;
    }

    const payload = this.meteorsPayload.shift();
    const { width } = this.scale;

    let textureKey = 'meteor-red';
    let scale = window.CONFIG.METEORS.SPRITE_SCALES.SINGLE;

    if (payload.color === 'yellow') {
      textureKey = 'meteor-yellow';
      scale = window.CONFIG.METEORS.SPRITE_SCALES.SINGLE;
    } else if (payload.color === 'green') {
      textureKey = 'meteor-green';
      scale = window.CONFIG.METEORS.SPRITE_SCALES.SINGLE;
    } else if (payload.type === 'boss') {
      textureKey = 'meteor-red';
      scale = window.CONFIG.METEORS.SPRITE_SCALES.BOSS;
      this.showToast(`⚠️ WARNING: CLUTTER BOSS [${payload.senderName}] INCOMING!`);
    } else if (payload.type === 'cluster') {
      textureKey = 'meteor-red';
      scale = window.CONFIG.METEORS.SPRITE_SCALES.CLUSTER;
    }

    const x = this.pickSpawnLane();
    const y = -60;

    let hp = window.CONFIG.METEORS.BASE_HP * Math.pow(1 + window.CONFIG.METEORS.HP_GROWTH_PER_WAVE, this.waveNumber - 1);
    if (payload.type === 'cluster') {
      hp *= (1 + window.CONFIG.CLUSTERING.CLUSTER_HP_EXTRA_PER_EMAIL * (payload.count - 1));
    } else if (payload.type === 'boss') {
      hp *= window.CONFIG.CLUSTERING.BOSS_HP_MULTIPLIER;
    }

    const sprite = this.add.sprite(x, y, textureKey)
      .setScale(scale)
      .setDepth(5);

    let shortName = payload.senderName || 'Sender';
    if (shortName.length > window.CONFIG.METEORS.LABEL_TAG.MAX_NAME_LENGTH) {
      shortName = shortName.substring(0, window.CONFIG.METEORS.LABEL_TAG.MAX_NAME_LENGTH) + '…';
    }
    const tagText = payload.count > 1 ? `${shortName} x${payload.count}` : shortName;

    const label = this.add.text(x, y + window.CONFIG.METEORS.LABEL_TAG.OFFSET_Y * (scale / 2), tagText, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: window.CONFIG.METEORS.LABEL_TAG.FONT_SIZE,
      color: payload.color === 'red' ? '#fca5a5' : (payload.color === 'yellow' ? '#fef08a' : '#86efac'),
      backgroundColor: '#090d16',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(6);

    const fallSpeed = payload.type === 'boss' ? 22 : Phaser.Math.Between(window.CONFIG.METEORS.FALL_SPEED_MIN, window.CONFIG.METEORS.FALL_SPEED_MAX);

    const meteorObj = {
      payload,
      sprite,
      label,
      scale,
      maxHp: hp,
      currentHp: hp,
      fallSpeed,
      isFrozen: false,
      frozenOverlay: null,
      freezeHoldTime: 0,
      damageOffTimer: 0,
      greenHoldTime: 0,
    };

    this.activeMeteors.push(meteorObj);
  }

  updateMeteors(delta, speedFactor) {
    const dt = delta / 1000;
    const { height } = this.scale;

    for (let i = this.activeMeteors.length - 1; i >= 0; i--) {
      const m = this.activeMeteors[i];
      if (m.isFrozen) continue;

      m.sprite.y += m.fallSpeed * dt * speedFactor;
      m.label.y = m.sprite.y + (window.CONFIG.METEORS.LABEL_TAG.OFFSET_Y * (m.scale / 2));

      if (m.damageOffTimer > 0) {
        m.damageOffTimer -= delta;
        if (m.damageOffTimer <= 0 && m.currentHp < m.maxHp) {
          m.currentHp = Math.min(m.maxHp, m.currentHp + (m.maxHp * 0.25 * dt));
          m.sprite.clearTint();
        }
      }

      if (m.sprite.y > height - 60) {
        this.handleMeteorReachedBottom(m, i);
      }
    }
  }

  handleMeteorReachedBottom(meteor, index) {
    if (meteor.payload.color === 'red') {
      this.redStreak = 0;
    }
    meteor.sprite.destroy();
    meteor.label.destroy();
    this.activeMeteors.splice(index, 1);
  }

  updateLaser(delta) {
    this.laserGraphics.clear();
    if (!this.isFiring) return;

    const dt = delta / 1000;
    const shipX = this.playerShip.x;
    const shipY = this.playerShip.y - 18;

    const dps = (window.CONFIG.WEAPON.BASE_DPS + (this.gunLevel - 1) * window.CONFIG.WEAPON.DPS_PER_LEVEL) *
      (this.activePowerup === 'overcharge' ? 2.0 : 1.0);

    const beamColor = this.activePowerup === 'overcharge' ? window.CONFIG.WEAPON.OVERCHARGE_COLOR : window.CONFIG.WEAPON.BEAM_COLOR;

    if (this.activePowerup === 'multibeam') {
      this.drawBeamLine(shipX, shipY, this.targetX, this.targetY, beamColor);
      this.drawBeamLine(shipX - 18, shipY, this.targetX - 70, this.targetY, beamColor);
      this.drawBeamLine(shipX + 18, shipY, this.targetX + 70, this.targetY, beamColor);
    } else {
      this.drawBeamLine(shipX, shipY, this.targetX, this.targetY, beamColor);
    }

    for (let i = this.activePowerupCapsules.length - 1; i >= 0; i--) {
      const cap = this.activePowerupCapsules[i];
      const dist = Phaser.Math.Distance.Between(this.targetX, this.targetY, cap.sprite.x, cap.sprite.y);
      if (dist < 30) {
        this.collectPowerup(cap.type);
        cap.sprite.destroy();
        this.activePowerupCapsules.splice(i, 1);
        return;
      }
    }

    let hitAny = false;
    for (let i = this.activeMeteors.length - 1; i >= 0; i--) {
      const m = this.activeMeteors[i];
      const hitRadius = (m.scale * 16) + 12;
      const dist = Phaser.Math.Distance.Between(this.targetX, this.targetY, m.sprite.x, m.sprite.y);

      if (dist < hitRadius) {
        hitAny = true;
        this.handleLaserHitOnMeteor(m, dps, dt, delta);
        break;
      }
    }

    if (hitAny) {
      window.soundSystem.playHit();
    }
  }

  drawBeamLine(x1, y1, x2, y2, color) {
    const coreColor = window.CONFIG.WEAPON.BEAM_CORE_COLOR || 0xff5252;
    this.laserGraphics.lineStyle(window.CONFIG.WEAPON.BEAM_WIDTH + 3, color, 0.45);
    this.laserGraphics.lineBetween(x1, y1, x2, y2);
    this.laserGraphics.lineStyle(window.CONFIG.WEAPON.BEAM_WIDTH, coreColor, 0.95);
    this.laserGraphics.lineBetween(x1, y1, x2, y2);
  }

  handleLaserHitOnMeteor(meteor, dps, dt, delta) {
    const payload = meteor.payload;

    if (payload.color === 'green') {
      meteor.greenHoldTime += delta;
      if (meteor.greenHoldTime >= window.CONFIG.METEORS.GREEN_HIT_THRESHOLD_MS) {
        meteor.greenHoldTime = 0;
        this.handleGreenHit();
      }
      return;
    }

    if (payload.color === 'yellow') {
      if (!meteor.isFrozen) {
        meteor.freezeHoldTime += delta;
        if (meteor.freezeHoldTime >= window.CONFIG.YELLOW_FREEZE.HOLD_TO_FREEZE_MS) {
          this.freezeYellowMeteor(meteor);
        }
      } else {
        meteor.confirmHoldTime = (meteor.confirmHoldTime || 0) + delta;
        if (meteor.confirmHoldTime >= window.CONFIG.YELLOW_FREEZE.CONFIRM_HOLD_MS) {
          this.trashFrozenYellow();
        }
      }
      return;
    }

    if (payload.color === 'red') {
      meteor.currentHp -= dps * dt;
      meteor.damageOffTimer = window.CONFIG.METEORS.DAMAGE_FADE_DELAY_MS;

      const healthPct = meteor.currentHp / meteor.maxHp;
      if (healthPct < 0.5) {
        meteor.sprite.setTint(0xffffff);
      } else {
        meteor.sprite.setTint(0xfca5a5);
      }

      if (meteor.currentHp <= 0) {
        this.destroyRedMeteor(meteor);
      }
    }
  }

  destroyRedMeteor(meteor) {
    const payload = meteor.payload;
    window.soundSystem.playShatter(payload.type === 'boss');

    let points = 0;
    if (payload.type === 'boss') {
      points = window.CONFIG.SCORE.BOSS_BASE + (payload.count * window.CONFIG.SCORE.BOSS_PER_EMAIL);
      this.promptUnsubscribeMissile(payload);
      this.spawnPowerupCapsule();
    } else {
      points = payload.count * window.CONFIG.SCORE.RED_EMAIL_TRASHED;
      if (payload.count > 1) {
        points += Math.round(points * window.CONFIG.CLUSTERING.CLUSTER_HP_EXTRA_PER_EMAIL * (payload.count - 1));
      }
    }

    this.score += points * this.combo;
    this.trashQueue.enqueue(payload.emails, points);
    this.emailsTrashedTotal += payload.count;

    this.correctKillsInRow++;
    if (this.correctKillsInRow % window.CONFIG.SCORE.COMBO_STEP === 0 && this.combo < window.CONFIG.SCORE.MAX_COMBO) {
      this.combo++;
    }

    this.redStreak++;
    if (this.redStreak >= window.CONFIG.CHAIN.STREAK_REQUIREMENT) {
      this.triggerChainBlast();
      this.redStreak = 0;
    }

    if (this.emailsTrashedTotal >= this.lastCheckpointThreshold + window.CONFIG.CHECKPOINTS.EMAILS_PER_CHECKPOINT) {
      this.lastCheckpointThreshold = Math.floor(this.emailsTrashedTotal / window.CONFIG.CHECKPOINTS.EMAILS_PER_CHECKPOINT) * window.CONFIG.CHECKPOINTS.EMAILS_PER_CHECKPOINT;
      this.triggerCheckpoint();
    }

    const idx = this.activeMeteors.indexOf(meteor);
    if (idx !== -1) {
      meteor.sprite.destroy();
      meteor.label.destroy();
      this.activeMeteors.splice(idx, 1);
    }

    this.updateHUDDisplay();
  }

  freezeYellowMeteor(meteor) {
    if (this.frozenMeteor) return;

    window.soundSystem.playFreeze();
    meteor.isFrozen = true;
    this.frozenMeteor = meteor;
    this.freezeTimer = window.CONFIG.YELLOW_FREEZE.TIMER_DURATION_MS;

    const overlayWidth = (meteor.scale * 16) + 24;
    const overlayHeight = (meteor.scale * 16) + 24;
    meteor.frozenOverlay = this.add.rectangle(
      meteor.sprite.x,
      meteor.sprite.y,
      overlayWidth,
      overlayHeight,
      window.CONFIG.YELLOW_FREEZE.OVERLAY_COLOR,
      window.CONFIG.YELLOW_FREEZE.OVERLAY_OPACITY
    ).setDepth(7);

    this.showYellowFreezeCard(meteor);
  }

  showYellowFreezeCard(meteor) {
    const card = document.getElementById('freeze-card');
    if (!card) return;

    const email = meteor.payload.primaryEmail;
    const canvasBounds = this.game.canvas.getBoundingClientRect();
    const screenX = canvasBounds.left + meteor.sprite.x;
    const screenY = canvasBounds.top + meteor.sprite.y;

    const cardX = (meteor.sprite.x > window.CONFIG.GAME_WIDTH / 2) ? (screenX - 280) : (screenX + 50);
    const cardY = Phaser.Math.Clamp(screenY - 60, canvasBounds.top + 20, canvasBounds.bottom - 220);

    card.style.left = `${cardX}px`;
    card.style.top = `${cardY}px`;
    card.classList.remove('hidden');

    card.innerHTML = `
      <div class="freeze-card-inner">
        <div class="freeze-timer-bar"><div id="freeze-timer-fill" style="width: 100%"></div></div>
        <div class="freeze-meta">
          <div class="freeze-cat">CATEGORY: ${meteor.payload.category}</div>
          <div class="freeze-sender">${email.senderName || email.sender}</div>
          <div class="freeze-subject">${email.subject}</div>
          <div class="freeze-date">${email.date}</div>
        </div>
        <div class="freeze-actions">
          <button id="freeze-trash-btn" class="freeze-btn trash">TRASH (Enter)</button>
          <button id="freeze-keep-btn" class="freeze-btn keep">KEEP (K)</button>
          <button id="freeze-letgo-btn" class="freeze-btn letgo">LET GO (Esc)</button>
        </div>
      </div>
    `;

    document.getElementById('freeze-trash-btn').onclick = () => this.trashFrozenYellow();
    document.getElementById('freeze-keep-btn').onclick = () => this.keepFrozenYellow();
    document.getElementById('freeze-letgo-btn').onclick = () => this.releaseFrozenYellow();
  }

  updateYellowFreeze(delta) {
    if (!this.frozenMeteor) return;

    this.freezeTimer -= delta;
    const fill = document.getElementById('freeze-timer-fill');
    if (fill) {
      const pct = (this.freezeTimer / window.CONFIG.YELLOW_FREEZE.TIMER_DURATION_MS) * 100;
      fill.style.width = `${pct}%`;
    }

    if (this.freezeTimer <= 0) {
      this.releaseFrozenYellow();
    }
  }

  trashFrozenYellow() {
    if (!this.frozenMeteor) return;

    const meteor = this.frozenMeteor;
    window.soundSystem.playShatter(false);

    const points = window.CONFIG.SCORE.YELLOW_TRASHED;
    this.score += points * this.combo;
    this.trashQueue.enqueue(meteor.payload.emails, points);
    this.emailsTrashedTotal += meteor.payload.count;

    this.cleanupFrozenCard();

    const idx = this.activeMeteors.indexOf(meteor);
    if (idx !== -1) {
      if (meteor.frozenOverlay) meteor.frozenOverlay.destroy();
      meteor.sprite.destroy();
      meteor.label.destroy();
      this.activeMeteors.splice(idx, 1);
    }

    this.frozenMeteor = null;
    this.updateHUDDisplay();
  }

  keepFrozenYellow() {
    if (!this.frozenMeteor) return;

    window.soundSystem.playKeep();
    const sender = this.frozenMeteor.payload.senderEmail || this.frozenMeteor.payload.senderName;
    this.classifier.addToKeepList(sender);

    this.frozenMeteor.payload.color = 'green';
    this.frozenMeteor.sprite.setTexture('meteor-green');
    this.frozenMeteor.label.setColor('#86efac');

    this.releaseFrozenYellow();
  }

  releaseFrozenYellow() {
    if (!this.frozenMeteor) return;

    if (this.frozenMeteor.frozenOverlay) {
      this.frozenMeteor.frozenOverlay.destroy();
    }
    this.frozenMeteor.isFrozen = false;
    this.frozenMeteor.freezeHoldTime = 0;
    this.frozenMeteor = null;
    this.cleanupFrozenCard();
  }

  cleanupFrozenCard() {
    const card = document.getElementById('freeze-card');
    if (card) {
      card.classList.add('hidden');
      card.innerHTML = '';
    }
  }

  handleGreenHit() {
    if (this.activePowerup === 'shield') {
      window.soundSystem.playHit();
      return;
    }

    window.soundSystem.playDamage();
    this.lives--;
    this.combo = 1;
    this.correctKillsInRow = 0;
    this.score = Math.max(0, this.score + window.CONFIG.SCORE.GREEN_HIT_PENALTY);
    this.updateHUDDisplay();

    this.cameras.main.flash(250, 239, 68, 68);

    if (this.lives <= 0) {
      this.handleGameOver();
    }
  }

  handleKeepSenderAt(x, y) {
    for (const m of this.activeMeteors) {
      const dist = Phaser.Math.Distance.Between(x, y, m.sprite.x, m.sprite.y);
      if (dist < 40) {
        window.soundSystem.playKeep();
        const s = m.payload.senderEmail || m.payload.senderName;
        this.classifier.addToKeepList(s);
        for (const other of this.activeMeteors) {
          if ((other.payload.senderEmail || other.payload.senderName) === s) {
            other.payload.color = 'green';
            other.sprite.setTexture('meteor-green');
            other.label.setColor('#86efac');
          }
        }
        break;
      }
    }
  }

  triggerChainBlast() {
    window.soundSystem.playShatter(true);
    let clearedCount = 0;

    for (let i = this.activeMeteors.length - 1; i >= 0; i--) {
      const m = this.activeMeteors[i];
      if (m.payload.color === 'red') {
        clearedCount += m.payload.count;
        this.trashQueue.enqueue(m.payload.emails, 10 * m.payload.count);
        this.emailsTrashedTotal += m.payload.count;
        m.sprite.destroy();
        m.label.destroy();
        this.activeMeteors.splice(i, 1);
      }
    }

    const blastPoints = window.CONFIG.SCORE.CHAIN_BLAST_BASE + (clearedCount * window.CONFIG.SCORE.CHAIN_BLAST_PER_METEOR);
    this.score += blastPoints * this.combo;

    const shockwave = this.add.circle(this.playerShip.x, this.playerShip.y, 10, 0x38bdf8, 0)
      .setStrokeStyle(4, 0x38bdf8);

    this.tweens.add({
      targets: shockwave,
      radius: 600,
      alpha: 0,
      duration: 500,
      onComplete: () => shockwave.destroy(),
    });

    this.showToast(`CHAIN BLAST! Cleared ${clearedCount} red emails! +${blastPoints} pts`);
    this.updateHUDDisplay();
  }

  triggerCheckpoint() {
    window.soundSystem.playUpgrade();
    this.scene.pause();
    this.trashQueue.flush();

    const modal = document.getElementById('checkpoint-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="checkpoint-box">
        <div class="checkpoint-title">CHECKPOINT REACHED!</div>
        <div class="checkpoint-sub">Wave ${this.waveNumber} Complete | ${this.emailsTrashedTotal} Emails Trashed</div>
        <div class="upgrade-choices">
          <button class="upgrade-btn" id="upgrade-gun">
            <div class="up-title">LASER UPGRADE</div>
            <div class="up-desc">Upgrade Gun to Level ${Math.min(8, this.gunLevel + 1)} (+0.35 DPS)</div>
          </button>
          <button class="upgrade-btn" id="upgrade-life">
            <div class="up-title">+1 EXTRA LIFE</div>
            <div class="up-desc">Restore or gain 1 Heart (Max ${window.CONFIG.CHECKPOINTS.MAX_LIVES})</div>
          </button>
          <button class="upgrade-btn" id="upgrade-powerup">
            <div class="up-title">CAPSULE BOOSTER</div>
            <div class="up-desc">Increase power-up capsule drop frequency by 40%</div>
          </button>
        </div>
      </div>
    `;

    document.getElementById('upgrade-gun').onclick = () => {
      this.gunLevel = Math.min(window.CONFIG.WEAPON.MAX_LEVEL, this.gunLevel + 1);
      this.resumeFromCheckpoint();
    };
    document.getElementById('upgrade-life').onclick = () => {
      this.lives = Math.min(window.CONFIG.CHECKPOINTS.MAX_LIVES, this.lives + 1);
      this.resumeFromCheckpoint();
    };
    document.getElementById('upgrade-powerup').onclick = () => {
      this.powerupCooldownReduction *= 0.6;
      this.resumeFromCheckpoint();
    };
  }

  resumeFromCheckpoint() {
    const modal = document.getElementById('checkpoint-modal');
    if (modal) modal.classList.add('hidden');

    this.waveNumber++;
    this.score += window.CONFIG.SCORE.CHECKPOINT_BASE * this.waveNumber;
    this.updateHUDDisplay();
    this.scene.resume();
  }

  spawnPowerupCapsule() {
    const types = Object.keys(window.CONFIG.POWERUPS.TYPES);
    const chosenType = types[Phaser.Math.Between(0, types.length - 1)];
    const powerupDef = window.CONFIG.POWERUPS.TYPES[chosenType.toUpperCase()];

    const x = Phaser.Math.Between(100, window.CONFIG.GAME_WIDTH - 100);
    const sprite = this.add.sprite(x, -20, 'powerup-capsule')
      .setScale(2)
      .setTint(powerupDef.color)
      .setDepth(6);

    this.activePowerupCapsules.push({
      type: powerupDef.id,
      def: powerupDef,
      sprite,
    });
  }

  updatePowerupCapsules(delta, speedFactor) {
    const dt = delta / 1000;
    for (let i = this.activePowerupCapsules.length - 1; i >= 0; i--) {
      const cap = this.activePowerupCapsules[i];
      cap.sprite.y += window.CONFIG.POWERUPS.DROP_SPEED * dt * speedFactor;
      if (cap.sprite.y > this.scale.height + 20) {
        cap.sprite.destroy();
        this.activePowerupCapsules.splice(i, 1);
      }
    }
  }

  collectPowerup(typeId) {
    window.soundSystem.playPowerup();
    const def = Object.values(window.CONFIG.POWERUPS.TYPES).find(t => t.id === typeId);
    this.activePowerup = typeId;
    this.powerupTimer = window.CONFIG.POWERUPS.DURATION_MS;

    this.shipBubble.setFillStyle(def.color, 0.35);
    this.showToast(`POWER-UP: ${def.name.toUpperCase()} (15s)`);
  }

  updatePowerupHUD() {
    const hudBar = document.getElementById('hud-powerup-bar');
    if (hudBar) {
      hudBar.classList.remove('hidden');
      const pct = (this.powerupTimer / window.CONFIG.POWERUPS.DURATION_MS) * 100;
      hudBar.style.width = `${pct}%`;
    }
  }

  deactivatePowerup() {
    this.activePowerup = null;
    this.shipBubble.setFillStyle(0x38bdf8, 0);
    const hudBar = document.getElementById('hud-powerup-bar');
    if (hudBar) hudBar.classList.add('hidden');
  }

  promptUnsubscribeMissile(bossPayload) {
    if (!bossPayload.unsubscribeUrl) return;

    const modal = document.getElementById('missile-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="missile-box">
        <div class="missile-title">🚀 UNSUBSCRIBE MISSILE ARMED!</div>
        <div class="missile-desc">You defeated boss sender <strong>${bossPayload.senderName}</strong> (${bossPayload.count} emails)!</div>
        <p class="missile-warning">Would you like to open the sender's official unsubscribe page in a new secure tab?</p>
        <div class="missile-actions">
          <a href="${bossPayload.unsubscribeUrl}" target="_blank" rel="noopener noreferrer" class="retro-btn primary" id="missile-open-link">OPEN UNSUBSCRIBE PAGE</a>
          <button class="retro-btn secondary" id="missile-dismiss">DISMISS</button>
        </div>
      </div>
    `;

    document.getElementById('missile-dismiss').onclick = () => modal.classList.add('hidden');
    document.getElementById('missile-open-link').onclick = () => modal.classList.add('hidden');
  }

  updateInspectorAt(x, y) {
    let hoveredMeteor = null;
    for (const m of this.activeMeteors) {
      const dist = Phaser.Math.Distance.Between(x, y, m.sprite.x, m.sprite.y);
      if (dist < (m.scale * 16) + 12) {
        hoveredMeteor = m;
        break;
      }
    }

    const panel = document.getElementById('inspector-panel');
    if (!panel) return;

    if (hoveredMeteor) {
      if (this.inspectorFadeTimer) {
        clearTimeout(this.inspectorFadeTimer);
        this.inspectorFadeTimer = null;
      }
      panel.style.opacity = '1.0';

      const email = hoveredMeteor.payload.primaryEmail;
      panel.innerHTML = `
        <div class="insp-col">
          <span class="insp-tag ${hoveredMeteor.payload.color}">[${hoveredMeteor.payload.category}]</span>
          <strong>${email.senderName || email.sender}</strong> &lt;${email.sender}&gt;
        </div>
        <div class="insp-subject">${email.subject}</div>
        <div class="insp-meta">Date: ${email.date} | Batch: ${hoveredMeteor.payload.count} emails | Est. Size: ${Math.round(email.sizeEstimate / 1024)} KB</div>
      `;
    } else {
      if (!this.inspectorFadeTimer) {
        this.inspectorFadeTimer = setTimeout(() => {
          panel.style.opacity = '0.3';
          this.inspectorFadeTimer = null;
        }, window.CONFIG.METEORS.INSPECTOR_FADE_DELAY_MS);
      }
    }
  }

  async triggerUndo() {
    const res = await this.trashQueue.undoLatest();
    if (res && res.restoredCount > 0) {
      this.score = Math.max(0, this.score - res.pointsReversed);
      this.emailsTrashedTotal = Math.max(0, this.emailsTrashedTotal - res.restoredCount);
      window.soundSystem.playUpgrade();
      this.showToast(`UNDO: Restored ${res.restoredCount} emails! Points adjusted.`);
      this.updateHUDDisplay();
    }
  }

  showToast(msg) {
    const toast = document.getElementById('game-toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);
  }

  handleGameOver() {
    this.cleanupAndExit('game_over');
  }

  triggerVictoryRound2() {
    this.cleanupAndExit('round2');
  }

  cleanupAndExit(nextState) {
    window.soundSystem.stopLaser();
    this.trashQueue.stop();
    this.cleanupFrozenCard();

    const hud = document.getElementById('game-hud');
    if (hud) hud.classList.add('hidden');

    if (nextState === 'round2') {
      this.scene.start('RescueScene', {
        mode: this.mode,
        classifier: this.classifier,
        allEmails: this.allEmails,
        trashedCount: this.emailsTrashedTotal,
        score: this.score,
        comboRecord: this.combo,
        startTime: this.startTime,
        trashQueue: this.trashQueue,
      });
    } else {
      this.scene.start('StatsScene', {
        mode: this.mode,
        allEmails: this.allEmails,
        trashedCount: this.emailsTrashedTotal,
        starredCount: 0,
        score: this.score,
        comboRecord: this.combo,
        startTime: this.startTime,
        trashQueue: this.trashQueue,
      });
    }
  }
}

window.GameScene = GameScene;
