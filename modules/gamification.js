// AI-OS Gamification Engine
// Powered by A.R. Labs
//
// Fully client-side XP / Level / Streak / Coins / Achievements / Daily-Mission
// engine. All state is persisted in localStorage under the "aios_gm_" namespace.
// Zero backend involvement. Zero duplication of auth/subscription/payment logic.
//
// Public API (all also exposed on window.gamification):
//   initGamification()
//   awardXP(amount, reason?)
//   awardCoins(amount)
//   getState()
//   getDailyMission()
//   completeMissionTask(taskId)
//   claimDailyReward()
//   getWeeklyChallenge()
//   updateWeeklyChallengeProgress(delta)
//   unlockAchievement(id)
//   checkDailyStreak()

// ─── Constants ────────────────────────────────────────────────────────────────

const NS = 'aios_gm_';

// XP required to REACH each level (index = level, value = cumulative XP floor)
const LEVEL_THRESHOLDS = [
  0,      // L1
  100,    // L2
  250,    // L3
  450,    // L4
  700,    // L5
  1000,   // L6
  1400,   // L7
  1900,   // L8
  2500,   // L9
  3200,   // L10
  4000,   // L11
  5000,   // L12
  6200,   // L13
  7600,   // L14
  9200,   // L15
  11000,  // L16
  13000,  // L17
  15500,  // L18
  18500,  // L19
  22000,  // L20
  26000,  // L21
  30500,  // L22
  35500,  // L23
  41000,  // L24
  47000,  // L25
  54000,  // L26
  62000,  // L27
  71000,  // L28
  81000,  // L29
  92000,  // L30
];

// Achievement definitions
export const ACHIEVEMENTS = [
  { id: 'first_visit',    label: 'Pioneer',          desc: 'Opened AI-OS for the first time',           xp: 50,   icon: '🚀' },
  { id: 'streak_3',       label: '3-Day Streak',     desc: 'Visited 3 days in a row',                   xp: 75,   icon: '🔥' },
  { id: 'streak_7',       label: 'Week Warrior',     desc: 'Visited 7 days in a row',                   xp: 200,  icon: '⚡' },
  { id: 'streak_30',      label: 'Iron Habit',       desc: 'Visited 30 days in a row',                  xp: 1000, icon: '💎' },
  { id: 'level_5',        label: 'Level 5 Reached',  desc: 'Reached Level 5',                            xp: 100,  icon: '⭐' },
  { id: 'level_10',       label: 'Level 10 Reached', desc: 'Reached Level 10',                           xp: 300,  icon: '🌟' },
  { id: 'level_20',       label: 'Level 20 Reached', desc: 'Reached Level 20',                           xp: 800,  icon: '💫' },
  { id: 'roadmap_1',      label: 'First Roadmap',    desc: 'Compiled your first AI roadmap',            xp: 50,   icon: '🗺️' },
  { id: 'roadmap_5',      label: 'Roadmap Builder',  desc: 'Compiled 5 AI roadmaps',                    xp: 150,  icon: '🏗️' },
  { id: 'mission_first',  label: 'On a Mission',     desc: 'Completed your first daily mission',        xp: 100,  icon: '🎯' },
  { id: 'mission_7',      label: 'Mission Expert',   desc: 'Completed 7 daily missions',                xp: 500,  icon: '🏆' },
  { id: 'coins_100',      label: 'Coin Collector',   desc: 'Accumulated 100 coins',                     xp: 50,   icon: '🪙' },
  { id: 'coins_1000',     label: 'Coin Hoarder',     desc: 'Accumulated 1,000 coins',                   xp: 200,  icon: '💰' },
  { id: 'weekly_first',   label: 'Weekly Champion',  desc: 'Completed your first weekly challenge',     xp: 300,  icon: '🏅' },
];

