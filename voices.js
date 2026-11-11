// Web Speech does not expose a standard gender or age field.
// Unknown voices require an adult's explicit confirmation after listening.
const TeacherVoice = (() => {
  function name(voice) {
    return `${voice.name || ''} ${voice.voiceURI || ''}`.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function vietnamese(voice) {
    return /^vi(?:[-_]|$)/i.test(voice.lang || '');
  }
  function gender(voice) {
    const text = name(voice);
    if (/hoai[\s_-]*my|\bfemale\b|\bwoman\b|\bfeminine\b/.test(text)) return 'female';
    if (/nam[\s_-]*minh|\bmale\b|\bman\b|microsoft[\s_-]*an(?:\b|desktop)|^an\b/.test(text)) return 'male';
    return 'unknown';
  }
  function eligible(voice, confirmedURI = '') {
    return vietnamese(voice) && (gender(voice) === 'female' ||
      (gender(voice) === 'unknown' && voice.voiceURI === confirmedURI));
  }
  function choose(voices, preferredURI = '', confirmedURI = '') {
    const preferred = voices.find(v => v.voiceURI === preferredURI && eligible(v, confirmedURI));
    return preferred || voices.find(v => vietnamese(v) && gender(v) === 'female') || null;
  }
  return { vietnamese, gender, eligible, choose };
})();
