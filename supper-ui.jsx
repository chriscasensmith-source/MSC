/* ============================================================
   MONTHLY SUPPER CLUB — UI primitives
   Stars, member dots, rating pills, badges, sticky tabs
   ============================================================ */

const { useState, useEffect, useRef, useMemo } = React;
const { MEMBER_COLOR, MEMBER_EMOJI, MEMBERS } = window.SC;

// ---- STARS (fractional, gold-filled) ----
function Stars({ value, size = 14, gap = 2, color = '#f1b740', muted = 'rgba(255,255,255,0.18)' }) {
  if (value == null) {
    return React.createElement('span', { className: 'stars-empty', style: { fontFamily: 'JetBrains Mono, monospace', fontSize: size*0.78, opacity: 0.5 } }, '— no rating —');
  }
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const fill = Math.max(0, Math.min(1, value - i));
    stars.push(
      React.createElement('span', { key: i, className: 'star', style: { width: size, height: size, position: 'relative', display: 'inline-block' } },
        React.createElement(StarSvg, { fill: muted, size }),
        React.createElement('span', { style: { position: 'absolute', inset: 0, width: `${fill*100}%`, overflow: 'hidden', display: 'inline-block' } },
          React.createElement(StarSvg, { fill: color, size })
        )
      )
    );
  }
  return React.createElement('span', { style: { display: 'inline-flex', gap, alignItems: 'center' } }, ...stars);
}
function StarSvg({ fill, size }) {
  return React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', style: { display: 'block' } },
    React.createElement('path', { fill, d: 'M12 2.3l2.9 6.2 6.8.7-5.1 4.6 1.5 6.7L12 17.1 5.9 20.5l1.5-6.7L2.3 9.2l6.8-.7z' })
  );
}

// ---- MEMBER DOT ----
function MemberDot({ name, value, size = 36, showLabel = false }) {
  const color = MEMBER_COLOR[name];
  const display = value == null ? '—' : (Number.isInteger(value) ? value.toString() : value.toFixed(1));
  return React.createElement('div', { className: 'mdot', style: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 } },
    React.createElement('div', {
      style: {
        width: size, height: size, borderRadius: '50%',
        background: value == null ? 'rgba(255,255,255,0.06)' : color,
        color: value == null ? 'rgba(255,255,255,0.5)' : '#0e0c11',
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size*0.42,
        border: value == null ? '1px dashed rgba(255,255,255,0.18)' : 'none',
        boxShadow: value != null ? `0 0 0 2px rgba(0,0,0,0.25), inset 0 -3px 0 rgba(0,0,0,0.18)` : 'none',
      }
    }, display),
    showLabel && React.createElement('span', { style: { fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' } }, name)
  );
}

// ---- AVERAGE RATING PILL ----
function AvgPill({ value, size = 'md' }) {
  const big = size === 'lg';
  if (value == null) {
    return React.createElement('div', {
      style: {
        padding: big ? '8px 14px' : '4px 10px',
        borderRadius: 999, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
        fontFamily: 'JetBrains Mono, monospace', fontSize: big ? 14 : 11, letterSpacing: 1,
        border: '1px dashed rgba(255,255,255,0.15)',
      }
    }, '— / 5');
  }
  // color by score band
  const band =
    value >= 4.5 ? { bg: '#e8b339', fg: '#1a1410' } :
    value >= 3.5 ? { bg: '#3fb98a', fg: '#082018' } :
    value >= 2.5 ? { bg: '#5b8def', fg: '#06122a' } :
    value >= 1.5 ? { bg: '#e8693a', fg: '#1a0a05' } :
                   { bg: '#9c4242', fg: '#fde9d6' };
  return React.createElement('div', {
    style: {
      display: 'inline-flex', alignItems: 'baseline', gap: 4,
      padding: big ? '8px 16px' : '5px 11px',
      borderRadius: 999, background: band.bg, color: band.fg,
      fontFamily: 'Instrument Serif, serif',
      fontStyle: 'italic',
      fontSize: big ? 28 : 16,
      lineHeight: 1,
      boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.15)',
    }
  },
    value.toFixed(2).replace(/\.?0+$/, ''),
    React.createElement('span', { style: { fontFamily: 'JetBrains Mono, monospace', fontStyle: 'normal', fontSize: big ? 12 : 9, opacity: 0.7, letterSpacing: 1 } }, '/5')
  );
}

// ---- BADGE ----
function Badge({ tone = 'cream', children, icon }) {
  const tones = {
    cream: { bg: '#fbf2e3', fg: '#1a1410', bd: '#1a1410' },
    coral: { bg: '#e8693a', fg: '#1a0a05', bd: 'transparent' },
    jade:  { bg: '#3fb98a', fg: '#062018', bd: 'transparent' },
    gold:  { bg: '#f1b740', fg: '#1a1410', bd: 'transparent' },
    smoke: { bg: 'rgba(255,255,255,0.06)', fg: 'rgba(255,255,255,0.7)', bd: 'rgba(255,255,255,0.18)' },
    void:  { bg: 'transparent', fg: '#e8693a', bd: '#e8693a' },
  };
  const t = tones[tone] || tones.cream;
  return React.createElement('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 9.5, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600,
    }
  }, icon, children);
}

