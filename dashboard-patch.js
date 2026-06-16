/* dashboard-patch.js — loaded after main script: adds Dashboard tab + vote-ordering fix */
(function () {
'use strict';

/* ── CSS ── */
const _s = document.createElement('style');
_s.textContent = `
.dash-page{display:none;padding:16px 0;}
.dash-page.active{display:block;}
.dash-overview{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:24px;}
.dash-stat{background:var(--white);border:1px solid var(--n-200);border-radius:var(--r-lg);padding:16px 18px;}
.dash-stat .ds-label{font-size:10px;color:var(--n-500);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:4px;}
.dash-stat .ds-value{font-family:var(--font-display);font-weight:700;font-size:26px;color:var(--primary);line-height:1.1;display:block;}
.dash-stat .ds-sub{font-size:11px;color:var(--n-400);display:block;margin-top:3px;}
.dash-podium{display:flex;gap:12px;align-items:flex-end;margin-bottom:24px;flex-wrap:wrap;}
.dash-podium-card{background:var(--white);border:2px solid var(--n-200);border-radius:var(--r-xl);padding:18px 14px;text-align:center;min-width:140px;flex:1;max-width:220px;}
.dash-podium-card.p1{border-color:var(--sun-400);background:linear-gradient(160deg,#fffbeb,var(--white) 70%);}
.dash-podium-card.p2{border-color:var(--n-300);}
.dash-podium-card.p3{border-color:#cd7f32;background:linear-gradient(160deg,#fff8f0,var(--white) 70%);}
.podium-medal{font-size:32px;display:block;margin-bottom:6px;}
.podium-name{font-family:var(--font-display);font-weight:700;font-size:13px;line-height:1.3;margin-bottom:3px;}
.podium-prov{font-size:11px;color:var(--n-500);}
.podium-votes{font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--primary);display:block;margin-top:6px;line-height:1;}
.podium-votes-lbl{font-size:10px;color:var(--n-500);}
.dash-section-title{font-family:var(--font-display);font-size:14px;font-weight:600;color:var(--n-500);margin-bottom:12px;margin-top:4px;}
.dash-table-wrap{overflow-x:auto;}
.dash-table{border-collapse:collapse;font-size:13px;width:100%;min-width:680px;}
.dash-table thead th{background:var(--primary);color:#fff;padding:9px 12px;text-align:left;font-weight:600;font-size:11px;font-family:var(--font-mono);letter-spacing:.04em;white-space:nowrap;cursor:pointer;user-select:none;transition:background .15s;}
.dash-table thead th:hover{background:var(--primary-deep);}
.dash-table thead th.sort-asc::after{content:' ▲';opacity:.9;}
.dash-table thead th.sort-desc::after{content:' ▼';opacity:.9;}
.dash-table tbody td{padding:8px 12px;border-bottom:1px solid var(--n-200);vertical-align:middle;}
.dash-table tbody tr:nth-child(odd) td{background:var(--white);}
.dash-table tbody tr:nth-child(even) td{background:var(--n-50);}
.dash-table tbody tr:hover td{background:var(--teal-50);}
.dash-table .td-rank{font-family:var(--font-display);font-weight:700;font-size:15px;text-align:center;color:var(--n-400);min-width:36px;}
.dash-table .td-name{font-family:var(--font-display);font-weight:600;}
.vote-bar{display:flex;align-items:center;gap:6px;min-width:90px;}
.vote-bar-bg{flex:1;height:5px;background:var(--n-100);border-radius:99px;overflow:hidden;}
.vote-bar-fill{height:100%;background:var(--primary);border-radius:99px;}
.vote-bar-num{font-family:var(--font-display);font-weight:700;font-size:13px;color:var(--primary);min-width:18px;text-align:right;}
.date-mini{font-size:10px;background:var(--teal-50);color:var(--teal-800);border:1px solid var(--teal-200);border-radius:99px;padding:1px 5px;white-space:nowrap;display:inline-block;margin:1px;}
`;
document.head.appendChild(_s);

/* ── Inject tab button + page div ── */
document.querySelector('.tab-bar').insertAdjacentHTML('beforeend',
  '<button class="tab" id="tab-dashboard" onclick="switchTab(\'dashboard\')">\u{1F4CA} ภาพรวม</button>'
);
document.getElementById('vote-page').insertAdjacentHTML('afterend',
  '<div class="dash-page" id="dashboard-page"></div>'
);

/* ── Vote fix: in-place update helpers ── */
window.updateVoteSummary = function () {
  const wrap = document.getElementById('vote-rankings-wrap');
  if (!wrap) return;
  const total = Object.values(voteMap).reduce((s, v) => s + v, 0);
  const items = wrap.querySelectorAll('.vs-item b');
  if (items[0]) items[0].textContent = total;
  if (items[1]) items[1].textContent = myVotes.size;
};

window.updateVoteCards = function () {
  const wrap = document.getElementById('vote-rankings-wrap');
  if (!wrap) return;
  const cards = wrap.querySelectorAll('.vote-rank-card');
  if (!cards.length) return;
  const cd = Array.from(cards).map(c => ({ name: c.dataset.name, vc: voteMap[c.dataset.name] || 0 }));
  const srt = [...cd].sort((a, b) => b.vc - a.vc);
  const rm = {}; let cr = 1;
  for (let i = 0; i < srt.length; i++) {
    if (i > 0 && srt[i].vc < srt[i - 1].vc) cr = i + 1;
    rm[srt[i].name] = cr;
  }
  cards.forEach(card => {
    const name = card.dataset.name, vc = voteMap[name] || 0, rank = rm[name], voted = myVotes.has(name);
    const hv = vc > 0;
    const tc = !hv ? '' : rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
    const md = !hv ? rank : rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
    card.className = 'vote-rank-card' + (tc ? ' ' + tc : '');
    const re = card.querySelector('.rank-num'); if (re) re.textContent = md;
    const ne = card.querySelector('.rank-count .num'); if (ne) ne.textContent = vc;
    const be = card.querySelector('.vote-btn');
    if (be) { be.className = 'vote-btn' + (voted ? ' voted' : ''); be.textContent = voted ? '✓ ยกเลิก' : '▲ โหวต'; }
  });
};

/* ── Vote fix: replace toggleVote (no list reorder on vote page) ── */
window.toggleVote = async function (placeName) {
  if (!currentUser) return;
  const wasVoted = myVotes.has(placeName);
  if (wasVoted) { myVotes.delete(placeName); voteMap[placeName] = Math.max((voteMap[placeName] || 1) - 1, 0); }
  else { myVotes.add(placeName); voteMap[placeName] = (voteMap[placeName] || 0) + 1; }
  updateVoteUI(placeName);
  const onVote = document.getElementById('vote-page')?.classList.contains('active');
  if (onVote) { updateVoteSummary(); updateVoteCards(); } else { renderVotePage(); }
  try {
    let res;
    if (wasVoted) {
      res = await sbFetch('/rest/v1/place_votes?place_name=eq.' + encodeURIComponent(placeName) + '&voter_user=eq.' + encodeURIComponent(currentUser.user), { method: 'DELETE' });
    } else {
      res = await sbFetch('/rest/v1/place_votes', { method: 'POST', body: JSON.stringify({ place_name: placeName, voter_user: currentUser.user }) });
    }
    if (!res.ok) throw new Error('status ' + res.status);
  } catch (err) {
    if (wasVoted) { myVotes.add(placeName); voteMap[placeName] = (voteMap[placeName] || 0) + 1; }
    else { myVotes.delete(placeName); voteMap[placeName] = Math.max((voteMap[placeName] || 1) - 1, 0); }
    updateVoteUI(placeName);
    if (onVote) { updateVoteSummary(); updateVoteCards(); } else { renderVotePage(); }
    alert('โหวตไม่สำเร็จ กรุณาลองใหม่');
  }
};

/* ── Vote fix: replace renderVotePage (adds data-name + scroll preserve) ── */
window.renderVotePage = function () {
  const wrap = document.getElementById('vote-rankings-wrap');
  if (!wrap) return;
  if (!allRows.length) {
    wrap.innerHTML = '<div class="vote-loading"><span class="spin">⟳</span> กำลังโหลดข้อมูลที่พัก...</div>';
    return;
  }
  const sorted = [...allRows].sort((a, b) => (voteMap[b.name] || 0) - (voteMap[a.name] || 0));
  const total = Object.values(voteMap).reduce((s, v) => s + v, 0);
  const ranks = []; let curRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && (voteMap[sorted[i].name] || 0) < (voteMap[sorted[i - 1].name] || 0)) curRank = i + 1;
    ranks.push(curRank);
  }
  let html = '<div class="vote-summary"><div class="vs-item"><b>' + total + '</b><span>โหวตทั้งหมด</span></div><div class="vs-item"><b>' + myVotes.size + '</b><span>สถานที่ที่คุณโหวต</span></div><div class="vs-item"><b>' + allRows.length + '</b><span>สถานที่ทั้งหมด</span></div></div><div class="vote-rank-list">';
  sorted.forEach(function (place, i) {
    const rank = ranks[i], vc = voteMap[place.name] || 0, voted = myVotes.has(place.name);
    const hv = vc > 0;
    const tc = !hv ? '' : rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : '';
    const md = !hv ? rank : rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
    html += '<div class="vote-rank-card ' + tc + '" data-name="' + escapeHtml(place.name) + '"><div class="rank-num">' + md + '</div><div class="rank-info"><h3>' + escapeHtml(place.name) + '</h3><div class="rank-sub">📍 ' + escapeHtml(place.province || '') + (place.type ? ' · ' + escapeHtml(place.type) : '') + '</div></div><div class="rank-right"><div class="rank-count"><div class="num">' + vc + '</div><div class="lbl">โหวต</div></div><span class="vote-btn' + (voted ? ' voted' : '') + '" data-name="' + escapeHtml(place.name) + '" onclick="handleVoteClick(event,this.dataset.name)">' + (voted ? '✓ ยกเลิก' : '▲ โหวต') + '</span></div></div>';
  });
  html += '</div>';
  const sy = window.scrollY;
  wrap.innerHTML = html;
  requestAnimationFrame(function () { window.scrollTo(0, sy); });
};

