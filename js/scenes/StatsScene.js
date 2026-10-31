// StatsScene: Mission Debriefing & Final Stats (PRD Sections 6, 8, 11 & 14)

class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatsScene' });
  }

  init(data) {
    this.mode = data.mode || 'demo';
    this.allEmails = data.allEmails || [];
    this.trashedCount = data.trashedCount || 0;
    this.starredCount = data.starredCount || 0;
    this.score = data.score || 0;
    this.comboRecord = data.comboRecord || 1;
    this.startTime = data.startTime || Date.now();
    this.trashQueue = data.trashQueue;
  }

  create() {
    const { width, height } = this.scale;

    for (let i = 0; i < 70; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        1, 1, 0xffffff, 0.4
      );
    }

    this.renderStatsOverlay();
  }

  renderStatsOverlay() {
    const overlay = document.getElementById('stats-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');

    const totalSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeFormatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

    const storageBytesFreed = this.trashedCount * 46000;
    const storageMbFreed = (storageBytesFreed / (1024 * 1024)).toFixed(1);

    const senderMap = new Map();
    for (const email of this.allEmails) {
      const name = email.senderName || email.sender || 'Unknown';
      senderMap.set(name, (senderMap.get(name) || 0) + 1);
    }
    const top10Senders = Array.from(senderMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    overlay.innerHTML = `
      <div class="stats-modal-box">
        <div class="stats-header">
          <div class="stats-title">MISSION COMPLETE: INBOX DEFENDED</div>
          <div class="stats-subtitle">Triage Session Summary &amp; Mailbox Statistics</div>
        </div>

        <div class="stats-summary-grid">
          <div class="metric-card">
            <div class="metric-val text-red">${this.trashedCount.toLocaleString()}</div>
            <div class="metric-label">EMAILS TRASHED</div>
          </div>
          <div class="metric-card">
            <div class="metric-val text-yellow">${this.starredCount.toLocaleString()}</div>
            <div class="metric-label">EMAILS RESCUED (STARRED)</div>
          </div>
          <div class="metric-card">
            <div class="metric-val text-green">${storageMbFreed} MB</div>
            <div class="metric-label">EST. STORAGE FREED</div>
          </div>
          <div class="metric-card">
            <div class="metric-val text-cyan">${this.score.toLocaleString()}</div>
            <div class="metric-label">FINAL SCORE (MAX COMBO x${this.comboRecord})</div>
          </div>
        </div>

        <div class="stats-time-row">
          <span>Session Duration: <strong>${timeFormatted}</strong></span>
          <span>Clean Speed: <strong>${(this.trashedCount / Math.max(1, totalSeconds)).toFixed(1)} emails/sec</strong></span>
        </div>

        <div class="stats-top-senders">
          <div class="table-title">TOP 10 CLUTTER CONTRIBUTORS DEALT WITH</div>
          <div class="top-senders-list">
            ${top10Senders.map(([sender, count], index) => `
              <div class="top-sender-row">
                <span class="rank">#${index + 1}</span>
                <span class="s-name">${sender}</span>
                <span class="s-count">${count} emails</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="safety-note">
          <p><strong>Safety Guarantee:</strong> Trashed emails are safely placed in your Gmail Trash and kept by Google for 30 days before permanent deletion.</p>
        </div>

        <div class="stats-buttons">
          <button id="stats-undo-all-btn" class="retro-btn danger">UNDO ALL THIS SESSION</button>
          <a href="https://mail.google.com/mail/u/0/#trash" target="_blank" rel="noopener noreferrer" class="retro-btn secondary">OPEN TRASH IN GMAIL ↗</a>
          <button id="stats-play-again-btn" class="retro-btn primary">RETURN TO MENU</button>
        </div>
      </div>
    `;

    document.getElementById('stats-undo-all-btn').addEventListener('click', async () => {
      if (confirm('Are you sure you want to restore all emails trashed during this session back to your inbox?')) {
        let count = 0;
        if (this.trashQueue) {
          count = await this.trashQueue.undoAllSession();
        }
        window.soundSystem.playUpgrade();
        alert(`Session Undo Complete: Restored ${count || this.trashedCount} emails!`);
        document.querySelector('.metric-card .text-red').textContent = '0 (RESTORED)';
      }
    });

    document.getElementById('stats-play-again-btn').addEventListener('click', () => {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      this.scene.start('MenuScene');
    });
  }
}

window.StatsScene = StatsScene;