// ---- STAT TILE ----
function StatTile({ label, value, sub, accent = '#f1b740', big }) {
  return React.createElement('div', {
    className: 'stat-tile',
    style: {
      background: '#fbf2e3', color: '#1a1410',
      borderRadius: 18, padding: big ? '18px 18px 16px' : '14px',
      position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(26,20,16,0.08)',
      boxShadow: '0 2px 0 rgba(0,0,0,0.4)',
    }
  },
    React.createElement('div', { style: { fontFamily: 'JetBrains Mono, monospace', fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: '#6b5a47' } }, label),
    React.createElement('div', { style: { fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: big ? 44 : 32, lineHeight: 1, marginTop: 6, color: '#1a1410' } }, value),
    sub && React.createElement('div', { style: { fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6b5a47', marginTop: 6 } }, sub),
    React.createElement('div', { style: { position: 'absolute', right: -12, bottom: -12, width: 50, height: 50, borderRadius: '50%', background: accent, opacity: 0.85 } })
  );
}

// ---- SECTION HEADER ----
function SectionHeader({ kicker, title, hint }) {
  return React.createElement('div', { style: { marginBottom: 14 } },
    React.createElement('div', { style: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#e8693a', marginBottom: 4 } }, kicker),
    React.createElement('h2', { style: { fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 36, lineHeight: 1, margin: 0, color: '#fbf2e3', fontWeight: 400 } }, title),
    hint && React.createElement('div', { style: { fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'rgba(251,242,227,0.55)', marginTop: 6, maxWidth: 380 } }, hint)
  );
}

// ---- COUNT-UP NUMBER ----
function Counter({ to, duration = 900, decimals = 0, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return decimals ? val.toFixed(decimals) + suffix : Math.round(val).toString() + suffix;
}

// ---- IMAGE TILE w/ placeholder ----
function PhotoTile({ row, onClick, aspect = '4 / 5' }) {
  return React.createElement('div', {
    onClick,
    style: {
      position: 'relative', aspectRatio: aspect, borderRadius: 14, overflow: 'hidden',
      background: '#1a1410', cursor: onClick ? 'pointer' : 'default',
    }
  },
    row.image
      ? React.createElement('img', { src: row.image, alt: row.name, loading: 'lazy', style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } })
      : React.createElement(PhotoPlaceholder, { name: row.name }),
    row.avg != null && React.createElement('div', {
      style: { position: 'absolute', top: 8, right: 8 }
    }, React.createElement(AvgPill, { value: row.avg }))
  );
}

function PhotoPlaceholder({ name }) {
  // diagonal stripes
  return React.createElement('div', {
    style: {
      width: '100%', height: '100%',
      backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 6px, rgba(255,255,255,0.06) 6px 12px)',
      background: 'linear-gradient(135deg, #2a2230 0%, #1a1410 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      color: 'rgba(251,242,227,0.7)', padding: 14, textAlign: 'center',
    }
  },
    React.createElement('div', { style: { fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: 2, opacity: 0.5 } }, 'NO PHOTO'),
    React.createElement('div', { style: { fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 22, lineHeight: 1.05 } }, name)
  );
}

Object.assign(window, {
  Stars, MemberDot, AvgPill, Badge, StatTile, SectionHeader, Counter, PhotoTile, PhotoPlaceholder
});
