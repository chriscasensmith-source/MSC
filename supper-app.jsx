/* ============================================================
   MONTHLY SUPPER CLUB — main app
   Sections: Hero · Filters · Feed · Leaderboards · Timeline
             · Members · Repeats · Gallery
   ============================================================ */

const { ALL, VISITED, CANCELLED } = window.SC;

// ============================================================
// HERO
// ============================================================
function Hero({ onTopJump }) {
  const visitedCount = VISITED.length;
  const cancelledCount = CANCELLED.length;
  const avgAll = VISITED.filter(r => r.avg != null).reduce((s,r)=>s+r.avg,0) / VISITED.filter(r=>r.avg!=null).length;
  const sorted = [...VISITED].filter(r => r.avg != null).sort((a,b) => b.avg - a.avg);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const recent = [...VISITED].sort((a,b) => (b.date.y-a.date.y) || (b.date.m-a.date.m) || (b.date.d-a.date.d))[0];
  // best comeback = repeat group with biggest positive last-first
  const groups = window.SC.repeatGroups();
  let comeback = null;
  groups.forEach(g => {
    const valid = g.visits.filter(v => v.avg != null);
    if (valid.length < 2) return;
    const delta = valid[valid.length-1].avg - valid[0].avg;
    if (!comeback || delta > comeback.delta) comeback = { name: g.name, delta, last: valid[valid.length-1], first: valid[0] };
  });

  return React.createElement('section', { className: 'hero', id: 'top' },
    React.createElement('div', { className: 'hero-marquee' },
      React.createElement('span', null, '★ MONTHLY SUPPER CLUB · EST. 2022 · MONTHLY SUPPER CLUB · EST. 2022 · MONTHLY SUPPER CLUB · EST. 2022 ')
    ),
    React.createElement('div', { className: 'hero-top' },
      React.createElement('div', { className: 'logo-stamp' },
        React.createElement('div', { className: 'stamp-inner' },
          React.createElement('div', { className: 'stamp-row1' }, 'Vol. IV'),
          React.createElement('div', { className: 'stamp-row2' }, 'CLUB'),
          React.createElement('div', { className: 'stamp-row3' }, 'NO. ', String(visitedCount).padStart(2,'0'))
        )
      ),
      React.createElement('div', { className: 'hero-meta' },
        React.createElement('div', { className: 'hero-kicker' }, 'a private dinner society'),
        React.createElement('div', { className: 'hero-members' },
          MEMBERS.map(m => React.createElement('span', { key: m, className: 'hero-member', style: { color: MEMBER_COLOR[m] } }, m))
        )
      )
    ),
    React.createElement('h1', { className: 'hero-title' },
      React.createElement('span', null, 'Monthly'),
      React.createElement('span', { className: 'hero-amp' }, '+'),
      React.createElement('span', null, 'Supper'),
      React.createElement('span', { className: 'hero-amp2' }, '+'),
      React.createElement('span', null, 'Club')
    ),
    React.createElement('div', { className: 'hero-sub' },
      visitedCount, ' suppers · ', cancelledCount, ' cancelled · five appetites · one club average of ',
      React.createElement('span', { className: 'hero-avg' }, avgAll.toFixed(2)), ' / 5'
    ),

    React.createElement('div', { className: 'hero-grid' },
      React.createElement(StatTile, { label: 'Suppers served', value: React.createElement(Counter, { to: visitedCount }), sub: 'and counting', accent: '#f1b740', big: true }),
      React.createElement(StatTile, { label: 'Club average', value: React.createElement(Counter, { to: avgAll, decimals: 2 }), sub: 'across all ratings', accent: '#3fb98a' }),
      React.createElement('div', { className: 'stat-tile big-tile' },
        React.createElement('div', { className: 'tile-kicker' }, '👑 highest rated'),
        React.createElement('div', { className: 'tile-name' }, top.name),
        React.createElement('div', { className: 'tile-meta' }, top.date.label),
        React.createElement('div', { style: { marginTop: 10 } }, React.createElement(AvgPill, { value: top.avg, size: 'lg' }))
      ),
      React.createElement('div', { className: 'stat-tile dark-tile' },
        React.createElement('div', { className: 'tile-kicker dark' }, '💀 lowest rated'),
        React.createElement('div', { className: 'tile-name dark' }, bottom.name),
        React.createElement('div', { className: 'tile-meta dark' }, bottom.date.label),
        React.createElement('div', { style: { marginTop: 10 } }, React.createElement(AvgPill, { value: bottom.avg, size: 'lg' }))
      ),
      React.createElement(StatTile, { label: 'Cancelled months', value: cancelledCount, sub: 'the ones that got away', accent: '#e8693a' }),
      React.createElement(StatTile, { label: 'Most recent visit', value: recent.name, sub: recent.date.label, accent: '#5b8def' }),
      comeback && React.createElement('div', { className: 'stat-tile comeback' },
        React.createElement('div', { className: 'tile-kicker' }, '↗ best comeback'),
        React.createElement('div', { className: 'tile-name' }, comeback.name),
        React.createElement('div', { className: 'tile-meta' }, `${comeback.first.avg.toFixed(2)} → ${comeback.last.avg.toFixed(2)} · +${comeback.delta.toFixed(2)}`)
      )
    )
  );
}

