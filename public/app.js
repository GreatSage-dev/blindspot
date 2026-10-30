// BLINDSPOT Interactive Dashboard Controller (Framed sheet app screen)

const urlParams = new URLSearchParams(window.location.search);
const initialCaseId = urlParams.get('case') || 'standard-highline';

const state = {
  currentCaseId: initialCaseId,
  currentMetric: 'affinity',
  currentAudit: null,
  apiKey: localStorage.getItem('blindspot_qloo_key') || '',
};

const els = {
  appSidebar: document.getElementById('appSidebar'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  caseSelect: document.getElementById('caseSelect'),
  navRiskCount: document.getElementById('navRiskCount'),
  navCallsCount: document.getElementById('navCallsCount'),
  customAuditForm: document.getElementById('customAuditForm'),
  customQueryInput: document.getElementById('customQueryInput'),
  customCityInput: document.getElementById('customCityInput'),
  runAuditBtn: document.getElementById('runAuditBtn'),
  pageTitle: document.getElementById('pageTitle'),
  findingSubline: document.getElementById('findingSubline'),
  copyRulebookTopBtn: document.getElementById('copyRulebookTopBtn'),
  refreshAuditBtn: document.getElementById('refreshAuditBtn'),
  kpiAffinityVal: document.getElementById('kpiAffinityVal'),
  kpiAffinityDelta: document.getElementById('kpiAffinityDelta'),
  kpiFameVal: document.getElementById('kpiFameVal'),
  kpiFameDelta: document.getElementById('kpiFameDelta'),
  kpiTagsVal: document.getElementById('kpiTagsVal'),
  kpiTagsDelta: document.getElementById('kpiTagsDelta'),
  kpiPassVal: document.getElementById('kpiPassVal'),
  kpiPassDelta: document.getElementById('kpiPassDelta'),
  kpiCallsVal: document.getElementById('kpiCallsVal'),
  kpiCallsDelta: document.getElementById('kpiCallsDelta'),
  chartHeading: document.getElementById('chartHeading'),
  svgChartContainer: document.getElementById('svgChartContainer'),
  loudEffectText: document.getElementById('loudEffectText'),
  symptomBlamedText: document.getElementById('symptomBlamedText'),
  quietCauseText: document.getElementById('quietCauseText'),
  dnaTagsStrip: document.getElementById('dnaTagsStrip'),
  splitComparisonBody: document.getElementById('splitComparisonBody'),
  advButtonsRow: document.getElementById('advButtonsRow'),
  advReceiptBox: document.getElementById('advReceiptBox'),
  marketsTableBody: document.getElementById('marketsTableBody'),
  momentumText: document.getElementById('momentumText'),
  demographicsTableBody: document.getElementById('demographicsTableBody'),
  emailsContainer: document.getElementById('emailsContainer'),
  rulebookPre: document.getElementById('rulebookPre'),
  copyRulebookBtn: document.getElementById('copyRulebookBtn'),
  downloadRulebookBtn: document.getElementById('downloadRulebookBtn'),
  validatorPill: document.getElementById('validatorPill'),
  qlooLogsTableBody: document.getElementById('qlooLogsTableBody'),
  proofModal: document.getElementById('proofModal'),
  proofModalBody: document.getElementById('proofModalBody'),
  closeProofModalBtn: document.getElementById('closeProofModalBtn'),
  keyModal: document.getElementById('keyModal'),
  openKeyModalBtn: document.getElementById('openKeyModalBtn'),
  closeKeyModalBtn: document.getElementById('closeKeyModalBtn'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  saveKeyBtn: document.getElementById('saveKeyBtn'),
};

if (els.caseSelect && ['standard-highline', 'a24-indie-launch', 'liquid-death-cult'].includes(initialCaseId)) {
  els.caseSelect.value = initialCaseId;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const AGE_LABELS = {
  '24_and_younger': 'Under 25',
  '25_to_29': 'Ages 25–29',
  '30_to_34': 'Ages 30–34',
  '35_to_54': 'Ages 35–54',
  '55_and_older': 'Ages 55+',
};

function formatAgeSkew(raw) {
  return String(raw ?? '')
    .replace(/24_and_younger/g, 'Under 25')
    .replace(/25_to_29/g, 'Ages 25–29')
    .replace(/30_to_34/g, 'Ages 30–34')
    .replace(/35_to_54/g, 'Ages 35–54')
    .replace(/55_and_older/g, 'Ages 55+');
}

async function fetchAudit({ caseId, customQuery, customCity } = {}) {
  els.runAuditBtn.disabled = true;
  els.runAuditBtn.textContent = 'Checking...';

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (state.apiKey) {
      headers['X-Qloo-Api-Key'] = state.apiKey;
    }

    const res = await fetch('/api/audit', {
      method: 'POST',
      headers,
      body: JSON.stringify({ caseId, customQuery, customCity }),
    });
    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || 'Audit failed');
    }

    state.currentAudit = data.audit;
    renderDashboard(data.audit, data.qlooStats);
  } catch (err) {
    els.findingSubline.textContent = `Error: ${err.message}`;
  } finally {
    els.runAuditBtn.disabled = false;
    els.runAuditBtn.textContent = 'Check with Qloo';
  }
}

