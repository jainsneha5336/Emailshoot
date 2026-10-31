// Demo Mode: 5,000 Realistic Procedurally Generated Emails (PRD Section 11 & 14)

function generateDemoInbox(totalCount = 5000) {
  const SENDER_TEMPLATES = [
    {
      name: 'LinkedIn Jobs',
      email: 'jobalerts-noreply@linkedin.com',
      labels: ['CATEGORY_PROMOTIONS'],
      subjects: [
        '30+ new jobs match your Software Engineer search',
        'Sneha, your profile was viewed by 14 recruiters this week',
        'Top jobs for you: Senior Full Stack Developer',
        'Don\'t miss out: Companies are actively hiring in your area',
        'Invitations pending: Connect with engineering managers',
      ],
      unsubscribeUrl: 'https://www.linkedin.com/unsubscribe/jobalerts',
      weight: 350,
      sizeRange: [25000, 65000],
    },
    {
      name: 'Uber Eats',
      email: 'offers@ubereats.com',
      labels: ['CATEGORY_PROMOTIONS'],
      subjects: [
        'Hungry? 40% off your next 3 orders this weekend!',
        'Free delivery on your favorite local sushi spots',
        'Craving pizza? Here is $10 off just for you',
        'Weekend specials starting now on Uber Eats',
        'Your exclusive coupon is expiring tonight',
      ],
      unsubscribeUrl: 'https://ubereats.com/opt-out',
      weight: 240,
      sizeRange: [40000, 95000],
    },
    {
      name: 'Temu Deals',
      email: 'promotions@temu-mail.com',
      labels: ['CATEGORY_PROMOTIONS', 'SPAM'],
      subjects: [
        'FLASH SALE: 90% off electronics ends in 2 hours!',
        'You won a $100 coupon bundle! Claim now',
        'Lightning deals unlocked for top shoppers',
        'Price drop alert on items in your cart',
        'Spin the wheel for free gifts today',
      ],
      unsubscribeUrl: 'https://temu.com/unsub',
      weight: 220,
      sizeRange: [50000, 120000],
    },
    {
      name: 'Amazon Deals',
      email: 'store-news@amazon.com',
      labels: ['CATEGORY_PROMOTIONS'],
      subjects: [
        'Sneha, deals inspired by your recent browsing',
        'Prime exclusive savings on tech accessories',
        'Save up to 50% on home essentials today',
        'Lightning Deal: Wireless noise-canceling headphones',
        'Daily Gold Box deals are here',
      ],
      unsubscribeUrl: 'https://amazon.com/gp/gss/manage',
      weight: 300,
      sizeRange: [35000, 85000],
    },
    {
      name: 'Pinterest',
      email: 'pin-digest@pinterest.com',
      labels: ['CATEGORY_SOCIAL'],
      subjects: [
        'Pins you might like: Minimalist workspace setups',
        '10 trending home decor ideas for this season',
        'Sneha, see the new pins saved to your board',
        'Popular on Pinterest today: Healthy quick recipes',
      ],
      unsubscribeUrl: 'https://pinterest.com/email/unsubscribe',
      weight: 180,
      sizeRange: [60000, 140000],
    },
    {
      name: 'Twitter / X',
      email: 'notify@x.com',
      labels: ['CATEGORY_SOCIAL'],
      subjects: [
        'See what people are saying about Artificial Intelligence',
        'Trending now: #TechNews and #WebDev',
        'New replies and reposts from people you follow',
        'Highlights from your feed: Catch up in 5 minutes',
      ],
      unsubscribeUrl: 'https://x.com/settings/email_notifications',
      weight: 170,
      sizeRange: [20000, 45000],
    },
    {
      name: 'Medium Daily',
      email: 'digest@medium.com',
      labels: ['CATEGORY_PROMOTIONS'],
      subjects: [
        'The Future of Frontend Engineering in 2027',
        '10 Architecture Principles Every Senior Engineer Must Know',
        'Why TypeScript is dominating modern game development',
        'How I optimized my web app to run at a solid 60 FPS',
      ],
      unsubscribeUrl: 'https://medium.com/unsubscribe',
      weight: 150,
      sizeRange: [45000, 80000],
    },
    {
      name: 'Duolingo',
      email: 'reminders@duolingo.com',
      labels: ['CATEGORY_SOCIAL'],
      subjects: [
        'Keep your streak alive! Duo is waiting for you',
        'Just 5 minutes of practice today protects your streak',
        'You ranked in the top 10 of the Obsidian League!',
        'Your weekly learning summary is here',
      ],
      unsubscribeUrl: 'https://duolingo.com/notifications/unsubscribe',
      weight: 120,
      sizeRange: [30000, 65000],
    },
    {
      name: 'DoorDash',
      email: 'no-reply@doordash.com',
      labels: ['CATEGORY_PROMOTIONS'],
      subjects: [
        'Tonight only: Zero delivery fees on $20+ orders',
        'Taste something new: local Thai favorites nearby',
        'DashPass promo: Save $15 on your grocery order',
      ],
      unsubscribeUrl: 'https://doordash.com/unsubscribe',
      weight: 110,
      sizeRange: [35000, 75000],
    },
    {
      name: 'Crypto Pump Alert',
      email: 'admin@airdrop-claim-crypto.xyz',
      labels: ['SPAM'],
      subjects: [
        'URGENT: Claim your $5,000 token airdrop now',
        'Exclusive invitation to pre-sale allocation round',
      ],
      unsubscribeUrl: null,
      weight: 70,
      sizeRange: [12000, 30000],
    },

    // --- YELLOW: Updates / Forums ---
    {
      name: 'GitHub Updates',
      email: 'notifications@github.com',
      labels: ['CATEGORY_UPDATES'],
      subjects: [
        '[my-project] Pull request #42 merged by dev-lead',
        '[phaser-game] New release v3.80.1 published',
        '[security] Dependabot alert: 0 vulnerabilities found',
      ],
      unsubscribeUrl: null,
      weight: 140,
      sizeRange: [15000, 45000],
    },
    {
      name: 'Stripe Billing',
      email: 'invoicing@stripe.com',
      labels: ['CATEGORY_UPDATES'],
      subjects: [
        'Your invoice #INV-92841 is ready for payment',
        'Receipt for monthly cloud compute subscription',
      ],
      unsubscribeUrl: null,
      weight: 70,
      sizeRange: [22000, 50000],
    },
    {
      name: 'Stack Overflow',
      email: 'do-not-reply@stackoverflow.email',
      labels: ['CATEGORY_FORUMS'],
      subjects: [
        'Top answers for questions tagged [javascript] and [game-dev]',
        'Someone upvoted your answer on HTML5 Canvas scaling',
      ],
      unsubscribeUrl: 'https://stackoverflow.com/email/unsubscribe',
      weight: 90,
      sizeRange: [35000, 80000],
    },
    {
      name: 'Reddit Digest',
      email: 'noreply@redditmail.com',
      labels: ['CATEGORY_FORUMS'],
      subjects: [
        'r/webdev: "What is your best productivity hack?"',
        'r/gamedev: "Showcase: retro pixel-art physics in browser"',
      ],
      unsubscribeUrl: 'https://reddit.com/prefs/unsubscribe',
      weight: 80,
      sizeRange: [40000, 95000],
    },

    // --- GREEN: Important & Starred ---
    {
      name: 'Bank of America',
      email: 'customer-service@bankofamerica.com',
      labels: ['IMPORTANT'],
      subjects: [
        'Important Security Alert: Login from a new device detected',
        'Your monthly credit card statement is now available',
      ],
      unsubscribeUrl: null,
      weight: 40,
      sizeRange: [30000, 60000],
    },
    {
      name: 'Google Accounts',
      email: 'no-reply@accounts.google.com',
      labels: ['IMPORTANT', 'STARRED'],
      subjects: [
        'Security alert: New sign-in on Windows desktop',
        '2-Step Verification backup codes generated',
      ],
      unsubscribeUrl: null,
      weight: 35,
      sizeRange: [25000, 50000],
    },
    {
      name: 'Dr. Sarah Miller',
      email: 'appointments@metropolitan-clinic.org',
      labels: ['STARRED', 'IMPORTANT'],
      subjects: [
        'Confirmed: Upcoming annual checkup appointment for Tuesday',
        'Lab test results ready to review in patient portal',
      ],
      unsubscribeUrl: null,
      weight: 25,
      sizeRange: [18000, 40000],
    },
    {
      name: 'Mom & Family',
      email: 'mom-personal@gmail.com',
      labels: ['STARRED'],
      subjects: [
        'Photos from weekend family dinner!',
        'Recipe you asked for: grandma\'s secret cookies',
      ],
      unsubscribeUrl: null,
      weight: 30,
      sizeRange: [250000, 1500000],
    },
  ];

  const totalWeight = SENDER_TEMPLATES.reduce((sum, t) => sum + t.weight, 0);
  const emails = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < totalCount; i++) {
    let r = Math.random() * totalWeight;
    let selectedTemplate = SENDER_TEMPLATES[0];
    for (const t of SENDER_TEMPLATES) {
      if (r < t.weight) {
        selectedTemplate = t;
        break;
      }
      r -= t.weight;
    }

    const randomSubject = selectedTemplate.subjects[
      Math.floor(Math.random() * selectedTemplate.subjects.length)
    ];

    const randomSize = Math.floor(
      selectedTemplate.sizeRange[0] +
      Math.random() * (selectedTemplate.sizeRange[1] - selectedTemplate.sizeRange[0])
    );

    const daysAgo = Math.pow(Math.random(), 1.5) * 180;
    const dateObj = new Date(now - daysAgo * dayMs);
    const dateStr = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    emails.push({
      id: `demo_msg_${100000 + i}`,
      threadId: `demo_thread_${100000 + i}`,
      sender: selectedTemplate.email,
      senderName: selectedTemplate.name,
      senderClean: selectedTemplate.name,
      subject: randomSubject,
      date: dateStr,
      timestamp: dateObj.getTime(),
      sizeEstimate: randomSize,
      labelIds: [...selectedTemplate.labels],
      unsubscribeUrl: selectedTemplate.unsubscribeUrl,
    });
  }

  emails.sort((a, b) => b.timestamp - a.timestamp);
  return emails;
}

window.generateDemoInbox = generateDemoInbox;