// ============================================================
// FILTERS
// ============================================================
function Filters({ value, onChange }) {
  const years = useMemo(() => [...new Set(ALL.map(r => r.date.y))].sort(), []);
  const restaurants = useMemo(() => [...new Set(VISITED.map(r => r.canonical))].sort(), []);

  const set = (k, v) => onChange({ ...value, [k]: v });

  const Chip = ({ active, onClick, children, color }) => React.createElement('button', {
    onClick, className: 'chip', 'data-active': active ? '1' : '0',
    style: active && color ? { background: color, color: '#1a1410', borderColor: color } : undefined,
  }, children);

  return React.createElement('div', { className: 'filters' },
    React.createElement('div', { className: 'filter-row' },
      React.createElement('div', { className: 'filter-label' }, 'YEAR'),
      React.createElement('div', { className: 'chips' },
        React.createElement(Chip, { active: value.year === 'all', onClick: () => set('year', 'all') }, 'All'),
        years.map(y => React.createElement(Chip, { key: y, active: value.year === y, onClick: () => set('year', y) }, y))
      )
    ),
    React.createElement('div', { className: 'filter-row' },
      React.createElement('div', { className: 'filter-label' }, 'STATUS'),
      React.createElement('div', { className: 'chips' },
        React.createElement(Chip, { active: value.status === 'all', onClick: () => set('status', 'all') }, 'All'),
        React.createElement(Chip, { active: value.status === 'Visited', onClick: () => set('status', 'Visited') }, 'Visited'),
        React.createElement(Chip, { active: value.status === 'Cancelled', onClick: () => set('status', 'Cancelled') }, 'Cancelled')
      )
    ),
    React.createElement('div', { className: 'filter-row' },
      React.createElement('div', { className: 'filter-label' }, 'RATED BY'),
      React.createElement('div', { className: 'chips' },
        React.createElement(Chip, { active: value.member === 'all', onClick: () => set('member', 'all') }, 'Everyone'),
        MEMBERS.map(m => React.createElement(Chip, { key: m, active: value.member === m, onClick: () => set('member', m), color: MEMBER_COLOR[m] }, m))
      )
    ),
    React.createElement('div', { className: 'filter-row' },
      React.createElement('div', { className: 'filter-label' }, `MIN AVG · ${value.minAvg.toFixed(1)}`),
      React.createElement('input', {
        type: 'range', min: 0, max: 5, step: 0.5, value: value.minAvg,
        onChange: e => set('minAvg', parseFloat(e.target.value)),
        className: 'slider',
      })
    ),
    React.createElement('div', { className: 'filter-row' },
      React.createElement('div', { className: 'filter-label' }, 'TOGGLES'),
      React.createElement('div', { className: 'chips' },
        React.createElement(Chip, { active: value.hasPhoto, onClick: () => set('hasPhoto', !value.hasPhoto) }, '📷 Has photo'),
        React.createElement(Chip, { active: value.repeats, onClick: () => set('repeats', !value.repeats) }, '↻ Repeats only')
      )
    ),
    React.createElement('div', { className: 'filter-row' },
      React.createElement('div', { className: 'filter-label' }, 'RESTAURANT'),
      React.createElement('select', {
        className: 'sel', value: value.restaurant,
        onChange: e => set('restaurant', e.target.value),
      },
        React.createElement('option', { value: 'all' }, 'All restaurants'),
        restaurants.map(r => React.createElement('option', { key: r, value: r }, r))
      )
    )
  );
}

