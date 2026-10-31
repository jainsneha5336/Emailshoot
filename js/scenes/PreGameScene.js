// PreGameScene: Inbox Classification Summary & Keep Review (PRD Section 6, 8 & 11)

class PreGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreGameScene' });
  }

  init(data) {
    this.mode = data.mode || 'demo';
    this.rawEmails = data.rawEmails || [];
    this.classifier = new window.EmailClassifier();
    this.processedData = null;
  }

  create() {
    const { width, height } = this.scale;

    // Starfield
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        1, 1, 0xffffff, 0.5
      );
      this.stars.push(star);
    }

    // Title
    this.add.text(width / 2, 40, 'PRE-FLIGHT INBOX TRIAGE SCAN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#38bdf8',
    }).setOrigin(0.5);

    // Run classification
    this.reclassify();

    // Render HTML overlay
    this.renderHtmlOverlay();
  }

  reclassify() {
    const classified = [];
    for (const email of this.rawEmails) {
      const res = this.classifier.classify(email);
      if (res) {
        classified.push({ email, classification: res });
      }
    }

    this.processedData = window.EmailClusterer.cluster(classified);
    return this.processedData;
  }

  renderHtmlOverlay() {
    const overlay = document.getElementById('pregame-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');

    const stats = this.processedData.stats;
    const estMinutes = Math.max(10, Math.round(stats.totalRedEmails / 180));

    const senderCounts = new Map();
    for (const email of this.rawEmails) {
      const cls = this.classifier.classify(email);
      if (cls && cls.color === 'red') {
        const sName = email.senderName || email.sender;
        senderCounts.set(sName, (senderCounts.get(sName) || 0) + 1);
      }
    }

    const sortedSenders = Array.from(senderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    overlay.innerHTML = `
      <div class="pregame-container">
        <div class="scan-stats-grid">
          <div class="stat-card stat-red">
            <div class="stat-val">${stats.totalRedEmails.toLocaleString()}</div>
            <div class="stat-label">RED (JUNK)</div>
            <div class="stat-sub">Promotions, Social, Spam</div>
          </div>
          <div class="stat-card stat-yellow">
            <div class="stat-val">${stats.totalYellowEmails.toLocaleString()}</div>
            <div class="stat-label">YELLOW (UNSURE)</div>
            <div class="stat-sub">Updates, Forums (Freeze Confirm)</div>
          </div>
          <div class="stat-card stat-green">
            <div class="stat-val">${stats.totalGreenEmails.toLocaleString()}</div>
            <div class="stat-label">GREEN (PROTECTED)</div>
            <div class="stat-sub">Important, Starred, Kept</div>
          </div>
        </div>

        <div class="info-banner">
          <span>Est. Playtime: <strong>~${estMinutes} minutes</strong></span>
          <span>Target Trash: <strong>${stats.totalRedEmails.toLocaleString()} emails</strong></span>
          <span>Meteors to Spawn: <strong>${stats.totalMeteors.toLocaleString()}</strong></span>
        </div>

        <div class="pregame-columns">
          <div class="col-panel">
            <div class="panel-header">CATEGORY SWITCHES (SKIP FROM GAME)</div>
            <div class="category-toggles">
              <label class="toggle-item">
                <input type="checkbox" id="cat-promotions" checked>
                <span>Promotions (Red)</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" id="cat-social" checked>
                <span>Social (Red)</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" id="cat-spam" checked>
                <span>Spam (Red)</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" id="cat-updates" checked>
                <span>Updates (Yellow Freeze)</span>
              </label>
              <label class="toggle-item">
                <input type="checkbox" id="cat-forums" checked>
                <span>Forums (Yellow Freeze)</span>
              </label>
            </div>
          </div>

          <div class="col-panel">
            <div class="panel-header">TOP CLUTTER SENDERS (SESSION KEEP REVIEW)</div>
            <div class="senders-table-wrap">
              <table class="senders-table">
                <thead>
                  <tr>
                    <th>Sender</th>
                    <th>Count</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedSenders.map(([sender, count]) => `
                    <tr>
                      <td class="sender-cell">${sender}</td>
                      <td><span class="count-pill">${count}</span></td>
                      <td>
                        <button class="keep-toggle-btn ${this.classifier.isKept(sender) ? 'active' : ''}" data-sender="${sender}">
                          ${this.classifier.isKept(sender) ? 'PROTECTED' : 'KEEP'}
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="pregame-actions">
          <button id="pregame-back-btn" class="retro-btn secondary">BACK TO MENU</button>
          <button id="pregame-start-btn" class="retro-btn primary">ENTER ORBIT (LAUNCH ROUND 1)</button>
        </div>
      </div>
    `;

    const catMap = {
      'cat-promotions': 'CATEGORY_PROMOTIONS',
      'cat-social': 'CATEGORY_SOCIAL',
      'cat-spam': 'SPAM',
      'cat-updates': 'CATEGORY_UPDATES',
      'cat-forums': 'CATEGORY_FORUMS',
    };

    Object.entries(catMap).forEach(([elemId, catKey]) => {
      const el = document.getElementById(elemId);
      if (el) {
        el.addEventListener('change', () => {
          this.classifier.toggleSkipCategory(catKey);
          this.reclassify();
          this.updateStatNumbers();
        });
      }
    });

    overlay.querySelectorAll('.keep-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sender = e.target.getAttribute('data-sender');
        if (this.classifier.isKept(sender)) {
          this.classifier.keepList.delete(sender.toLowerCase().trim());
          e.target.classList.remove('active');
          e.target.textContent = 'KEEP';
        } else {
          this.classifier.addToKeepList(sender);
          e.target.classList.add('active');
          e.target.textContent = 'PROTECTED';
          window.soundSystem.playKeep();
        }
        this.reclassify();
        this.updateStatNumbers();
      });
    });

    document.getElementById('pregame-back-btn').addEventListener('click', () => {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      this.scene.start('MenuScene');
    });

    document.getElementById('pregame-start-btn').addEventListener('click', () => {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      window.soundSystem.playUpgrade();
      this.scene.start('GameScene', {
        mode: this.mode,
        classifier: this.classifier,
        meteorsPayload: this.processedData.meteors,
        bossSenders: this.processedData.bossSenders,
        allEmails: this.rawEmails,
      });
    });
  }

  updateStatNumbers() {
    const stats = this.processedData.stats;
    const redVal = document.querySelector('.stat-red .stat-val');
    const yellowVal = document.querySelector('.stat-yellow .stat-val');
    const greenVal = document.querySelector('.stat-green .stat-val');
    if (redVal) redVal.textContent = stats.totalRedEmails.toLocaleString();
    if (yellowVal) yellowVal.textContent = stats.totalYellowEmails.toLocaleString();
    if (greenVal) greenVal.textContent = stats.totalGreenEmails.toLocaleString();
  }

  update() {
    for (const star of this.stars) {
      star.y += 0.2;
      if (star.y > this.scale.height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, this.scale.width);
      }
    }
  }
}

window.PreGameScene = PreGameScene;