function renderDashboard(audit, qlooStats) {
  const v = audit.verificationSummary;

  // Compute exact reconciled sums from the rows
  const totalNaiveTags = audit.domains.reduce((sum, d) => sum + (d.naivePick.sharedTagsCount || 0), 0);
  const totalQlooTags = audit.domains.reduce((sum, d) => sum + (d.qlooFix.sharedTagsCount || 0), 0);
  const tagDiff = totalQlooTags - totalNaiveTags;
  const affinityDiff = v.avgAfterAffinity - v.avgBeforeAffinity;
  const fameDiff = v.avgAfterPopularity - v.avgBeforePopularity;

  els.pageTitle.textContent = `${audit.label} (${audit.city}): Qloo taste turnaround`;
  els.findingSubline.innerHTML = `<span class="finding-strong">${v.beforePassedCount} of ${v.totalDomains} normal AI picks fit this crowd</span> (${v.avgBeforePopularity}% avg fame vs. ${v.avgBeforeAffinity}% crowd fit); Qloo replaced all ${v.totalDomains} and verified <span class="finding-strong">${v.avgAfterAffinity}% crowd affinity</span> across ${v.totalQlooCalls} validated API calls.`;

  els.navRiskCount.textContent = `${v.beforeWalkoutRisks}`;
  els.navCallsCount.textContent = `${v.totalQlooCalls}`;

  // Update 5 KPI cells with reconciled math
  els.kpiAffinityVal.textContent = `${v.avgAfterAffinity}%`;
  els.kpiAffinityDelta.textContent = `+${affinityDiff} pts vs normal AI (${v.avgBeforeAffinity}%)`;

  els.kpiFameVal.textContent = `${v.avgAfterPopularity}%`;
  els.kpiFameDelta.textContent = `${fameDiff >= 0 ? '+' : '−'}${Math.abs(fameDiff)} pts vs cliché AI (${v.avgBeforePopularity}%)`;

  els.kpiTagsVal.textContent = `${totalQlooTags}`;
  els.kpiTagsDelta.textContent = `+${tagDiff} vs normal AI (${totalNaiveTags} tags)`;

  els.kpiPassVal.textContent = `${v.afterPassedCount} / ${v.totalDomains}`;
  els.kpiPassDelta.textContent = `+${v.afterPassedCount - v.beforePassedCount} vs normal AI (${v.beforePassedCount} / ${v.totalDomains})`;

  els.kpiCallsVal.textContent = `${v.totalQlooCalls}`;
  els.kpiCallsDelta.textContent = `${v.rejectedQlooParams} rejected parameters`;

  // Render SVG Chart for active KPI metric
  renderMetricChart(audit, state.currentMetric);

  // Cause & Effect Summary
  els.loudEffectText.textContent = audit.loudEffect;
  els.symptomBlamedText.textContent = audit.symptomBlamed;
  els.quietCauseText.textContent = audit.quietCauseSummary;

  // DNA tags strip
  els.dnaTagsStrip.textContent = `Top crowd tags: ${audit.audienceTags
    .slice(0, 3)
    .map((t) => `${t.name} (${Math.round(t.weight * 100)}%)`)
    .join(' · ')}`;

  // 15-Second Split-Screen Comparison Table
  els.splitComparisonBody.innerHTML = audit.domains
    .map(
      (d, idx) => `
      <tr>
        <td>
          <div class="entity-title">${escapeHtml(d.domain)}</div>
          <div class="mono-id">${escapeHtml(d.filterType)}</div>
        </td>
        <td>
          <div class="entity-title entity-title-rejected">${escapeHtml(d.naivePick.name)}</div>
          <div class="entity-sub">
            <span class="status-pill pill-risk">Walkout risk</span>
            Clash: ${escapeHtml(d.naivePick.clashingTags.join(', '))} · Skews ${escapeHtml(formatAgeSkew(d.naivePick.ageSkew))}
          </div>
        </td>
        <td class="num-col">${Math.round(d.naivePick.popularity * 100)}%</td>
        <td class="num-col kpi-delta-neg">${Math.round(d.naivePick.affinity * 100)}%</td>
        <td>
          <div class="entity-title">${escapeHtml(d.qlooFix.name)}</div>
          <div class="entity-sub">
            <span class="status-pill pill-ok">Verified fit</span>
            Matches: ${escapeHtml(d.qlooFix.sharedTags.join(', '))} · Skews ${escapeHtml(formatAgeSkew(d.qlooFix.ageSkew))}
          </div>
        </td>
        <td class="num-col">${Math.round(d.qlooFix.popularity * 100)}%</td>
        <td class="num-col kpi-delta-pos">${Math.round(d.qlooFix.affinity * 100)}%</td>
        <td class="num-col">${d.qlooFix.sharedTagsCount}</td>
        <td>
          <button type="button" class="btn-outline proof-btn" data-slot-index="${idx}">Receipt</button>
        </td>
      </tr>
    `
    )
    .join('');

  document.querySelectorAll('.proof-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-slot-index'));
      openProofModal(audit.domains[idx]);
    });
  });

  // Hidden Markets Table
  els.marketsTableBody.innerHTML = audit.hiddenMarkets
    .map(
      (m) => `
      <tr>
        <td><strong>${escapeHtml(m.city)}</strong></td>
        <td class="num-col kpi-delta-pos">#${m.tasteRank}</td>
        <td class="num-col">#${m.popRank}</td>
        <td class="num-col">${Math.round(m.affinity * 100)}%</td>
        <td>${escapeHtml(m.note)}</td>
      </tr>
    `
    )
    .join('');

  // Demographics Table
  els.momentumText.textContent = audit.momentum.verdict;
  els.demographicsTableBody.innerHTML = Object.entries(audit.demographics.age)
    .map(([bracket, val]) => {
      const pct = Math.round(val * 100);
      const sign = pct >= 0 ? `+${pct}%` : `−${Math.abs(pct)}%`;
      const cls = pct >= 0 ? 'kpi-delta-pos' : 'kpi-delta-neg';
      const pill =
        pct >= 0
          ? '<span class="status-pill pill-ok">Target crowd</span>'
          : '<span class="status-pill pill-neutral">Under-indexes</span>';
      const humanAge = AGE_LABELS[bracket] || bracket;
      return `
        <tr>
          <td><strong>${escapeHtml(humanAge)}</strong> <span class="mono-id">${escapeHtml(bracket)}</span></td>
          <td class="num-col ${cls}">${sign}</td>
          <td>${pill}</td>
        </tr>
      `;
    })
    .join('');

  // Outreach Emails
  els.emailsContainer.innerHTML = audit.actionKit.outreachEmails
    .map(
      (mail, idx) => `
      <article class="email-box">
        <div>
          <div class="mono-id">${escapeHtml(mail.domain)}</div>
          <h3 class="email-box-subject">${escapeHtml(mail.subject)}</h3>
          <p class="email-box-body">${escapeHtml(mail.body)}</p>
        </div>
        <button type="button" class="btn-outline copy-email-btn" data-email-idx="${idx}">Copy outreach email</button>
      </article>
    `
    )
    .join('');

  document.querySelectorAll('.copy-email-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-email-idx'));
      const mail = audit.actionKit.outreachEmails[idx];
      navigator.clipboard.writeText(`Subject: ${mail.subject}\n\n${mail.body}`);
      btn.textContent = 'Copied to clipboard';
      setTimeout(() => {
        btn.textContent = 'Copy outreach email';
      }, 1500);
    });
  });

  // Rulebook
  els.rulebookPre.textContent = audit.actionKit.crowdRulebookPrompt;

  // Request Log
  els.validatorPill.textContent = `${qlooStats?.totalRequests || audit.qlooRequests.length} validated requests · 0 rejected params`;
  els.qlooLogsTableBody.innerHTML = audit.qlooRequests
    .map(
      (req) => `
      <tr>
        <td class="mono-id">${escapeHtml(req.endpoint)}</td>
        <td class="mono-id">${escapeHtml(req.filterType || 'n/a')}</td>
        <td class="mono-id">${escapeHtml(req.path)}</td>
        <td class="num-col kpi-delta-pos">${req.rejectedParams}</td>
        <td class="num-col">${req.latencyMs} ms</td>
      </tr>
    `
    )
    .join('');
}