function filterRows(rows, f, repeatNames) {
  return rows.filter(r => {
    if (f.year !== 'all' && r.date.y !== f.year) return false;
    if (f.status !== 'all' && r.status !== f.status) return false;
    if (f.member !== 'all' && r.ratings && r.ratings[f.member] == null) return false;
    if (f.minAvg > 0 && (r.avg == null || r.avg < f.minAvg)) return false;
    if (f.hasPhoto && !r.hasPhoto) return false;
    if (f.repeats && !repeatNames.has(r.canonical)) return false;
    if (f.restaurant !== 'all' && r.canonical !== f.restaurant) return false;
    return true;
  });
}

// ============================================================
// FEED — one big card per restaurant (newest first)
// ============================================================
function Feed({ rows, repeatNames, onOpen }) {
  if (!rows.length) {
    return React.createElement('div', { className: 'empty' }, 'No suppers match those filters. Loosen up — there\'s wine to drink.');
  }
  return React.createElement('div', { className: 'feed' },
    rows.map((r, i) => React.createElement(RestaurantCard, { key: r.id, row: r, isRepeat: repeatNames.has(r.canonical), onOpen, index: i }))
  );
}

function RestaurantCard({ row, isRepeat, onOpen, index }) {
  const cancelled = row.status === 'Cancelled';
  return React.createElement('article', {
    className: 'rcard',
    'data-cancelled': cancelled ? '1' : '0',
    style: { animationDelay: `${Math.min(index, 8) * 40}ms` },
    onClick: () => !cancelled && onOpen && onOpen(row),
  },
    cancelled
      ? React.createElement(CancelledCard, { row })
      : React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'rcard-photo' },
            row.image
              ? React.createElement('img', { src: row.image, alt: row.name, loading: 'lazy' })
              : React.createElement(PhotoPlaceholder, { name: row.name }),
            React.createElement('div', { className: 'rcard-photo-grad' }),
            React.createElement('div', { className: 'rcard-badges' },
              isRepeat && React.createElement(Badge, { tone: 'gold' }, '↻ Repeat'),
              !row.hasPhoto && React.createElement(Badge, { tone: 'smoke' }, 'No photo')
            ),
            React.createElement('div', { className: 'rcard-avg-float' }, React.createElement(AvgPill, { value: row.avg, size: 'lg' }))
          ),
          React.createElement('div', { className: 'rcard-body' },
            React.createElement('div', { className: 'rcard-date' }, row.date.label.toUpperCase()),
            React.createElement('h3', { className: 'rcard-name' }, row.name),
            React.createElement('div', { className: 'rcard-stars' },
              React.createElement(Stars, { value: row.avg, size: 18, gap: 3 })
            ),
            React.createElement('div', { className: 'rcard-members' },
              MEMBERS.map(m => React.createElement('div', { key: m, className: 'rcard-member' },
                React.createElement(MemberDot, { name: m, value: row.ratings[m] }),
                React.createElement('span', { className: 'rcard-member-name', style: { color: MEMBER_COLOR[m] } }, m)
              ))
            ),
            row.notes && React.createElement('div', { className: 'rcard-note' },
              React.createElement('span', { className: 'rcard-note-mark' }, '“'),
              row.notes
            )
          )
        )
  );
}

