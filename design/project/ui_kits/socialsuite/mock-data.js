// Shared fake data for the SocialSuite UI kit — Islamic educational institution clients.
export const workspaces = [
  { key: 'hira-institute', initials: 'HI', name: 'HIRA Institute' },
  { key: 'hira-kitchen', initials: 'HK', name: 'HIRA Kitchen' },
  { key: 'al-khalil', initials: 'AK', name: 'Al Khalil Huffaz School' },
  { key: 'al-rehman', initials: 'AR', name: 'Al Rehman Academy' },
];

export const growthSeries = [
  { value: 8400 }, { value: 8650 }, { value: 8590 }, { value: 8900 },
  { value: 9200 }, { value: 9120 }, { value: 9450 }, { value: 9800 },
  { value: 10120 }, { value: 10380 }, { value: 10290 }, { value: 10640 },
  { value: 11050 }, { value: 11400 },
];

export const followersByCountry = [
  { label: 'Pakistan', value: 46 },
  { label: 'United Kingdom', value: 21 },
  { label: 'United States', value: 15 },
  { label: 'United Arab Emirates', value: 11 },
  { label: 'Other', value: 7 },
];

export const followersByCity = [
  { city: 'Karachi', country: 'Pakistan', followers: '18,204' },
  { city: 'Lahore', country: 'Pakistan', followers: '11,982' },
  { city: 'London', country: 'United Kingdom', followers: '6,340' },
  { city: 'Dubai', country: 'UAE', followers: '4,110' },
  { city: 'Birmingham', country: 'United Kingdom', followers: '2,860' },
  { city: 'Houston', country: 'United States', followers: '2,214' },
];

export const platformPosts = [
  { platform: 'instagram', label: 'Instagram', posts: 18, reach: '42.1K' },
  { platform: 'facebook', label: 'Facebook', posts: 12, reach: '28.6K' },
  { platform: 'tiktok', label: 'TikTok', posts: 9, reach: '61.4K' },
];

export const scheduledPosts = [
  { day: 1, hour: 9, platform: 'instagram', time: '9:00 AM', caption: 'Friday khutbah reminder — join us for Jummah at 1:15 PM…' },
  { day: 1, hour: 17, platform: 'facebook', time: '5:00 PM', caption: 'Registration for the Winter Hifz intensive closes this weekend…' },
  { day: 3, hour: 11, platform: 'tiktok', time: '11:00 AM', caption: 'A day in the life of a Huffaz student at Al Khalil 🎬' },
  { day: 4, hour: 15, platform: 'instagram', time: '3:00 PM', caption: 'New menu at HIRA Kitchen: catering trays for community iftars…' },
  { day: 5, hour: 10, platform: 'facebook', time: '10:00 AM', caption: 'Alumni spotlight: Class of 2019 update from Al Rehman Academy…' },
];

export const connections = [
  { platform: 'facebook', label: 'Facebook', status: 'connected', account: 'HIRA Institute' },
  { platform: 'instagram', label: 'Instagram', status: 'connected', account: '@hira.institute' },
  { platform: 'threads', label: 'Threads', status: 'not-connected' },
  { platform: 'x', label: 'X', status: 'not-connected' },
  { platform: 'bluesky', label: 'Bluesky', status: 'not-connected' },
  { platform: 'linkedin', label: 'LinkedIn', status: 'connected', account: 'HIRA Institute' },
  { platform: 'pinterest', label: 'Pinterest', status: 'not-connected' },
  { platform: 'tiktok', label: 'TikTok (personal)', status: 'connected', account: '@hira.moments' },
  { platform: 'tiktok', label: 'TikTok (business)', status: 'pending', account: 'Reconnect required' },
  { platform: 'google', label: 'Google Business Profile', status: 'connected', account: 'HIRA Institute — Karachi' },
  { platform: 'youtube', label: 'YouTube', status: 'connected', account: 'HIRA Institute' },
  { platform: 'twitch', label: 'Twitch', status: 'not-connected' },
  { platform: 'facebook', label: 'Meta Ads', status: 'connected', account: 'Ad account 8834' },
  { platform: 'google', label: 'Google Ads', status: 'not-connected' },
  { platform: 'tiktok', label: 'TikTok Ads', status: 'not-connected' },
];

export const conversations = [
  { id: 1, platform: 'instagram', name: 'Ayesha Raza', preview: 'Assalamu alaikum, what time does registration open tomorrow?', time: '2m', unread: true, resolved: false },
  { id: 2, platform: 'facebook', name: 'Bilal Ahmed', preview: 'Is the Hifz program open to transfer students mid-year?', time: '18m', unread: true, resolved: false },
  { id: 3, platform: 'tiktok', name: '@sana.k', preview: 'This video made me tear up, jazakAllah khair for sharing 🤍', time: '1h', unread: false, resolved: true },
  { id: 4, platform: 'instagram', name: 'Umar Farooq', preview: 'Following up on the catering quote for a 40-person iftar', time: '3h', unread: false, resolved: false },
  { id: 5, platform: 'facebook', name: 'Zainab Sheikh', preview: 'Thank you for the quick response earlier!', time: '1d', unread: false, resolved: true },
];

export const smartLinkLinks = [
  { label: 'Enroll for Winter Hifz Intensive', clicks: 842 },
  { label: 'HIRA Kitchen catering menu', clicks: 610 },
  { label: 'Donate — Ramadan appeal', clicks: 1204 },
  { label: 'Alumni newsletter signup', clicks: 214 },
];

export const adsCampaigns = [
  { channel: 'Meta Ads', name: 'Winter Hifz Intensive — enrollment', status: 'active', spend: 1240, budget: 2000 },
  { channel: 'Google Ads', name: 'HIRA Institute — brand search', status: 'active', spend: 380, budget: 500 },
  { channel: 'TikTok Ads', name: 'Ramadan appeal awareness', status: 'paused', spend: 900, budget: 900 },
  { channel: 'Meta Ads', name: 'Al Rehman Academy open house', status: 'active', spend: 210, budget: 750 },
];

export const trackerSessions = [
  { hashtag: '#HIRAOpenDay', platform: 'Instagram', status: 'active', started: '2026-07-01', mentions: 312 },
  { hashtag: '#WinterHifz2026', platform: 'TikTok', status: 'active', started: '2026-06-18', mentions: 894 },
  { hashtag: '#AlRehmanAlumni', platform: 'Facebook', status: 'completed', started: '2026-05-02', mentions: 156 },
  { hashtag: '#RamadanAppeal', platform: 'All platforms', status: 'completed', started: '2026-03-10', mentions: 2140 },
];
