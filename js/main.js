// Main Application Entrypoint & Phaser Initialization

window.addEventListener('DOMContentLoaded', () => {
  // Ensure the app is served over http/https (OAuth requires a proper origin)
  if (location.protocol !== 'http:' && location.protocol !== 'https:') {
    alert('⚠️ The game must be opened via a local web server (http://localhost:8000). OAuth will not work on file:// URLs. Please run start-server.bat and refresh the page.');
    // Disable the Gmail OAuth button to prevent the loop
    const oauthBtn = document.querySelector('.retro-button, .retro-btn, #oauth-save-btn');
    if (oauthBtn) {
      oauthBtn.disabled = true;
      oauthBtn.style.opacity = '0.5';
      oauthBtn.style.cursor = 'not-allowed';
    }
    // Optionally hide the OAuth modal trigger
    const connectBtn = document.querySelector('#oauth-save-btn');
    if (connectBtn) connectBtn.closest('.retro-button')?.setVisible?.(false);
    // Exit early – the rest of the init can stay but won't be usable without proper protocol
    return;
  }
  const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-game-container',
    width: window.CONFIG.GAME_WIDTH,
    height: window.CONFIG.GAME_HEIGHT,
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [
      window.MenuScene,
      window.PreGameScene,
      window.GameScene,
      window.RescueScene,
      window.StatsScene,
    ],
  };

  const game = new Phaser.Game(phaserConfig);
  window.__METEOR_GAME__ = game;

  // Initialize UI modals after the game is created
  setupGlobalModals(game);

});

function setupGlobalModals(game) {
  const oauthModal = document.getElementById('oauth-modal');
  const oauthSaveBtn = document.getElementById('oauth-save-btn');
  const oauthCancelBtn = document.getElementById('oauth-cancel-btn');
  const clientIdInput = document.getElementById('oauth-client-id');

  if (oauthSaveBtn) {
    oauthSaveBtn.addEventListener('click', () => {
      const clientId = clientIdInput.value.trim();
      if (!clientId) {
        alert('Please enter a valid Google OAuth Client ID.');
        return;
      }

      oauthModal.classList.add('hidden');

      const success = window.gmailClient.initAuth(
        clientId,
        async (userEmail) => {
          alert(`Connected successfully as: ${userEmail}\nScanning emails...`);
          try {
            const listRes = await window.gmailClient.listMessages(13);
            const messages = listRes.messages;
            const fullEmails = [];

            for (const msg of messages) {
              const meta = await window.gmailClient.getMessageMetadata(msg.id);
              if (meta) fullEmails.push(meta);
            }

            game.scene.stop('MenuScene');
            game.scene.start('PreGameScene', {
              mode: 'real',
              rawEmails: fullEmails,
            });
          } catch (e) {
            alert('Scan error: ' + e.message);
          }
        },
        (err) => {
          alert('OAuth error: ' + JSON.stringify(err));
        }
      );

      if (success) {
        window.gmailClient.requestToken();
      }
    });
  }

  if (oauthCancelBtn) {
    oauthCancelBtn.addEventListener('click', () => {
      oauthModal.classList.add('hidden');
    });
  }

  const safetyModal = document.getElementById('safety-modal');
  const safetyCloseBtn = document.getElementById('safety-close-btn');
  if (safetyCloseBtn && safetyModal) {
    safetyCloseBtn.addEventListener('click', () => {
      safetyModal.classList.add('hidden');
    });
  }
}