function CancelledCard({ row }) {
  return React.createElement('div', { className: 'cancelled-card' },
    React.createElement('div', { className: 'cancelled-stamp' }, 'CANCELLED'),
    React.createElement('div', { className: 'cancelled-month' }, row.date.label),
    React.createElement('div', { className: 'cancelled-sub' }, 'no supper. no scores. just calendars.')
  );
}

// ============================================================
// LEADERBOARDS — tab switcher
// ============================================================
function Leaderboards() {
  const boards = useMemo(() => {
    const byAvg = VISITED.filter(r => r.avg != null);
    const top5 = [...byAvg].sort((a,b)=>b.avg-a.avg).slice(0,5);
    const bot5 = [...byAvg].sort((a,b)=>a.avg-b.avg).slice(0,5);
    const divided = [...byAvg].sort((a,b)=>b.spread-a.spread).slice(0,5);
    const consistent = [...byAvg].filter(r => Object.values(r.ratings).filter(v=>v!=null).length >= 3).sort((a,b)=>a.spread-b.spread).slice(0,5);
    const memberBoards = MEMBERS.map(m => ({ key: m, title: `Top 5 · ${m}`, rows: window.SC.topByMember(m, 5), member: m }));
    return [
      { key: 'top', title: 'Top 5 overall', rows: top5, color: '#f1b740' },
      { key: 'bot', title: 'Bottom 5 overall', rows: bot5, color: '#e8693a' },
      { key: 'div', title: 'Most divided', rows: divided, color: '#a47cf0', subtitle: 'Biggest spread between highest and lowest rating' },
      { key: 'con', title: 'Most consistent', rows: consistent, color: '#3fb98a', subtitle: 'Everyone basically agreed' },
      ...memberBoards,
    ];
  }, []);
  const [tab, setTab] = useState('top');
  const active = boards.find(b => b.key === tab);

  return React.createElement('div', null,
    React.createElement('div', { className: 'lb-tabs' },
      boards.map(b => React.createElement('button', {
        key: b.key, className: 'lb-tab', 'data-active': tab === b.key ? '1' : '0',
        onClick: () => setTab(b.key),
        style: tab === b.key ? { background: b.color || MEMBER_COLOR[b.member] || '#f1b740', color: '#1a1410' } : undefined,
      }, b.title))
    ),
    active.subtitle && React.createElement('div', { className: 'lb-sub' }, active.subtitle),
    React.createElement('ol', { className: 'lb-list' },
      active.rows.map((r, i) => React.createElement(LbRow, { key: r.id, rank: i+1, row: r, member: active.member, accent: active.color || MEMBER_COLOR[active.member] }))
    )
  );
}

function LbRow({ rank, row, member, accent }) {
  const score = member ? row.ratings[member] : row.avg;
  return React.createElement('li', { className: 'lb-row' },
    React.createElement('div', { className: 'lb-rank', style: { color: accent } }, String(rank).padStart(2, '0')),
    React.createElement('div', { className: 'lb-thumb' },
      row.image
        ? React.createElement('img', { src: row.image, alt: '', loading: 'lazy' })
        : React.createElement('div', { className: 'lb-thumb-empty' })
    ),
    React.createElement('div', { className: 'lb-info' },
      React.createElement('div', { className: 'lb-name' }, row.name),
      React.createElement('div', { className: 'lb-meta' }, row.date.label)
    ),
    React.createElement('div', { className: 'lb-score' },
      member
        ? React.createElement(MemberDot, { name: member, value: score, size: 42 })
        : React.createElement(AvgPill, { value: score, size: 'lg' })
    )
  );
}

