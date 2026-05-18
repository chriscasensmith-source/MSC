/* ============================================================
   MONTHLY SUPPER CLUB — data layer
   ------------------------------------------------------------
   To update: edit the CSV string in RAW_CSV below.
   Columns: Restaurant, Visit Date, Status, Photo, Lottie, Chris,
            Jeni, Christen, Charlie, Avg, Image File Name, Notes
   Drop new photos in /photos and reference their filename.
   ============================================================ */

(function(){
const RAW_CSV = `Restaurant,Visit Date,Status,Photo,Lottie Rating,Chris Rating,Jeni Rating,Christen Rating,Charlie Rating,Avg Rating,Image File Name,Notes
Sachet,10/1/22,Visited,No,1,0.5,1,1,1,0.9,,Pre-official MSC
Au Troisieme,3/18/23,Visited,No,,2.9,3.5,3,3,3.1,,Lottie rating not shown
Bobbie's Airway,7/8/23,Visited,No,2,1.5,2,2,2,1.9,,
Sister,8/12/23,Visited,Yes,2,1.75,2,2,1,1.75,2023-08-12_Sister.jpg,
Uchi,9/9/23,Visited,Yes,5,5,5,5,5,5.0,2023-09-09_Uchi.jpg,"Jeni line showed extra stars, treated as 5 out of 5"
Meridian,10/26/23,Visited,Yes,4,3.5,3,3.5,4,3.6,2023-10-26_Meridian.jpg,
11/2023,11/2023,Cancelled,No,,,,,,,,Cancelled month
Green Point,12/16/23,Visited,Yes,4,4.2,4,4,4,4.04,2023-12-16_Green-Point.jpg,
Quarter Acre,1/13/24,Visited,Yes,,3.5,2,3,3,2.88,2024-01-13_Quarter-Acre.jpg,Lottie rating not shown
2/2024,2/2024,Cancelled,No,,,,,,,,Cancelled month
Barsotti's,3/9/24,Visited,Yes,3,3,3,3,3,3.0,2024-03-09_Barsottis.jpg,
Beverly's,4/6/24,Visited,Yes,2,2.2,2,3,3,2.44,2024-04-06_Beverlys.jpg,
Mot Hai Ba,5/4/24,Visited,Yes,4,3.8,5,3.5,4,4.06,2024-05-04_Mot-Hai-Ba.jpg,
Las Palmas,6/15/24,Visited,Yes,3,2.85,2,1,1,1.97,2024-06-15_Las-Palmas.jpg,
Jack & Harry's,8/10/24,Visited,Yes,3,2.85,4,3,3,3.17,2024-08-10_Jack-and-Harrys.jpg,
9/2024,9/2024,Cancelled,No,,,,,,,,Cancelled month
Goodwin's,10/12/24,Visited,Yes,3,2.75,3,2.5,2,2.65,2024-10-12_Goodwins.jpg,
"Bobbie's, Take 2",11/6/24,Visited,Yes,4,3,3,3.5,5,3.7,2024-11-06_Bobbies-Take-2.jpg,Listed as Bobbie's take ✌️
"Bobbie's, Take 3",12/14/24,Visited,Yes,5,3.89,3.5,4.5,5,4.38,2024-12-14_Bobbies-Take-3.jpg,Listed as Bobbie's take 😎
Goldie's,1/25/25,Visited,Yes,5,4.79,4.5,4,5,4.66,2025-01-25_Goldies.jpg,"Charlie used drooling emojis, treated as 5"
Lucia,2/27/25,Visited,Yes,4,4.56,4,4,4,4.11,2025-02-27_Lucia.jpg,
Claremont,3/27/25,Visited,Yes,3.5,3.41,,3.5,3.5,3.48,2025-03-27_Claremont.jpg,Jeni rating is blank
Even Coast,4/19/25,Visited,Yes,3,3.5,3.5,3,3.5,3.3,2025-04-19_Even-Coast.jpg,
Uchibā,5/3/25,Visited,Yes,3.75,3.71,4,4.15,4,3.92,2025-05-03_Uchiba.jpg,
Catch,6/21/25,Visited,Yes,,3.11,3.5,2.75,2.5,2.97,2025-06-21_Catch.jpg,Lottie rating not shown
"Quarter Acre, Take 2",7/26/25,Visited,Yes,4,4.15,,4,,4.05,2025-07-26_Quarter-Acre-Take-2.jpg,"Jeni has sick emoji, Charlie blank"
Charlie's Bolognese,10/18/25,Visited,Yes,5,5,5,5,4,4.8,2025-10-18_Charlies-Bolognese.jpg,"Homemade or private dinner, but included as supper club entry"
"Meridian, Take 2",11/22/25,Visited,Yes,4.5,4.39,4,3.5,4,4.08,2025-11-22_Meridian-Take-2.jpg,
Montlake Cut,3/14/26,Visited,Yes,3.75,3.9,4,3.5,4,3.83,2026-03-14_Montlake-Cut.jpg,
Mamani,5/9/26,Visited,Yes,4,4.51,4.75,4.6,4.5,4.47,2026-05-09_Mamani.jpg,`;

// ---- tiny CSV parser that handles "quoted, fields" ----
function parseCSV(txt) {
  const rows = [];
  let cur = [], cell = '', q = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (q) {
      if (c === '"' && txt[i+1] === '"') { cell += '"'; i++; }
      else if (c === '"') { q = false; }
      else cell += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { cur.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (cell !== '' || cur.length) { cur.push(cell); rows.push(cur); cur = []; cell = ''; }
        if (c === '\r' && txt[i+1] === '\n') i++;
      } else cell += c;
    }
  }
  if (cell !== '' || cur.length) { cur.push(cell); rows.push(cur); }
  return rows;
}

const MEMBERS = ['Lottie', 'Chris', 'Jeni', 'Christen', 'Charlie'];

const num = (v) => {
  if (v === '' || v == null) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// canonical name for repeat-grouping
function canonicalName(name) {
  if (/^bobbie/i.test(name)) return "Bobbie's";
  return name.replace(/,?\s*Take\s*\d+$/i, '').trim();
}

function parseDate(s, status) {
  // visited rows: M/D/YY; cancelled rows: M/YYYY
  if (status === 'Cancelled') {
    const [m, y] = s.split('/').map(Number);
    return { y, m, d: 1, label: new Date(y, m-1, 1).toLocaleString('en-US', {month:'long', year:'numeric'}), iso: `${y}-${String(m).padStart(2,'0')}` };
  }
  const [m, d, y] = s.split('/').map(Number);
  const yr = y < 100 ? 2000 + y : y;
  return {
    y: yr, m, d,
    label: new Date(yr, m-1, d).toLocaleString('en-US', {month:'short', day:'numeric', year:'numeric'}),
    iso: `${yr}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  };
}

function loadRows() {
  const rows = parseCSV(RAW_CSV.trim());
  const header = rows.shift();
  const out = rows.map((r, i) => {
    const o = {};
    header.forEach((h, j) => o[h] = r[j] ?? '');
    const status = o['Status'];
    const ratings = {
      Lottie: num(o['Lottie Rating']),
      Chris: num(o['Chris Rating']),
      Jeni: num(o['Jeni Rating']),
      Christen: num(o['Christen Rating']),
      Charlie: num(o['Charlie Rating']),
    };
    const valid = Object.values(ratings).filter(v => v != null);
    const avg = valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : null;
    const date = parseDate(o['Visit Date'], status);
    return {
      id: i,
      name: o['Restaurant'],
      canonical: canonicalName(o['Restaurant']),
      date,
      status,
      hasPhoto: o['Photo'] === 'Yes',
      image: o['Image File Name'] ? `photos/${o['Image File Name']}` : null,
      ratings,
      avg,
      spread: valid.length >= 2 ? Math.max(...valid) - Math.min(...valid) : 0,
      notes: o['Notes'] || '',
    };
  });
  return out;
}

const ALL = loadRows();
const VISITED = ALL.filter(r => r.status === 'Visited');
const CANCELLED = ALL.filter(r => r.status === 'Cancelled');

// ---- derived stats ----
function topN(arr, key, n, asc=false) {
  const cleaned = arr.filter(r => r[key] != null);
  const sorted = [...cleaned].sort((a,b) => asc ? a[key]-b[key] : b[key]-a[key]);
  return sorted.slice(0, n);
}
function topByMember(member, n=5) {
  const cleaned = VISITED.filter(r => r.ratings[member] != null);
  return [...cleaned].sort((a,b) => b.ratings[member] - a.ratings[member]).slice(0, n);
}

function memberStats(member) {
  const vals = VISITED.map(r => r.ratings[member]).filter(v => v != null);
  if (!vals.length) return null;
  const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
  return {
    member,
    count: vals.length,
    avg,
    max: Math.max(...vals),
    min: Math.min(...vals),
    rows: VISITED.filter(r => r.ratings[member] != null),
  };
}

function repeatGroups() {
  const groups = {};
  for (const r of VISITED) {
    const k = r.canonical;
    if (!groups[k]) groups[k] = [];
    groups[k].push(r);
  }
  return Object.entries(groups)
    .filter(([_, rs]) => rs.length > 1)
    .map(([name, rs]) => ({
      name,
      visits: rs.sort((a,b) => (a.date.y - b.date.y) || (a.date.m - b.date.m) || (a.date.d - b.date.d)),
    }));
}

// member palette
const MEMBER_COLOR = {
  Lottie: '#f06aa1',   // rose
  Chris: '#5b8def',    // cobalt
  Jeni: '#3fb98a',     // jade
  Christen: '#a47cf0', // violet
  Charlie: '#e8693a',  // tomato
};

const MEMBER_EMOJI = {
  Lottie: 'L',
  Chris: 'C',
  Jeni: 'J',
  Christen: 'Cn',
  Charlie: 'Ch',
};

window.SC = {
  ALL, VISITED, CANCELLED, MEMBERS, MEMBER_COLOR, MEMBER_EMOJI,
  topN, topByMember, memberStats, repeatGroups,
};
})();
