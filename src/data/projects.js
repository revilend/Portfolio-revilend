export const projects = [
  {
    id: 'teachermuzaffar',
    index: '01',
    title: 'teachermuzaffar.uz',
    tagline: 'Web Portal',
    status: { label: 'Live', tone: 'green' },
    description:
      'Full-featured educational platform with attendance tracking, gradebook, and Supabase auth.',
    stack: ['Supabase', 'PostgreSQL', 'Supabase Auth', 'JavaScript', 'Realtime DB'],
    url: 'https://teachermuzaffar.uz',
    features: [
      'Student attendance tracking with daily and monthly views',
      'Digital gradebook with weighted assessment categories',
      'Class schedule management for teachers and groups',
      'Supabase authentication with role-based access',
      'Realtime updates across open dashboards',
      'Mobile-first interface for classroom use',
    ],
  },
  {
    id: 'echoes-of-room-404',
    index: '02',
    title: 'Echoes of Room 404',
    tagline: '3D Web Game',
    status: { label: 'Prototype', tone: 'amber' },
    description:
      'First-person psychological horror web game built with pure Three.js & Web Audio API.',
    stack: ['Three.js', 'Web Audio API', 'Canvas 3D', 'Raycasting'],
    url: null,
    features: [
      'First-person movement with pointer lock',
      'Procedural raycast collision against room geometry',
      '3D positional audio and environmental ambience',
      'Exploration-driven psychological narrative',
      'Pure Three.js — no game engine runtime',
      'Playable directly in the browser',
    ],
  },
  {
    id: 'telegram-automation',
    index: '03',
    title: 'Telegram Auto-Bots',
    tagline: 'Automation & Cloud',
    status: { label: 'Production', tone: 'cyan' },
    description:
      'High-speed content delivery and AI-integrated (Gemini API) bot pipelines.',
    stack: ['Node.js', 'Telegram Bot API', 'Gemini API', 'Webhooks', 'Render'],
    url: null,
    features: [
      'High-throughput media delivery with chunked streams',
      'Queued messages with retries and rate limits',
      'Gemini-powered replies and content workflows',
      'Webhook ingestion with polling fallback',
      'Admin broadcast controls and scheduling',
      'Health-checked deployment on Render',
    ],
  },
];