// ============================================================
// TIMELINE — year columns, month dots, cancelled = X
// ============================================================
function Timeline() {
  const sorted = useMemo(() => [...ALL].sort((a,b)=>(a.date.y-b.date.y)||(a.date.m-b.date.m)||(a.date.d-b.date.d)), []);
  const repeats = useMemo(() => {
    const counts = {};
    VISITED.forEach(r => counts[r.canonical] = (counts[r.canonical]||0)+1);
    return new Set(Object.entries(counts).filter(([_,c]) => c > 1).map(([n]) => n));
  }, []);
  const years = useMemo(() => [...new Set(sorted.map(r => r.date.y))].sort(), [sorted]);

  return React.createElement('div', { className: 'tl-scroll' },
    React.createElement('div', { className: 'tl-track' },
      years.map(y => React.createElement('div', { key: y, className: 'tl-year' },
        React.createElement('div', { className: 'tl-year-label' }, y),
        React.createElement('div', { className: 'tl-months' },
          Array.from({length: 12}, (_, i) => i+1).map(m => {
            const events = sorted.filter(r => r.date.y === y && r.date.m === m);
            return React.createElement(TimelineCell, { key: m, year: y, month: m, events, repeats });
          })
        )
      ))
    )
  );
}

function TimelineCell({ year, month, events, repeats }) {
  const monthName = new Date(year, month-1, 1).toLocaleString('en-US', { month: 'short' });
  if (events.length === 0) {
    return React.createElement('div', { className: 'tl-cell tl-empty' },
      React.createElement('div', { className: 'tl-month' }, monthName)
    );
  }
  const ev = events[0];
  if (ev.status === 'Cancelled') {
    return React.createElement('div', { className: 'tl-cell tl-cancelled' },
      React.createElement('div', { className: 'tl-month' }, monthName),
      React.createElement('div', { className: 'tl-x' }, '✕'),
      React.createElement('div', { className: 'tl-cancel-label' }, 'cancelled')
    );
  }
  const isRepeat = repeats.has(ev.canonical);
  return React.createElement('div', { className: 'tl-cell tl-visit' },
    React.createElement('div', { className: 'tl-month' }, monthName),
    ev.image
      ? React.createElement('img', { src: ev.image, className: 'tl-img', alt: '' })
      : React.createElement('div', { className: 'tl-img tl-img-empty' }, '✺'),
    React.createElement('div', { className: 'tl-rname' }, ev.name),
    React.createElement('div', { className: 'tl-rscore' }, ev.avg != null ? ev.avg.toFixed(1) : '—'),
    isRepeat && React.createElement('div', { className: 'tl-repeat-pin' }, '↻')
  );
}

// ============================================================
// MEMBER COMPARISON
// ============================================================
function MemberSection() {
  const stats = useMemo(() => MEMBERS.map(m => window.SC.memberStats(m)), []);
  const toughest = [...stats].sort((a,b)=>a.avg-b.avg)[0];
  const generous = [...stats].sort((a,b)=>b.avg-a.avg)[0];
  const maxAvg = Math.max(...stats.map(s => s.avg));

  return React.createElement('div', null,
    React.createElement('div', { className: 'mc-honors' },
      React.createElement('div', { className: 'mc-honor', style: { borderColor: MEMBER_COLOR[toughest.member] } },
        React.createElement('div', { className: 'mc-honor-tag' }, '🔪 toughest critic'),
        React.createElement('div', { className: 'mc-honor-name', style: { color: MEMBER_COLOR[toughest.member] } }, toughest.member),
        React.createElement('div', { className: 'mc-honor-stat' }, `${toughest.avg.toFixed(2)} avg`)
      ),
      React.createElement('div', { className: 'mc-honor', style: { borderColor: MEMBER_COLOR[generous.member] } },
        React.createElement('div', { className: 'mc-honor-tag' }, '💝 most generous'),
        React.createElement('div', { className: 'mc-honor-name', style: { color: MEMBER_COLOR[generous.member] } }, generous.member),
        React.createElement('div', { className: 'mc-honor-stat' }, `${generous.avg.toFixed(2)} avg`)
      )
    ),
    React.createElement('div', { className: 'mc-cards' },
      stats.map(s => React.createElement(MemberCard, { key: s.member, stats: s, maxAvg }))
    )
  );
}

