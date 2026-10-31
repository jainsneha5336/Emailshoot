// Email Classifier (Gmail Labels Lookup - PRD Section 8)
// Zero AI, zero custom scoring - pure Gmail labelId lookup

class EmailClassifier {
  constructor(keepList = new Set(), skippedCategories = new Set()) {
    this.keepList = keepList;
    this.skippedCategories = skippedCategories;
  }

  addToKeepList(sender) {
    if (sender) {
      this.keepList.add(sender.toLowerCase().trim());
    }
  }

  isKept(sender) {
    if (!sender) return false;
    return this.keepList.has(sender.toLowerCase().trim());
  }

  toggleSkipCategory(category) {
    if (this.skippedCategories.has(category)) {
      this.skippedCategories.delete(category);
    } else {
      this.skippedCategories.add(category);
    }
  }

  classify(email) {
    if (!email || !Array.isArray(email.labelIds)) {
      return null;
    }

    const labels = new Set(email.labelIds);
    const sender = (email.sender || '').toLowerCase().trim();

    // 1. Session Keep list check -> always Green
    if (this.isKept(sender)) {
      return {
        color: 'green',
        category: 'KEEP_LIST',
        reason: 'Protected by Session Keep List',
      };
    }

    // 2. IMPORTANT or STARRED always wins over any other label (PRD Section 8)
    if (labels.has('IMPORTANT') || labels.has('STARRED')) {
      return {
        color: 'green',
        category: labels.has('STARRED') ? 'STARRED' : 'IMPORTANT',
        reason: labels.has('STARRED') ? 'Starred in Gmail' : 'Marked Important by Gmail',
      };
    }

    // 3. Check for Junk (Red labels)
    if (labels.has('SPAM')) {
      if (this.skippedCategories.has('SPAM')) return null;
      return {
        color: 'red',
        category: 'SPAM',
        reason: 'Spam',
      };
    }

    if (labels.has('CATEGORY_PROMOTIONS')) {
      if (this.skippedCategories.has('CATEGORY_PROMOTIONS')) return null;
      return {
        color: 'red',
        category: 'CATEGORY_PROMOTIONS',
        reason: 'Promotions',
      };
    }

    if (labels.has('CATEGORY_SOCIAL')) {
      if (this.skippedCategories.has('CATEGORY_SOCIAL')) return null;
      return {
        color: 'red',
        category: 'CATEGORY_SOCIAL',
        reason: 'Social',
      };
    }

    // 4. Check for Unsure (Yellow labels)
    if (labels.has('CATEGORY_UPDATES')) {
      if (this.skippedCategories.has('CATEGORY_UPDATES')) return null;
      return {
        color: 'yellow',
        category: 'CATEGORY_UPDATES',
        reason: 'Updates',
      };
    }

    if (labels.has('CATEGORY_FORUMS')) {
      if (this.skippedCategories.has('CATEGORY_FORUMS')) return null;
      return {
        color: 'yellow',
        category: 'CATEGORY_FORUMS',
        reason: 'Forums',
      };
    }

    // 5. Unlabeled / Primary mail -> excluded from game
    return null;
  }
}

window.EmailClassifier = EmailClassifier;