// Daily mission pool — 3 are picked each day based on day-of-year
const MISSION_POOL = [
  { id: 'visit',       label: 'Visit AI-OS today',                        xp: 25,  coins: 5  },
  { id: 'roadmap',     label: 'Compile an AI roadmap',                     xp: 30,  coins: 8  },
  { id: 'explore3',    label: 'Browse 3 tools in the Explore Library',     xp: 20,  coins: 5  },
  { id: 'category',    label: 'Visit the Category Explorer',               xp: 20,  coins: 5  },
  { id: 'tool_open',   label: 'Open a tool detail panel',                  xp: 15,  coins: 3  },
  { id: 'business',    label: 'Visit AI-OS Business workspace',            xp: 30,  coins: 10 },
  { id: 'learn',       label: 'Open a Learn module in Business',           xp: 25,  coins: 8  },
  { id: 'build',       label: 'Browse the Build workspace',                xp: 25,  coins: 8  },
  { id: 'share',       label: 'Copy a roadmap prompt for use',             xp: 20,  coins: 5  },
  { id: 'tip',         label: 'Read the AI Tip of the Day',                xp: 10,  coins: 2  },
  { id: 'prompt',      label: 'Read the Prompt of the Day',                xp: 10,  coins: 2  },
  { id: 'challenge',   label: 'Check your Weekly Challenge progress',      xp: 10,  coins: 2  },
  { id: 'streak',      label: 'Keep your daily streak alive',              xp: 30,  coins: 10 },
  { id: 'compare',     label: 'Compare 2 AI tools side by side',           xp: 20,  coins: 5  },
];

// Weekly challenge pool — one per week (cycles every 52 weeks)
const WEEKLY_CHALLENGES = [
  { id: 'wc_roadmaps',   label: 'Compile 5 different AI roadmaps this week',   goal: 5,   unit: 'roadmaps', xp: 500,  coins: 100 },
  { id: 'wc_streak',     label: 'Maintain a 5-day streak this week',            goal: 5,   unit: 'days',     xp: 400,  coins: 80  },
  { id: 'wc_tools',      label: 'Explore 10 different AI tools this week',      goal: 10,  unit: 'tools',    xp: 450,  coins: 90  },
  { id: 'wc_xp',         label: 'Earn 500 XP this week',                        goal: 500, unit: 'XP',       xp: 600,  coins: 120 },
  { id: 'wc_visit',      label: 'Visit AI-OS 7 days in a row this week',        goal: 7,   unit: 'days',     xp: 700,  coins: 140 },
  { id: 'wc_missions',   label: 'Complete 5 daily missions this week',          goal: 5,   unit: 'missions', xp: 550,  coins: 110 },
  { id: 'wc_business',   label: 'Spend time in AI-OS Business 3 times',         goal: 3,   unit: 'sessions', xp: 480,  coins: 100 },
];

// ─── Storage Helpers ──────────────────────────────────────────────────────────

function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NS + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch {}
}

// ─── State ────────────────────────────────────────────────────────────────────

function loadState() {
  return {
    xp:             load('xp', 0),
    level:          load('level', 1),
    coins:          load('coins', 0),
    streak:         load('streak', 0),
    longestStreak:  load('longestStreak', 0),
    lastVisit:      load('lastVisit', null),
    achievements:   load('achievements', []),
    roadmapsCompiled: load('roadmapsCompiled', 0),
    missionsCompleted: load('missionsCompleted', 0),
    toolsOpened:    load('toolsOpened', 0),
    lastDailyReward:load('lastDailyReward', null),
  };
}

function saveState(st) {
  save('xp',              st.xp);
  save('level',           st.level);
  save('coins',           st.coins);
  save('streak',          st.streak);
  save('longestStreak',   st.longestStreak);
  save('lastVisit',       st.lastVisit);
  save('achievements',    st.achievements);
  save('roadmapsCompiled',st.roadmapsCompiled);
  save('missionsCompleted', st.missionsCompleted);
  save('toolsOpened',     st.toolsOpened);
  save('lastDailyReward', st.lastDailyReward);
}

// In-memory state reference (kept in sync with localStorage)
let _state = null;

// ─── Level Calculation ────────────────────────────────────────────────────────

function xpToLevel(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

function levelProgress(xp) {
  const level = xpToLevel(xp);
  const idx   = level - 1;
  const floor = LEVEL_THRESHOLDS[idx] || 0;
  const ceil  = LEVEL_THRESHOLDS[idx + 1];
  if (!ceil) return { pct: 100, current: xp - floor, needed: 0 };
  const pct = Math.round(((xp - floor) / (ceil - floor)) * 100);
  return { pct: Math.min(pct, 99), current: xp - floor, needed: ceil - xp };
}

// ─── Event Broadcasting ───────────────────────────────────────────────────────

function broadcast(detail = {}) {
  document.dispatchEvent(new CustomEvent('aios:gm:update', { detail }));
}

// ─── Date Utilities ───────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / 86400000);
}

