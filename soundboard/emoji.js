const CUSTOM_EMOJI_RE = /^<(a)?:(\w+):(\d+)>$/;
const ZWJ = '‍';
const VARIATION_SELECTOR = '️';
const SKIN_TONE_RANGE = '\u{1F3FB}-\u{1F3FF}';
const UNICODE_EMOJI_RE = new RegExp(
  `^[\\p{Extended_Pictographic}\\p{Regional_Indicator}${ZWJ}${VARIATION_SELECTOR}${SKIN_TONE_RANGE}]+$`,
  'u',
);

export function parseEmojiForButton(raw) {
  const trimmed = raw.trim();
  const match = CUSTOM_EMOJI_RE.exec(trimmed);
  if (match) {
    const [, animatedFlag, name, id] = match;
    return { id, name, animated: Boolean(animatedFlag) };
  }
  if (!UNICODE_EMOJI_RE.test(trimmed)) {
    throw new Error('Not a valid emoji');
  }
  return trimmed;
}
