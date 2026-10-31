// Central configuration for Gmail Meteor Cleaner (PRD Section 14 & 19)
// Attached to window.MeteorConfig for universal compatibility (file:// and http://)

window.CONFIG = {
  // Gameplay Dimensions & Display
  GAME_WIDTH: 960,
  GAME_HEIGHT: 720,
  FPS: 60,

  // Mode defaults
  DRY_RUN_DEFAULT: true, // Logs trash calls instead of sending during development
  DEMO_INBOX_SIZE: 5000,
  TARGET_TRASH_GOAL: 5000,
  PROGRESSIVE_START_COUNT: 500,

  // Gmail Label Mappings (PRD Section 8)
  LABEL_MAPPING: {
    IMPORTANT: 'green',
    STARRED: 'green',
    SPAM: 'red',
    CATEGORY_PROMOTIONS: 'red',
    CATEGORY_SOCIAL: 'red',
    CATEGORY_UPDATES: 'yellow',
    CATEGORY_FORUMS: 'yellow',
  },

  // Meteor Properties & Scaling (PRD Section 7)
  METEORS: {
    MAX_ON_SCREEN: 8,
    BASE_HP: 1.1, // Reduced from 2.5 for faster, crisper meteor destruction
    HP_GROWTH_PER_WAVE: 0.04, // +4% per wave (reduced from 6%)
    FALL_SPEED_MIN: 40,
    FALL_SPEED_MAX: 75,
    DECOY_GREEN_CAP: 0.10, // Max 10% of spawns are green decoys
    GREEN_HIT_THRESHOLD_MS: 400, // Must hold on green for >0.4s to take damage
    DAMAGE_FADE_DELAY_MS: 2000, // Damage stays longer before fading (2s)
    SPRITE_SCALES: {
      SINGLE: 2.0,
      CLUSTER: 3.0,
      BOSS: 6.0,
    },
    LABEL_TAG: {
      MAX_NAME_LENGTH: 12,
      FONT_SIZE: '10px',
      OFFSET_Y: 28,
    },
    INSPECTOR_FADE_DELAY_MS: 1500,
  },

  // Clustering (PRD Section 7 & 11)
  CLUSTERING: {
    MAX_CLUSTER_SIZE: 6,
    BOSS_THRESHOLD: 200, // Sender with >= 200 red emails spawns Boss
    BOSS_HP_MULTIPLIER: 4.5, // Reduced from 8.0 so Bosses don't feel spongy
    CLUSTER_HP_EXTRA_PER_EMAIL: 0.06, // +6% HP per extra email (reduced from 10%)
  },

  // Yellow Meteor Freeze (PRD Section 7)
  YELLOW_FREEZE: {
    HOLD_TO_FREEZE_MS: 1000, // 1s hold to freeze
    TIMER_DURATION_MS: 6000, // 6s countdown timer
    CONFIRM_HOLD_MS: 600, // 0.6s hold to confirm trash while frozen
    OVERLAY_OPACITY: 0.40,
    OVERLAY_COLOR: 0x38bdf8, // Sky-blue
  },

  // Weapon & Gun Upgrades (PRD Section 10)
  WEAPON: {
    BASE_DPS: 1.25, // Increased from 1.0 for punchy, fast destruction
    DPS_PER_LEVEL: 0.40, // +0.40 DPS per gun upgrade level
    MAX_LEVEL: 8,
    BEAM_COLOR: 0xff1744, // Glowing electric red laser aura
    BEAM_CORE_COLOR: 0xff5252, // Bright vivid laser red core (changed from white)
    OVERCHARGE_COLOR: 0xff0033, // Red overcharge laser
    GOLD_BEAM_COLOR: 0xfacc15, // Round 2 Gold laser
    BEAM_WIDTH: 3,
  },

  // Checkpoints & Waves (PRD Section 10)
  CHECKPOINTS: {
    EMAILS_PER_CHECKPOINT: 500, // Checkpoint every 500 trashed
    MAX_LIVES: 5,
    INITIAL_LIVES: 3,
  },

  // Chain Streak & Chain Blast (PRD Section 7)
  CHAIN: {
    STREAK_REQUIREMENT: 6, // 6 red meteors in a row triggers Chain Blast
  },

  // Power-Ups (PRD Section 10)
  POWERUPS: {
    DURATION_MS: 15000, // 15 seconds
    COOLDOWN_MIN_S: 30,
    COOLDOWN_MAX_S: 75,
    DROP_SPEED: 60,
    TYPES: {
      SHIELD: { id: 'shield', name: 'Shield', color: 0x3b82f6, hex: '#3b82f6', desc: 'Blocks life penalty on green meteors' },
      OVERCHARGE: { id: 'overcharge', name: 'Overcharge', color: 0xef4444, hex: '#ef4444', desc: 'Doubles beam damage' },
      SLOWMO: { id: 'slowmo', name: 'Slow-Mo', color: 0x10b981, hex: '#10b981', desc: 'Meteors fall at half speed' },
      MULTIBEAM: { id: 'multibeam', name: 'Multi-Beam', color: 0xffffff, hex: '#ffffff', desc: 'Triple laser beams' },
    },
  },

  // Scoring (PRD Section 10)
  SCORE: {
    RED_EMAIL_TRASHED: 10,
    CLUSTER_EXTRA_BONUS_PCT: 0.10,
    YELLOW_TRASHED: 25,
    BOSS_BASE: 500,
    BOSS_PER_EMAIL: 5,
    CHAIN_BLAST_BASE: 100,
    CHAIN_BLAST_PER_METEOR: 10,
    CHECKPOINT_BASE: 200,
    ROUND2_STARRED: 20,
    GREEN_HIT_PENALTY: -50,
    COMBO_STEP: 5,
    MAX_COMBO: 5,
  },

  // Trash Queue & Undo (PRD Section 8 & 11)
  TRASH_QUEUE: {
    BATCH_SIZE: 1000,
    FLUSH_INTERVAL_MS: 10000,
    UNDO_STACK_MAX: 20,
    UNDO_TOAST_DURATION_MS: 10000,
  },

  // Round 2 Star Rescue (PRD Section 9)
  ROUND2: {
    HOLD_TO_STAR_MS: 1000,
    METEOR_SPEED: 35,
  },

  // Audio settings
  AUDIO: {
    DEFAULT_VOLUME: 0.35,
    MUTED_DEFAULT: false,
  },
};
