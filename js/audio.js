/* ============================================================
   audio.js — Milestone 8 (audio pass): synthesized SFX + mute.
   All sound is generated with the Web Audio API — no asset files,
   fully offline (NFR-3). Per SRS §3.6 / NFR-ETH-2 the gambling-win
   jingle is deliberately thin and unsatisfying, so wins never feel
   truly good; saving gets a bright coin; low meters get a soft alarm.

   Mute is remembered in localStorage so it survives Replay/reset
   (independent of the resettable state.muted field).
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var ctx = null;

  // AudioContext is created lazily and resumed on the gesture that plays a
  // sound (browsers start it suspended). Returns null if Web Audio is absent.
  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return ctx;
  }

  // One enveloped tone. start/dur in seconds (relative), vol 0..1.
  function tone(freq, start, dur, type, vol) {
    var c = getCtx();
    if (!c) return;
    var t0 = c.currentTime + (start || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol == null ? 0.12 : vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }

  var SFX = {
    // bright two-note rise — money saved / income
    coin: function () { tone(880, 0, 0.08, 'square', 0.12); tone(1320, 0.07, 0.12, 'square', 0.12); },
    // DELIBERATELY cheap: two dull, nearly-flat sine notes that don't resolve
    winCheap: function () { tone(523, 0, 0.11, 'sine', 0.08); tone(540, 0.10, 0.16, 'sine', 0.07); },
    // dull descending loss
    lose: function () { tone(200, 0, 0.18, 'sawtooth', 0.11); tone(140, 0.15, 0.28, 'sawtooth', 0.11); },
    // soft double pulse — low meter warning
    alarm: function () { tone(330, 0, 0.14, 'triangle', 0.08); tone(330, 0.24, 0.16, 'triangle', 0.08); },
    // tiny UI tick
    click: function () { tone(640, 0, 0.03, 'square', 0.06); }
  };

  // Mute preference, persisted so Replay doesn't un-mute the player.
  var pref = false;
  try { var v = localStorage.getItem('diskarte.muted'); if (v != null) pref = (v === '1'); } catch (e) {}
  if (Diskarte.state) Diskarte.state.muted = pref;

  function persist() { try { localStorage.setItem('diskarte.muted', pref ? '1' : '0'); } catch (e) {} }

  Diskarte.audio = {
    play: function (name) { if (pref) return; var fn = SFX[name]; if (fn) fn(); },
    isMuted: function () { return pref; },
    setMuted: function (m) { pref = !!m; if (Diskarte.state) Diskarte.state.muted = pref; persist(); },
    toggle: function () {
      pref = !pref;
      if (Diskarte.state) Diskarte.state.muted = pref;
      persist();
      if (!pref) SFX.click();   // confirm on un-mute
      return pref;
    }
  };

  // Fixed mute toggle (top-left; the dev panel lives top-right).
  function buildToggle() {
    var b = document.createElement('button');
    b.id = 'mute-toggle';
    function render() {
      b.textContent = pref ? '🔇' : '🔊';
      b.setAttribute('aria-label', pref ? 'Unmute' : 'Mute');
      b.setAttribute('aria-pressed', pref ? 'true' : 'false');
    }
    render();
    b.addEventListener('click', function () { Diskarte.audio.toggle(); render(); });
    document.body.appendChild(b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildToggle);
  else buildToggle();
})();