function weekNumber() {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Award XP and check for level-ups + achievement triggers.
 * @param {number} amount
 * @param {string} [reason]
 */
export function awardXP(amount, reason = '') {
  if (!_state || !isGamificationUnlocked()) return;
  const prev = _state.xp;
  _state.xp += amount;
  const newLevel = xpToLevel(_state.xp);
  const leveledUp = newLevel > _state.level;
  _state.level = newLevel;

  // Track specific action counters and unit-specific weekly challenge progress
  if (reason === 'roadmap') {
    _state.roadmapsCompiled++;
    updateWeeklyChallengeProgress(1, 'roadmaps');
  }
  if (reason === 'tool_open') {
    _state.toolsOpened++;
    updateWeeklyChallengeProgress(1, 'tools');
  }

  saveState(_state);
  broadcast({ type: 'xp', amount, reason, prev, leveledUp, level: _state.level });

  // Trigger level-based achievements (unlockAchievement guards against loops
  // by checking _state.achievements before awarding XP, so no recursion risk)
  if (_state.level >= 5)  unlockAchievement('level_5');
  if (_state.level >= 10) unlockAchievement('level_10');
  if (_state.level >= 20) unlockAchievement('level_20');

  // Roadmap achievements
  if (_state.roadmapsCompiled >= 1) unlockAchievement('roadmap_1');
  if (_state.roadmapsCompiled >= 5) unlockAchievement('roadmap_5');

  // XP-unit weekly challenge progress (skip if this XP came from a weekly
  // bonus to prevent double-counting)
  if (reason !== 'weekly_bonus') {
    updateWeeklyChallengeProgress(amount, 'xp');
  }
}

/**
 * Award coins.
 * @param {number} amount
 */
export function awardCoins(amount) {
  if (!_state || !isGamificationUnlocked()) return;
  _state.coins += amount;
  saveState(_state);
  broadcast({ type: 'coins', amount });

  // Coin achievement milestones
  if (_state.coins >= 100)  unlockAchievement('coins_100');
  if (_state.coins >= 1000) unlockAchievement('coins_1000');
}

/**
 * Returns full gamification state snapshot.
 */
export function getState() {
  if (!_state) return null;
  const prog = levelProgress(_state.xp);
  return {
    ..._state,
    levelProgress: prog,
    xpThreshold: LEVEL_THRESHOLDS[_state.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1],
  };
}

// ─── Daily Streak ─────────────────────────────────────────────────────────────

export function checkDailyStreak() {
  if (!_state || !isGamificationUnlocked()) return;
  const today = todayStr();
  if (_state.lastVisit === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;

  if (_state.lastVisit === yesterdayStr) {
    _state.streak++;
  } else if (_state.lastVisit !== null) {
    _state.streak = 1; // streak broken
  } else {
    _state.streak = 1; // first ever visit
  }

  _state.longestStreak = Math.max(_state.longestStreak, _state.streak);
  _state.lastVisit = today;
  saveState(_state);
  broadcast({ type: 'streak', streak: _state.streak });

  // Streak achievements
  if (_state.streak >= 3)  unlockAchievement('streak_3');
  if (_state.streak >= 7)  unlockAchievement('streak_7');
  if (_state.streak >= 30) unlockAchievement('streak_30');

  // Award daily visit XP
  awardXP(50, 'daily_visit');
  updateWeeklyChallengeProgress(1, 'days');
}

// ─── Daily Mission ────────────────────────────────────────────────────────────

export function getDailyMission() {
  const today = todayStr();
  const stored = load('dailyMission', null);

  if (stored && stored.date === today) return stored;

  // Pick 3 tasks seeded by day-of-year
  const seed = dayOfYear();
  const picks = [];
  const pool  = [...MISSION_POOL];
  for (let i = 0; i < 3; i++) {
    const idx = (seed + i * 7 + i) % pool.length;
    picks.push({ ...pool[idx], done: false });
    pool.splice(idx, 1);
  }

  const mission = { date: today, tasks: picks, claimed: false };
  save('dailyMission', mission);
  return mission;
}

export function completeMissionTask(taskId) {
  const mission = getDailyMission();
  const task = mission.tasks.find(t => t.id === taskId);
  if (!task || task.done) return false;
  task.done = true;
  save('dailyMission', mission);

  awardXP(task.xp, 'mission_task');
  awardCoins(task.coins || 5);

  // Check if all tasks done
  const allDone = mission.tasks.every(t => t.done);
  if (allDone && !mission.claimed) {
    mission.claimed = true;
    save('dailyMission', mission);
    // Bonus for completing the full mission
    awardXP(50, 'mission_complete');
    awardCoins(20);
    unlockAchievement('mission_first');
    if (!_state) return true;
    _state.missionsCompleted++;
    saveState(_state);
    if (_state.missionsCompleted >= 7) unlockAchievement('mission_7');
    updateWeeklyChallengeProgress(1, 'missions');
  }

  broadcast({ type: 'mission', taskId, allDone });
  return true;
}

// ─── Daily Reward ─────────────────────────────────────────────────────────────

export function claimDailyReward() {
  if (!_state) return false;
  const today = todayStr();
  if (_state.lastDailyReward === today) return false;

  _state.lastDailyReward = today;
  saveState(_state);

  awardXP(100, 'daily_reward');
  awardCoins(25);
  broadcast({ type: 'daily_reward' });
  return true;
}

export function canClaimDailyReward() {
  if (!_state) return false;
  return _state.lastDailyReward !== todayStr();
}

// ─── Weekly Challenge ─────────────────────────────────────────────────────────

export function getWeeklyChallenge() {
  const week = weekNumber();
  const year = new Date().getFullYear();
  const key  = `${year}-W${week}`;
  const stored = load('weeklyChallenge', null);

  if (stored && stored.key === key) return stored;

  const challenge = {
    ...WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length],
    key,
    progress: 0,
    claimed: false,
  };
  save('weeklyChallenge', challenge);
  return challenge;
}

export function updateWeeklyChallengeProgress(delta, unit) {
  const ch = getWeeklyChallenge();
  if (ch.claimed) return;
  if (ch.unit !== unit && !(ch.unit === 'XP' && unit === 'xp')) return;

  ch.progress = Math.min(ch.progress + delta, ch.goal);
  save('weeklyChallenge', ch);
  broadcast({ type: 'weekly_progress', progress: ch.progress, goal: ch.goal });

  if (ch.progress >= ch.goal && !ch.claimed) {
    ch.claimed = true;
    save('weeklyChallenge', ch);
    awardXP(ch.xp, 'weekly_bonus');
    awardCoins(ch.coins);
    unlockAchievement('weekly_first');
    broadcast({ type: 'weekly_complete' });
  }
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export function unlockAchievement(id) {
  if (!_state) return;
  if (_state.achievements.includes(id)) return;

  const def = ACHIEVEMENTS.find(a => a.id === id);
  if (!def) return;

  _state.achievements.push(id);
  saveState(_state);

  // Award achievement XP (avoid stack overflow by not awarding XP for XP-based achievements)
  if (id !== 'level_5' && id !== 'level_10' && id !== 'level_20') {
    awardXP(def.xp, 'achievement');
  }

  broadcast({ type: 'achievement_unlocked', achievement: def });
}

// ─── Auth Guard ──────────────────────────────────────────────────────────────

/**
 * Returns true if a user is logged in and gamification should be active.
 * All public gamification functions check this before modifying state.
 */
export function isGamificationUnlocked() {
  return !!(window.state && window.state.user && window.state.user.id);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initGamification() {
  // Gate: gamification is only active for logged-in users
  if (!isGamificationUnlocked()) {
    // Broadcast a locked event so UI can show login prompts
    document.dispatchEvent(new CustomEvent('aios:gm:locked'));
    window.gamification = { isGamificationUnlocked, locked: true };
    return;
  }

  _state = loadState();

  // First-ever visit
  const isFirstVisit = _state.lastVisit === null;
  checkDailyStreak();

  if (isFirstVisit) {
    unlockAchievement('first_visit');
  }

  // Make sure weekly challenge exists
  getWeeklyChallenge();
  getDailyMission();

  // Expose on window for cross-module use
  window.gamification = {
    isGamificationUnlocked,
    awardXP,
    awardCoins,
    getState,
    getDailyMission,
    completeMissionTask,
    claimDailyReward,
    canClaimDailyReward,
    getWeeklyChallenge,
    updateWeeklyChallengeProgress,
    unlockAchievement,
    checkDailyStreak,
    ACHIEVEMENTS,
    locked: false,
  };

  broadcast({ type: 'init' });
}
