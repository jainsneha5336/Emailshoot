// Trash Queue & Undo Engine (PRD Section 8, 11 & 12)

class TrashQueue {
  constructor(options = {}) {
    this.onFlush = options.onFlush || (async () => {});
    this.onUndo = options.onUndo || (async () => {});
    this.onQueueUpdate = options.onQueueUpdate || (() => {});

    this.pendingQueue = [];
    this.undoStack = [];
    this.sessionTrashed = [];

    this.timer = null;
    this.totalTrashedCount = 0;
    this.actionCounter = 0;

    this.startAutoFlush();
  }

  startAutoFlush() {
    if (this.timer) clearInterval(this.timer);
    const flushMs = window.CONFIG?.TRASH_QUEUE?.FLUSH_INTERVAL_MS ?? 10000;
    this.timer = setInterval(() => {
      if (this.pendingQueue.length > 0) {
        this.flush();
      }
    }, flushMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  enqueue(emails, pointsEarned = 0) {
    if (!emails || emails.length === 0) return null;
    this.actionCounter++;
    const actionId = `action_${this.actionCounter}_${Date.now()}`;

    const items = emails.map(email => ({
      id: email.id,
      email: email,
      points: pointsEarned / emails.length,
      timestamp: Date.now(),
      actionId,
    }));

    this.pendingQueue.push(...items);

    this.pushUndoAction({
      actionId,
      items,
      points: pointsEarned,
      flushed: false,
    });

    this.notifyUpdate();

    const batchSize = window.CONFIG?.TRASH_QUEUE?.BATCH_SIZE ?? 1000;
    if (this.pendingQueue.length >= batchSize) {
      this.flush();
    }

    return actionId;
  }

  pushUndoAction(action) {
    this.undoStack.push(action);
    const maxUndo = window.CONFIG?.TRASH_QUEUE?.UNDO_STACK_MAX ?? 20;
    if (this.undoStack.length > maxUndo) {
      this.undoStack.shift();
    }
  }

  async flush() {
    if (this.pendingQueue.length === 0) return;

    const batchSize = window.CONFIG?.TRASH_QUEUE?.BATCH_SIZE ?? 1000;
    const batchToFlush = this.pendingQueue.splice(0, batchSize);
    const actionIdsInBatch = new Set(batchToFlush.map(i => i.actionId));

    for (const action of this.undoStack) {
      if (actionIdsInBatch.has(action.actionId)) {
        action.flushed = true;
      }
    }

    try {
      const emailIds = batchToFlush.map(i => i.id);
      await this.onFlush(emailIds, batchToFlush);

      this.totalTrashedCount += batchToFlush.length;
      this.sessionTrashed.push(...batchToFlush);
    } catch (err) {
      console.error('Failed to flush trash batch, returning items to queue:', err);
      this.pendingQueue.unshift(...batchToFlush);
    }

    this.notifyUpdate();
  }

  async undoLatest() {
    if (this.undoStack.length === 0) return null;

    const action = this.undoStack.pop();
    const actionId = action.actionId;
    let restoredCount = 0;

    if (!action.flushed) {
      const initialLength = this.pendingQueue.length;
      this.pendingQueue = this.pendingQueue.filter(item => item.actionId !== actionId);
      restoredCount = initialLength - this.pendingQueue.length;
    } else {
      const emailIds = action.items.map(i => i.id);
      await this.onUndo(emailIds, action.items);
      restoredCount = action.items.length;
      this.totalTrashedCount = Math.max(0, this.totalTrashedCount - restoredCount);

      const restoredIdSet = new Set(emailIds);
      this.sessionTrashed = this.sessionTrashed.filter(item => !restoredIdSet.has(item.id));
    }

    this.notifyUpdate();
    return {
      restoredCount,
      pointsReversed: action.points,
      actionId,
    };
  }

  async undoAllSession() {
    this.pendingQueue = [];

    if (this.sessionTrashed.length > 0) {
      const emailIds = this.sessionTrashed.map(i => i.id);
      await this.onUndo(emailIds, this.sessionTrashed);
      const count = this.sessionTrashed.length;
      this.sessionTrashed = [];
      this.undoStack = [];
      this.totalTrashedCount = 0;
      this.notifyUpdate();
      return count;
    }

    this.undoStack = [];
    this.notifyUpdate();
    return 0;
  }

  getCounts() {
    return {
      trashed: this.totalTrashedCount,
      queued: this.pendingQueue.length,
      undoAvailable: this.undoStack.length > 0,
    };
  }

  notifyUpdate() {
    this.onQueueUpdate(this.getCounts());
  }
}

window.TrashQueue = TrashQueue;
