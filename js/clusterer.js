// Email Clusterer & Boss Detector (PRD Section 7 & 11)
// Red emails are grouped by sender and category into clusters (2-6 emails)
// Senders with 200+ red emails qualify as Bosses
// Yellow and Green emails are NEVER clustered
// Shuffles and paces meteors with boss encounters evenly distributed

class EmailClusterer {
  static cluster(classifiedEmails) {
    const redEmailsBySender = new Map();
    const yellowList = [];
    const greenList = [];

    for (const item of classifiedEmails) {
      if (!item || !item.classification) continue;
      const { color, category } = item.classification;
      const email = item.email;

      if (color === 'red') {
        const senderKey = (email.senderClean || email.sender || 'Unknown Sender').toLowerCase().trim();
        if (!redEmailsBySender.has(senderKey)) {
          redEmailsBySender.set(senderKey, {
            senderDisplayName: email.senderName || email.sender || 'Unknown',
            senderEmail: email.sender || '',
            unsubscribeUrl: email.unsubscribeUrl || null,
            emailsByCategory: new Map(),
            totalRedCount: 0,
          });
        }
        const senderGroup = redEmailsBySender.get(senderKey);
        senderGroup.totalRedCount++;

        if (!senderGroup.emailsByCategory.has(category)) {
          senderGroup.emailsByCategory.set(category, []);
        }
        senderGroup.emailsByCategory.get(category).push(email);
      } else if (color === 'yellow') {
        yellowList.push(item);
      } else if (color === 'green') {
        greenList.push(item);
      }
    }

    const normalMeteors = [];
    const bossMeteors = [];
    const bossSenders = [];

    // Red Emails: Bosses and Clusters
    for (const [senderKey, senderData] of redEmailsBySender.entries()) {
      if (senderData.totalRedCount >= window.CONFIG.CLUSTERING.BOSS_THRESHOLD) {
        const allBossEmails = [];
        for (const emails of senderData.emailsByCategory.values()) {
          allBossEmails.push(...emails);
        }

        bossSenders.push({
          senderKey,
          senderName: senderData.senderDisplayName,
          senderEmail: senderData.senderEmail,
          count: senderData.totalRedCount,
          unsubscribeUrl: senderData.unsubscribeUrl,
        });

        bossMeteors.push({
          type: 'boss',
          color: 'red',
          senderName: senderData.senderDisplayName,
          senderEmail: senderData.senderEmail,
          emails: allBossEmails,
          count: allBossEmails.length,
          category: 'BOSS_SPAM',
          unsubscribeUrl: senderData.unsubscribeUrl,
          primaryEmail: allBossEmails[0],
        });
        continue;
      }

      for (const [cat, emails] of senderData.emailsByCategory.entries()) {
        const chunkSize = window.CONFIG.CLUSTERING.MAX_CLUSTER_SIZE;
        for (let i = 0; i < emails.length; i += chunkSize) {
          const chunk = emails.slice(i, i + chunkSize);
          const count = chunk.length;
          normalMeteors.push({
            type: count > 1 ? 'cluster' : 'single',
            color: 'red',
            senderName: senderData.senderDisplayName,
            senderEmail: senderData.senderEmail,
            emails: chunk,
            count: count,
            category: cat,
            unsubscribeUrl: senderData.unsubscribeUrl,
            primaryEmail: chunk[0],
          });
        }
      }
    }

    // Yellow emails: always 1 email per meteor
    for (const item of yellowList) {
      normalMeteors.push({
        type: 'single',
        color: 'yellow',
        senderName: item.email.senderName || item.email.sender || 'Unknown',
        senderEmail: item.email.sender || '',
        emails: [item.email],
        count: 1,
        category: item.classification.category,
        unsubscribeUrl: item.email.unsubscribeUrl || null,
        primaryEmail: item.email,
      });
    }

    // Green emails: always 1 email per meteor (Decoys)
    for (const item of greenList) {
      normalMeteors.push({
        type: 'single',
        color: 'green',
        senderName: item.email.senderName || item.email.sender || 'Unknown',
        senderEmail: item.email.sender || '',
        emails: [item.email],
        count: 1,
        category: item.classification.category,
        unsubscribeUrl: null,
        primaryEmail: item.email,
      });
    }

    // Fisher-Yates shuffle normal meteors for balanced gameplay distribution
    for (let i = normalMeteors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [normalMeteors[i], normalMeteors[j]] = [normalMeteors[j], normalMeteors[i]];
    }

    // Interleave Bosses periodically (e.g. every ~80 meteors) as climactic battles
    const finalMeteors = [];
    const bossInterval = Math.max(30, Math.floor(normalMeteors.length / (bossMeteors.length + 1)));

    let bossIndex = 0;
    for (let i = 0; i < normalMeteors.length; i++) {
      if (i > 0 && i % bossInterval === 0 && bossIndex < bossMeteors.length) {
        finalMeteors.push(bossMeteors[bossIndex++]);
      }
      finalMeteors.push(normalMeteors[i]);
    }
    // Append any remaining bosses
    while (bossIndex < bossMeteors.length) {
      finalMeteors.push(bossMeteors[bossIndex++]);
    }

    return {
      meteors: finalMeteors,
      bossSenders,
      stats: {
        totalRedEmails: Array.from(redEmailsBySender.values()).reduce((sum, s) => sum + s.totalRedCount, 0),
        totalYellowEmails: yellowList.length,
        totalGreenEmails: greenList.length,
        totalMeteors: finalMeteors.length,
      },
    };
  }
}

window.EmailClusterer = EmailClusterer;
