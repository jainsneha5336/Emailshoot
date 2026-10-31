// Gmail API Client & Google Identity Services OAuth (PRD Section 12 & 13)

class GmailClient {
  constructor() {
    this.accessToken = null;
    this.userEmail = null;
    this.dryRun = window.CONFIG?.DRY_RUN_DEFAULT ?? true;
    this.tokenClient = null;
    this.originalLabelsCache = new Map();
  }

  setDryRun(enabled) {
    this.dryRun = !!enabled;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  initAuth(clientId, onTokenSuccess, onTokenError) {
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      console.warn('Google Identity Services SDK not loaded yet.');
      return false;
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/gmail.modify',
      prompt: '',
      callback: async (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          this.accessToken = tokenResponse.access_token;
          try {
            await this.fetchUserProfile();
            if (onTokenSuccess) onTokenSuccess(this.userEmail);
          } catch (err) {
            console.error('Failed to get user profile', err);
            if (onTokenSuccess) onTokenSuccess('Connected Account');
          }
        } else if (onTokenError) {
          onTokenError(tokenResponse);
        }
      },
    });

    return true;
  }

  requestToken() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      throw new Error('OAuth Token Client not initialized. Enter a Google Client ID in Settings.');
    }
  }

  signOut() {
    if (this.accessToken && window.google?.accounts?.oauth2?.revoke) {
      try {
        window.google.accounts.oauth2.revoke(this.accessToken, () => {});
      } catch (e) {}
    }
    this.accessToken = null;
    this.userEmail = null;
    this.originalLabelsCache.clear();
  }

  async fetchUserProfile() {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) throw new Error('Profile fetch failed');
    const data = await res.json();
    this.userEmail = data.emailAddress;
    return data;
  }

  async listMessages(maxResults = 5000, pageToken = null) {
    if (!this.accessToken) throw new Error('Not authenticated with Gmail');

    const query = '-in:trash (category:promotions OR category:social OR category:updates OR category:forums OR in:spam OR is:important OR is:starred)';
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.set('q', query);
    url.searchParams.set('includeSpamTrash', 'true');
    url.searchParams.set('maxResults', Math.min(500, maxResults).toString());
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gmail List API error: ${res.status} ${err.error?.message || ''}`);
    }

    const data = await res.json();
    return {
      messages: data.messages || [],
      nextPageToken: data.nextPageToken || null,
      resultSizeEstimate: data.resultSizeEstimate || 0,
    };
  }

  async getMessageMetadata(messageId, retries = 3) {
    if (!this.accessToken) throw new Error('Not authenticated');

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date&metadataHeaders=List-Unsubscribe`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });

        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          if (attempt === retries) throw new Error(`Rate limit exceeded (${res.status})`);
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500 + Math.random() * 200));
          continue;
        }

        if (!res.ok) {
          throw new Error(`Metadata error ${res.status}`);
        }

        const data = await res.json();
        const headers = data.payload?.headers || [];
        const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
        const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
        const unsubHeader = headers.find(h => h.name.toLowerCase() === 'list-unsubscribe')?.value || null;

        const senderMatch = fromHeader.match(/^(.*?)\s*<(.+?)>$/);
        const senderName = senderMatch ? senderMatch[1].replace(/["']/g, '').trim() : fromHeader;
        const senderEmail = senderMatch ? senderMatch[2].trim() : fromHeader;

        this.originalLabelsCache.set(messageId, [...(data.labelIds || [])]);

        return {
          id: data.id,
          threadId: data.threadId,
          sender: senderEmail,
          senderName: senderName || senderEmail,
          senderClean: senderName || senderEmail,
          subject: subjectHeader,
          date: dateHeader ? new Date(dateHeader).toLocaleDateString() : 'Recent',
          timestamp: dateHeader ? new Date(dateHeader).getTime() : Date.now(),
          sizeEstimate: data.sizeEstimate || 25000,
          labelIds: data.labelIds || [],
          unsubscribeUrl: unsubHeader,
        };
      } catch (e) {
        if (attempt === retries) throw e;
        await new Promise(r => setTimeout(r, 600));
      }
    }
  }

  async batchTrash(messageIds) {
    if (!messageIds || messageIds.length === 0) return;

    if (this.dryRun) {
      console.log(`[DRY_RUN] batchTrash invoked for ${messageIds.length} emails:`, messageIds.slice(0, 5), '...');
      return { success: true, count: messageIds.length, dryRun: true };
    }

    if (!this.accessToken) throw new Error('Not authenticated');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: messageIds,
        addLabelIds: ['TRASH'],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gmail batchTrash failed: ${res.status} ${err.error?.message || ''}`);
    }

    return { success: true, count: messageIds.length, dryRun: false };
  }

  async batchRestoreFromTrash(messageIds) {
    if (!messageIds || messageIds.length === 0) return;

    if (this.dryRun) {
      console.log(`[DRY_RUN] batchRestoreFromTrash invoked for ${messageIds.length} emails:`, messageIds.slice(0, 5), '...');
      return { success: true, count: messageIds.length, dryRun: true };
    }

    if (!this.accessToken) throw new Error('Not authenticated');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: messageIds,
        removeLabelIds: ['TRASH'],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gmail batchRestore failed: ${res.status} ${err.error?.message || ''}`);
    }

    return { success: true, count: messageIds.length, dryRun: false };
  }

  async batchStar(messageIds) {
    if (!messageIds || messageIds.length === 0) return;

    if (this.dryRun) {
      console.log(`[DRY_RUN] batchStar invoked for ${messageIds.length} emails:`, messageIds.slice(0, 5));
      return { success: true, count: messageIds.length, dryRun: true };
    }

    if (!this.accessToken) throw new Error('Not authenticated');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: messageIds,
        addLabelIds: ['STARRED'],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gmail batchStar failed: ${res.status} ${err.error?.message || ''}`);
    }

    return { success: true, count: messageIds.length, dryRun: false };
  }
}

window.GmailClient = GmailClient;
window.gmailClient = new GmailClient();