/* ── Tab switch override ── */
const _origSwitchTab = window.switchTab;
window.switchTab = function (tab) {
  if (tab === 'dashboard') {
    ['places', 'price', 'vote'].forEach(function (t) {
      const btn = document.getElementById('tab-' + t);
      if (btn) btn.classList.remove('active');
    });
    document.getElementById('tab-dashboard').classList.add('active');
    document.getElementById('places-page').style.display = 'none';
    document.getElementById('price-page').classList.remove('active');
    document.getElementById('vote-page').classList.remove('active');
    document.getElementById('dashboard-page').classList.add('active');
    renderDashboard();
  } else {
    _origSwitchTab(tab);
    const dp = document.getElementById('dashboard-page');
    const dt = document.getElementById('tab-dashboard');
    if (dp) dp.classList.remove('active');
    if (dt) dt.classList.remove('active');
  }
};

/* ── Dashboard sort state ── */
let _dsc = 'votes', _dsd = -1;

/* ── renderDashboard ── */
window.renderDashboard = function () {
  const wrap = document.getElementById('dashboard-page');
  if (!wrap) return;
  if (!allRows.length) {
    wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--n-500);"><span class="spin">⟳</span> กำลังโหลดข้อมูล...</div>';
    return;
  }

  const totalVotes = Object.values(voteMap).reduce((s, v) => s + v, 0);
  const prices = allRows.map(function (r) { return findPrice(r.name); }).filter(function (p) { return p && p.total > 0; });
  const avg = prices.length ? Math.round(prices.reduce(function (s, p) { return s + p.total; }, 0) / prices.length) : 0;
  const mn = prices.length ? Math.min.apply(null, prices.map(function (p) { return p.total; })) : 0;
  const mx = prices.length ? Math.max.apply(null, prices.map(function (p) { return p.total; })) : 0;
  const provSet = new Set(allRows.map(function (r) { return r.province; }).filter(Boolean));
  const byVote = [...allRows].sort(function (a, b) { return (voteMap[b.name] || 0) - (voteMap[a.name] || 0); });
  const top3 = byVote.slice(0, 3).filter(function (p) { return (voteMap[p.name] || 0) > 0; });

  let rows = allRows.map(function (r) {
    const pr = findPrice(r.name);
    return Object.assign({}, r, {
      votes: voteMap[r.name] || 0,
      price: pr ? pr.total : 0,
      priceRaw: pr ? pr.totalRaw : '',
      voted: myVotes.has(r.name)
    });
  });

  rows.sort(function (a, b) {
    if (_dsc === 'name') return _dsd * a.name.localeCompare(b.name, 'th');
    if (_dsc === 'province') return _dsd * (a.province || '').localeCompare(b.province || '', 'th');
    var va = _dsc === 'capacity' ? (parseFloat(a.capacity) || 0) : _dsc === 'distance' ? (parseFloat(a.distance) || 9999) : (a[_dsc] || 0);
    var vb = _dsc === 'capacity' ? (parseFloat(b.capacity) || 0) : _dsc === 'distance' ? (parseFloat(b.distance) || 9999) : (b[_dsc] || 0);
    return _dsd * (va - vb);
  });

  const maxV = Math.max.apply(null, rows.map(function (r) { return r.votes; }).concat([1]));
  const sc = function (c) { return _dsc === c ? (_dsd === -1 ? 'sort-desc' : 'sort-asc') : ''; };

  let html = '<div class="dash-overview">';
  html += '<div class="dash-stat"><span class="ds-label">สถานที่ทั้งหมด</span><span class="ds-value">' + allRows.length + '</span><span class="ds-sub">' + provSet.size + ' จังหวัด</span></div>';
  html += '<div class="dash-stat"><span class="ds-label">โหวตทั้งหมด</span><span class="ds-value">' + totalVotes + '</span><span class="ds-sub">คุณโหวต ' + myVotes.size + ' แห่ง</span></div>';
  if (avg) html += '<div class="dash-stat"><span class="ds-label">ราคาเฉลี่ย</span><span class="ds-value">฿' + avg.toLocaleString() + '</span><span class="ds-sub">ต่อ ' + GROUP + ' คน</span></div>';
  if (mn && mx) html += '<div class="dash-stat"><span class="ds-label">ช่วงราคา</span><span class="ds-value" style="font-size:18px;">฿' + mn.toLocaleString() + '</span><span class="ds-sub">ถึง ฿' + mx.toLocaleString() + '</span></div>';
  if (byVote[0] && (voteMap[byVote[0].name] || 0) > 0) html += '<div class="dash-stat"><span class="ds-label">ยอดนิยม</span><span class="ds-value" style="font-size:15px;line-height:1.3;">' + escapeHtml(byVote[0].name) + '</span><span class="ds-sub">🗳️ ' + (voteMap[byVote[0].name] || 0) + ' โหวต</span></div>';
  html += '</div>';

  if (top3.length) {
    const po = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3.length === 2 ? [top3[1], top3[0]] : [top3[0]];
    const pm = top3.length >= 3 ? ['🥈', '🥇', '🥉'] : top3.length === 2 ? ['🥈', '🥇'] : ['🥇'];
    const pc = top3.length >= 3 ? ['p2', 'p1', 'p3'] : top3.length === 2 ? ['p2', 'p1'] : ['p1'];
    html += '<div style="margin-bottom:20px;"><div class="dash-section-title">🏆 อันดับสูงสุด</div><div class="dash-podium">';
    po.forEach(function (p, i) {
      const vc = voteMap[p.name] || 0;
      const pr = findPrice(p.name);
      html += '<div class="dash-podium-card ' + pc[i] + '"><span class="podium-medal">' + pm[i] + '</span><div class="podium-name">' + escapeHtml(p.name) + '</div><div class="podium-prov">📍 ' + escapeHtml(p.province || '') + (p.type ? ' · ' + escapeHtml(p.type) : '') + '</div><span class="podium-votes">' + vc + '</span><div class="podium-votes-lbl">โหวต</div>' + (pr && pr.totalRaw ? '<div style="margin-top:5px;font-size:11px;color:var(--n-500);">฿' + escapeHtml(pr.totalRaw) + '</div>' : '') + '</div>';
    });
    html += '</div></div>';
  }

  html += '<div><div class="dash-section-title">📊 ตารางเปรียบเทียบ</div><div class="dash-table-wrap"><table class="dash-table"><thead><tr>';
  html += '<th style="width:42px">#</th>';
  html += '<th data-col="name" class="' + sc('name') + '">ที่พัก</th>';
  html += '<th data-col="province" class="' + sc('province') + '">จังหวัด</th>';
  html += '<th data-col="capacity" class="' + sc('capacity') + '">ความจุ</th>';
  html += '<th data-col="distance" class="' + sc('distance') + '">ระยะทาง</th>';
  html += '<th data-col="price" class="' + sc('price') + '">ราคา</th>';
  html += '<th data-col="votes" class="' + sc('votes') + '">โหวต</th>';
  html += '<th>วันว่าง</th>';
  html += '<th>สิ่งอำนวย</th>';
  html += '</tr></thead><tbody>';

  rows.forEach(function (r, i) {
    const rank = i + 1;
    const vp = Math.round((r.votes / maxV) * 100);
    const med = (r.votes > 0 && _dsc === 'votes' && _dsd === -1 && rank <= 3)
      ? ['🥇', '🥈', '🥉'][rank - 1] : rank;
    const am = (r.accomTypes ? r.accomTypes.length : 0) + (r.activities ? r.activities.length : 0) + (r.food ? r.food.length : 0);
    html += '<tr>';
    html += '<td class="td-rank">' + med + '</td>';
    html += '<td><span class="td-name">' + escapeHtml(r.name) + '</span>' + (r.voted ? ' <span style="color:var(--primary);font-size:11px;" title="คุณโหวตแล้ว">✓</span>' : '') + '</td>';
    html += '<td style="font-size:12px;color:var(--n-500);">' + escapeHtml(r.province || '') + '</td>';
    html += '<td style="text-align:center;font-size:12px;">' + (r.capacity ? escapeHtml(r.capacity) + ' คน' : '-') + '</td>';
    html += '<td style="text-align:center;font-size:12px;">' + (r.distance ? escapeHtml(r.distance) + ' กม.' : '-') + '</td>';
    html += '<td style="text-align:right;font-family:var(--font-display);font-weight:600;font-size:13px;color:var(--primary);">' + (r.priceRaw ? '฿' + escapeHtml(r.priceRaw) : '-') + '</td>';
    html += '<td><div class="vote-bar"><div class="vote-bar-bg"><div class="vote-bar-fill" style="width:' + vp + '%"></div></div><span class="vote-bar-num">' + r.votes + '</span></div></td>';
    html += '<td>' + (r.dates && r.dates.length ? r.dates.map(function (d) { return '<span class="date-mini">' + escapeHtml(d) + '</span>'; }).join('') : '-') + '</td>';
    html += '<td style="text-align:center;font-size:12px;color:var(--n-500);">' + (am > 0 ? am + ' รายการ' : '-') + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table></div></div>';
  wrap.innerHTML = html;

  wrap.querySelectorAll('.dash-table thead th[data-col]').forEach(function (th) {
    th.addEventListener('click', function () {
      const c = th.dataset.col;
      if (_dsc === c) { _dsd *= -1; }
      else { _dsc = c; _dsd = (c === 'name' || c === 'province') ? 1 : -1; }
      renderDashboard();
    });
  });
};

})();
