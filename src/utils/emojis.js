export const EMOJI_SETS = [
  {
    name: 'Classic',
    emojis: {
      1: '😢',
      2: '😕',
      3: '😐',
      4: '🙂',
      5: '😄'
    }
  },
  {
    name: 'Minimalist',
    emojis: {
      1: '🌑',
      2: '🌘',
      3: '🌗',
      4: '🌖',
      5: '🌕'
    }
  },
  {
    name: 'Hearts',
    emojis: {
      1: '💔',
      2: '🖤',
      3: '💛',
      4: '💚',
      5: '💖'
    }
  },
  {
    name: 'Stars',
    emojis: {
      1: '☁️',
      2: '🌥️',
      3: '⛅',
      4: '🌤️',
      5: '☀️'
    }
  }
];

export const getEmoji = (moodValue, settings) => {
  if (!settings || settings.disableEmojis) return null;
  const setIndex = settings.emojiSet || 0;
  const set = EMOJI_SETS[setIndex] || EMOJI_SETS[0];
  return set.emojis[moodValue] || null;
};