function MemberCard({ stats, maxAvg }) {
  const c = MEMBER_COLOR[stats.member];
  const pct = (stats.avg / 5) * 100;
  const fav = [...stats.rows].sort((a,b)=>b.ratings[stats.member]-a.ratings[stats.member])[0];
  const least = [...stats.rows].sort((a,b)=>a.ratings[stats.member]-b.ratings[stats.member])[0];
  return React.createElement('div', { className: 'mc-card', style: { borderColor: c } },
    React.createElement('div', { className: 'mc-card-head' },
      React.createElement('div', { className: 'mc-avatar', style: { background: c } }, stats.member[0]),
      React.createElement('div', null,
        React.createElement('div', { className: 'mc-card-name', style: { color: c } }, stats.member),
        React.createElement('div', { className: 'mc-card-sub' }, `${stats.count} suppers rated`)
      ),
      React.createElement('div', { className: 'mc-bigavg' },
        stats.avg.toFixed(2),
        React.createElement('span', { className: 'mc-bigavg-s' }, '/5')
      )
    ),
    React.createElement('div', { className: 'mc-bar-wrap' },
      React.createElement('div', { className: 'mc-bar', style: { width: `${pct}%`, background: c } })
    ),
    React.createElement('div', { className: 'mc-mini' },
      React.createElement('div', { className: 'mc-mini-cell' },
        React.createElement('div', { className: 'mc-mini-lbl' }, '↑ highest'),
        React.createElement('div', { className: 'mc-mini-val' }, stats.max),
        React.createElement('div', { className: 'mc-mini-rest' }, fav.name)
      ),
      React.createElement('div', { className: 'mc-mini-cell' },
        React.createElement('div', { className: 'mc-mini-lbl' }, '↓ lowest'),
        React.createElement('div', { className: 'mc-mini-val' }, stats.min),
        React.createElement('div', { className: 'mc-mini-rest' }, least.name)
      )
    )
  );
}

// ============================================================
// REPEATS
// ============================================================
function RepeatsSection() {
  const groups = useMemo(() => window.SC.repeatGroups(), []);
  return React.createElement('div', { className: 'rep-stack' },
    groups.map(g => React.createElement(RepeatCard, { key: g.name, group: g }))
  );
}

function RepeatCard({ group }) {
  const valid = group.visits.filter(v => v.avg != null);
  const first = valid[0], last = valid[valid.length-1];
  const delta = valid.length > 1 ? last.avg - first.avg : 0;
  const trendUp = delta > 0;
  return React.createElement('div', { className: 'rep-card' },
    React.createElement('div', { className: 'rep-head' },
      React.createElement('h4', { className: 'rep-name' }, group.name),
      React.createElement('div', { className: 'rep-count' }, `${group.visits.length} visits`)
    ),
    valid.length > 1 && React.createElement('div', { className: 'rep-trend', 'data-up': trendUp ? '1' : '0' },
      React.createElement('span', { className: 'rep-trend-arrow' }, trendUp ? '↗' : (delta < 0 ? '↘' : '→')),
      React.createElement('span', null, `${first.avg.toFixed(2)} → ${last.avg.toFixed(2)}`),
      React.createElement('span', { className: 'rep-trend-delta' }, `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}`)
    ),
    React.createElement('div', { className: 'rep-track' },
      group.visits.map((v, i) => React.createElement('div', { key: v.id, className: 'rep-visit' },
        React.createElement('div', { className: 'rep-visit-thumb' },
          v.image
            ? React.createElement('img', { src: v.image, alt: '' })
            : React.createElement('div', { className: 'rep-visit-empty' }, '✺')
        ),
        React.createElement('div', { className: 'rep-visit-meta' },
          React.createElement('div', { className: 'rep-visit-date' }, `${v.date.label}`),
          React.createElement('div', { className: 'rep-visit-name' }, v.name),
          React.createElement(AvgPill, { value: v.avg })
        ),
        i < group.visits.length - 1 && React.createElement('div', { className: 'rep-arrow' }, '→')
      ))
    )
  );
}