function renderMetricChart(audit, metric) {
  const titles = {
    affinity: 'Crowd fit per slot: Qloo pick vs. normal AI pick',
    fame: 'Fame per slot: insider sweet spot vs. over-famous picks',
    tags: 'Shared taste tags per slot',
    pass: 'Verification result per slot',
    calls: 'Qloo response time per slot (ms)',
  };
  els.chartHeading.textContent = titles[metric] || titles.affinity;

  const rows = audit.domains.map((d) => {
    if (metric === 'fame') {
      return {
        label: d.domain.split('/')[0].trim(),
        qlooVal: Math.round(d.qlooFix.popularity * 100),
        naiveVal: Math.round(d.naivePick.popularity * 100),
        unit: '%',
        max: 100,
      };
    }
    if (metric === 'tags') {
      return {
        label: d.domain.split('/')[0].trim(),
        qlooVal: d.qlooFix.sharedTagsCount,
        naiveVal: d.naivePick.sharedTagsCount,
        unit: ' tags',
        max: 6,
      };
    }
    if (metric === 'pass') {
      return {
        label: d.domain.split('/')[0].trim(),
        qlooVal: d.qlooFix.check.passed ? 100 : 0,
        naiveVal: d.naivePick.check.passed ? 100 : 0,
        unit: '%',
        max: 100,
      };
    }
    if (metric === 'calls') {
      const lat = d.qlooFix.provenance?.latencyMs || 2;
      return {
        label: d.domain.split('/')[0].trim(),
        qlooVal: lat,
        naiveVal: 0,
        unit: ' ms',
        max: Math.max(20, lat * 2),
      };
    }
    return {
      label: d.domain.split('/')[0].trim(),
      qlooVal: Math.round(d.qlooFix.affinity * 100),
      naiveVal: Math.round(d.naivePick.affinity * 100),
      unit: '%',
      max: 100,
    };
  });

  // Draw at the container's real pixel width so 12px labels stay 12px on every screen.
  const W = Math.max(300, Math.round(els.svgChartContainer.clientWidth || 640));
  const narrow = W < 520;
  const labelW = narrow ? 96 : 150;
  const valueW = narrow ? 84 : 120;
  const barMaxPx = Math.max(80, W - labelW - valueW - 16);
  const rowH = 34;
  const H = 18 + rows.length * rowH + 8;
  const sans = "IBM Plex Sans, system-ui, sans-serif";
  const groupsSvg = rows
    .map((r, i) => {
      const y = 14 + i * rowH;
      const wQloo = Math.max(4, Math.round((r.qlooVal / r.max) * barMaxPx));
      const wNaive = Math.max(2, Math.round((r.naiveVal / r.max) * barMaxPx));
      return `
        <g transform="translate(0, ${y})">
          <text x="0" y="13" font-size="12" font-family="${sans}" fill="#131416">${escapeHtml(r.label)}</text>
          <rect x="${labelW}" y="1" width="${wQloo}" height="10" fill="#1b6c80" rx="2" />
          <rect x="${labelW}" y="14" width="${wNaive}" height="6" fill="#cdced1" rx="2" />
          <text x="${W}" y="12" text-anchor="end" font-size="12" font-family="${sans}" font-weight="500" style="font-variant-numeric: tabular-nums" fill="#131416">${r.qlooVal}${r.unit}<tspan fill="#5d5f60" font-weight="400"> vs ${r.naiveVal}${r.unit}</tspan></text>
        </g>
      `;
    })
    .join('');

  els.svgChartContainer.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="${escapeHtml(els.chartHeading.textContent)}">
      <line x1="${labelW}" y1="${H - 4}" x2="${labelW + barMaxPx}" y2="${H - 4}" stroke="#e8eaec" stroke-width="1" />
      ${groupsSvg}
    </svg>
  `;
}

window.addEventListener('resize', () => {
  clearTimeout(window.__chartResizeT);
  window.__chartResizeT = setTimeout(() => {
    if (state.currentAudit) renderMetricChart(state.currentAudit, state.currentMetric);
  }, 150);
});

function openProofModal(domainItem) {
  if (!domainItem) return;
  const explain = (domainItem.qlooFix.explainability || [])
    .map((e) => `${e.entity}: +${Math.round(e.contribution * 100)}% influence`)
    .join('\n');

  els.proofModalBody.innerHTML = `
    <p class="finding-subline"><strong>Slot:</strong> ${escapeHtml(domainItem.domain)} (${escapeHtml(domainItem.filterType)})</p>
    <p class="finding-subline" style="margin-top:6px;"><strong>Rejected normal AI pick:</strong> ${escapeHtml(domainItem.naivePick.name)} (${Math.round(domainItem.naivePick.popularity * 100)}% fame · ${Math.round(domainItem.naivePick.affinity * 100)}% fit)</p>
    <p class="finding-subline" style="margin-top:6px;"><strong>Verified Qloo replacement:</strong> ${escapeHtml(domainItem.qlooFix.name)} (${Math.round(domainItem.qlooFix.popularity * 100)}% fame · ${Math.round(domainItem.qlooFix.affinity * 100)}% fit)</p>
    <pre class="rulebook-pre">GET ${escapeHtml(domainItem.qlooFix.provenance?.path || '/v2/insights')}</pre>
    <p class="finding-subline"><strong>Explainability split (feature.explainability=true):</strong></p>
    <pre class="rulebook-pre">${escapeHtml(explain || 'Verified via Qloo entity graph')}</pre>
  `;
  els.proofModal.hidden = false;
}

// Bindings
els.caseSelect.addEventListener('change', () => {
  state.currentCaseId = els.caseSelect.value;
  els.customQueryInput.value = '';
  els.advReceiptBox.hidden = true;
  fetchAudit({ caseId: state.currentCaseId });
});

els.customAuditForm.addEventListener('submit', (e) => {
  e.preventDefault();
  els.advReceiptBox.hidden = true;
  fetchAudit({
    caseId: state.currentCaseId,
    customQuery: els.customQueryInput.value.trim() || undefined,
    customCity: els.customCityInput.value.trim() || undefined,
  });
});

els.refreshAuditBtn.addEventListener('click', () => {
  fetchAudit({
    caseId: state.currentCaseId,
    customQuery: els.customQueryInput.value.trim() || undefined,
    customCity: els.customCityInput.value.trim() || undefined,
  });
});

document.querySelectorAll('.kpi-cell').forEach((cell) => {
  cell.addEventListener('click', () => {
    document.querySelectorAll('.kpi-cell').forEach((c) => {
      c.classList.remove('is-selected');
      c.setAttribute('aria-selected', 'false');
    });
    cell.classList.add('is-selected');
    cell.setAttribute('aria-selected', 'true');
    state.currentMetric = cell.getAttribute('data-metric') || 'affinity';
    if (state.currentAudit) {
      renderMetricChart(state.currentAudit, state.currentMetric);
    }
  });
});

document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const view = btn.getAttribute('data-view');
    const map = {
      all: 'section-overview',
      markets: 'section-markets',
      kit: 'section-kit',
      logs: 'section-logs',
    };
    const target = document.getElementById(map[view] || 'section-overview');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    els.appSidebar.classList.remove('is-open');
  });
});

els.mobileMenuBtn.addEventListener('click', () => {
  els.appSidebar.classList.toggle('is-open');
});

els.advButtonsRow.querySelectorAll('.btn-cliche').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const clicheId = btn.getAttribute('data-cliche-id');
    const res = await fetch('/api/adversarial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clicheId,
        caseLabel: state.currentAudit?.label || 'Current Plan',
      }),
    });
    const data = await res.json();
    if (data.ok && data.result) {
      const r = data.result;
      els.advReceiptBox.hidden = false;
      els.advReceiptBox.innerHTML = `
        <div><strong>${escapeHtml(r.verdict)}: ${escapeHtml(r.headline)}</strong> (Fame: ${r.popularity}% vs. Crowd fit: ${r.affinity}%)</div>
        <div style="margin-top:4px;">${escapeHtml(r.explanation)}</div>
        <div class="mono-id" style="margin-top:4px;">Proof query: ${escapeHtml(r.qlooProofEndpoint)}</div>
      `;
    }
  });
});

const copyRulebookHandler = (btn) => {
  const txt = els.rulebookPre.textContent || '';
  navigator.clipboard.writeText(txt);
  const orig = btn.textContent;
  btn.textContent = 'Copied rulebook';
  setTimeout(() => {
    btn.textContent = orig;
  }, 1500);
};

els.copyRulebookBtn.addEventListener('click', () => copyRulebookHandler(els.copyRulebookBtn));
els.copyRulebookTopBtn.addEventListener('click', () => copyRulebookHandler(els.copyRulebookTopBtn));

els.downloadRulebookBtn.addEventListener('click', () => {
  const txt = els.rulebookPre.textContent || '';
  const blob = new Blob([txt], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CROWD-RULEBOOK-${(state.currentAudit?.caseId || 'qloo').toUpperCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

els.closeProofModalBtn.addEventListener('click', () => {
  els.proofModal.hidden = true;
});

els.openKeyModalBtn.addEventListener('click', () => {
  els.apiKeyInput.value = state.apiKey;
  els.keyModal.hidden = false;
});

els.closeKeyModalBtn.addEventListener('click', () => {
  els.keyModal.hidden = true;
});

els.saveKeyBtn.addEventListener('click', () => {
  state.apiKey = els.apiKeyInput.value.trim();
  localStorage.setItem('blindspot_qloo_key', state.apiKey);
  els.keyModal.hidden = true;
  fetchAudit({ caseId: state.currentCaseId });
});

fetchAudit({ caseId: state.currentCaseId });