// ============================================================
// GALLERY
// ============================================================
function Gallery({ onOpen }) {
  return React.createElement('div', { className: 'gallery' },
    VISITED.map(r => React.createElement('div', { key: r.id, className: 'gal-tile', onClick: () => onOpen && onOpen(r) },
      React.createElement(PhotoTile, { row: r }),
      React.createElement('div', { className: 'gal-cap' },
        React.createElement('div', { className: 'gal-cap-name' }, r.name),
        React.createElement('div', { className: 'gal-cap-date' }, r.date.label)
      )
    ))
  );
}

// ============================================================
// DETAIL OVERLAY
// ============================================================
function Detail({ row, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  if (!row) return null;
  return React.createElement('div', { className: 'detail-bd', onClick: onClose },
    React.createElement('div', { className: 'detail-card', onClick: e => e.stopPropagation() },
      React.createElement('button', { className: 'detail-close', onClick: onClose }, '×'),
      React.createElement('div', { className: 'detail-photo' },
        row.image
          ? React.createElement('img', { src: row.image, alt: row.name })
          : React.createElement(PhotoPlaceholder, { name: row.name })
      ),
      React.createElement('div', { className: 'detail-body' },
        React.createElement('div', { className: 'detail-date' }, row.date.label.toUpperCase()),
        React.createElement('h2', { className: 'detail-name' }, row.name),
        React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' } },
          React.createElement(AvgPill, { value: row.avg, size: 'lg' }),
          React.createElement(Stars, { value: row.avg, size: 20 })
        ),
        React.createElement('div', { className: 'detail-grid' },
          MEMBERS.map(m => React.createElement('div', { key: m, className: 'detail-mrow' },
            React.createElement(MemberDot, { name: m, value: row.ratings[m], size: 44 }),
            React.createElement('div', { style: { flex: 1, marginLeft: 12 } },
              React.createElement('div', { style: { color: MEMBER_COLOR[m], fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14 } }, m),
              React.createElement(Stars, { value: row.ratings[m], size: 14 })
            )
          ))
        ),
        row.notes && React.createElement('div', { className: 'detail-note' },
          React.createElement('div', { className: 'detail-note-lbl' }, 'CLUB NOTES'),
          row.notes
        )
      )
    )
  );
}

// ============================================================
// SECTION NAV
// ============================================================
const SECTIONS = [
  { id: 'feed', label: 'Feed' },
  { id: 'boards', label: 'Boards' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'members', label: 'Members' },
  { id: 'repeats', label: 'Repeats' },
  { id: 'gallery', label: 'Gallery' },
];

function SectionNav({ active, onJump }) {
  return React.createElement('nav', { className: 'snav' },
    SECTIONS.map(s => React.createElement('button', {
      key: s.id, className: 'snav-btn', 'data-active': active === s.id ? '1' : '0',
      onClick: () => onJump(s.id),
    }, s.label))
  );
}

// ============================================================
// APP
// ============================================================
function App() {
  const [filters, setFilters] = useState({
    year: 'all', status: 'all', member: 'all', restaurant: 'all',
    minAvg: 0, hasPhoto: false, repeats: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [active, setActive] = useState('feed');
  const [openRow, setOpenRow] = useState(null);

  const repeatNames = useMemo(() => {
    const counts = {};
    VISITED.forEach(r => counts[r.canonical] = (counts[r.canonical]||0)+1);
    return new Set(Object.entries(counts).filter(([_,c]) => c > 1).map(([n]) => n));
  }, []);

  const feedRows = useMemo(() => {
    const sorted = [...ALL].sort((a,b)=>(b.date.y-a.date.y)||(b.date.m-a.date.m)||(b.date.d-a.date.d));
    return filterRows(sorted, filters, repeatNames);
  }, [filters, repeatNames]);

  // Section spy
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) setActive(e.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const activeFilterCount =
    (filters.year !== 'all' ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.member !== 'all' ? 1 : 0) +
    (filters.restaurant !== 'all' ? 1 : 0) +
    (filters.minAvg > 0 ? 1 : 0) +
    (filters.hasPhoto ? 1 : 0) +
    (filters.repeats ? 1 : 0);

  return React.createElement('div', { className: 'shell' },
    React.createElement(SectionNav, { active, onJump: jump }),
    React.createElement(Hero, null),
    React.createElement('section', { id: 'feed', className: 'section' },
      React.createElement('div', { className: 'section-head-row' },
        React.createElement(SectionHeader, { kicker: '01 · The feed', title: 'Every supper, newest first', hint: 'Tap a card for the full breakdown. Cancelled months still show — pretend they didn\'t happen, or don\'t.' }),
        React.createElement('button', { className: 'filter-btn', onClick: () => setShowFilters(s => !s) },
          '⚙ Filter',
          activeFilterCount > 0 && React.createElement('span', { className: 'filter-count' }, activeFilterCount)
        )
      ),
      showFilters && React.createElement(Filters, { value: filters, onChange: setFilters }),
      React.createElement('div', { className: 'feed-meta' }, `${feedRows.length} of ${ALL.length} showing`),
      React.createElement(Feed, { rows: feedRows, repeatNames, onOpen: setOpenRow })
    ),
    React.createElement('section', { id: 'boards', className: 'section dark' },
      React.createElement(SectionHeader, { kicker: '02 · Leaderboards', title: 'Who ate best and who got snubbed', hint: 'Swipe through the boards. Each member also gets their own top-5.' }),
      React.createElement(Leaderboards, null)
    ),
    React.createElement('section', { id: 'timeline', className: 'section' },
      React.createElement(SectionHeader, { kicker: '03 · Timeline', title: 'Months as we lived them', hint: 'Cancelled months get an X. Repeats wear a little ↻ pin. Scroll →' }),
      React.createElement(Timeline, null)
    ),
    React.createElement('section', { id: 'members', className: 'section dark' },
      React.createElement(SectionHeader, { kicker: '04 · The Five', title: 'Each appetite, audited', hint: 'Average, range, and the dishes they loved or loathed most.' }),
      React.createElement(MemberSection, null)
    ),
    React.createElement('section', { id: 'repeats', className: 'section' },
      React.createElement(SectionHeader, { kicker: '05 · Comebacks', title: 'Restaurants we went back to', hint: 'Did the second visit beat the first?' }),
      React.createElement(RepeatsSection, null)
    ),
    React.createElement('section', { id: 'gallery', className: 'section dark' },
      React.createElement(SectionHeader, { kicker: '06 · Yearbook', title: 'The whole roll, one wall', hint: 'A wall of selfies. Tap any tile.' }),
      React.createElement(Gallery, { onOpen: setOpenRow })
    ),
    React.createElement('footer', { className: 'footer' },
      React.createElement('div', { className: 'footer-rule' }),
      React.createElement('div', { className: 'footer-title' }, 'Monthly · Supper · Club'),
      React.createElement('div', { className: 'footer-sub' }, 'a private dining society, est. October 2022'),
      React.createElement('div', { className: 'footer-meta' }, 'data lives in supper-data.js · drop new photos in /photos · everything updates from the CSV')
    ),
    openRow && React.createElement(Detail, { row: openRow, onClose: () => setOpenRow(null) })
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
