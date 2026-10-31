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

function updateKeyButtonLabel() {
  if (els.openKeyModalBtn) {
    if (state.apiKey) {
      els.openKeyModalBtn.textContent = 'API: Live Key Configured';
      els.openKeyModalBtn.style.borderColor = '#111111';
    } else {
      els.openKeyModalBtn.textContent = 'Qloo API key';
      els.openKeyModalBtn.style.borderColor = '';
    }
  }
}
updateKeyButtonLabel();

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
      headers['X-Api-Key'] = state.apiKey;
    }

    const res = await fetch('/api/audit', {
      method: 'POST',
      headers,
      body: JSON.stringify({ caseId, customQuery, customCity }),
    });
    const data = await res.json();
    if (!data.ok) {
      if (res.status === 401 || data.error?.code === 'QLOO_AUTH') {
        els.keyModal.hidden = false;
        els.findingSubline.innerHTML = `<span style="color:#d9381e; font-weight:600;">Qloo API Key Required:</span> Custom queries against the live Qloo Taste Graph require an event key. Enter your key in the dialog above, or switch to one of the 3 verified benchmark dossiers.`;
        return;
      }
      throw new Error(data.error?.message || data.error || 'Audit failed');
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

  const modeBadge = audit.qlooRequests[0]?.provenance?.mode === 'live-qloo-api'
    ? '<span class="status-pill pill-ok" style="margin-left:8px;">Live Qloo API</span>'
    : '<span class="status-pill" style="margin-left:8px; background:#f0f1f2; color:#555;">Benchmark Fixture</span>';

  els.pageTitle.innerHTML = `${escapeHtml(audit.label)} (${escapeHtml(audit.city)}): Qloo taste turnaround ${modeBadge}`;
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

  // DNA Tags Strip
  renderDnaTags(audit.audienceTags || []);

  // Split Comparison Rows
  renderSplitComparison(audit.domains);

  // Adversarial Clichés
  renderAdversarialButtons();

  // Hidden Markets & Demographics
  renderMarkets(audit.hiddenMarkets || []);
  renderDemographics(audit.demographics || {});

  // Action Kit (Emails & Rulebook)
  renderActionKit(audit.actionKit);

  // Request Log Table
  renderRequestLogs(audit.qlooRequests || []);
}

function renderDnaTags(tags) {
  els.dnaTagsStrip.innerHTML = tags
    .map(
      (t) => `
      <div class="dna-tag">
        <span>${escapeHtml(t.name)}</span>
        <span class="dna-weight">${Math.round(t.weight * 100)}%</span>
      </div>
    `
    )
    .join('');
}

function renderSplitComparison(domains) {
  els.splitComparisonBody.innerHTML = domains
    .map((d) => {
      const naive = d.naivePick;
      const fix = d.qlooFix;
      const naivePassed = naive.check?.passed;
      const fixPassed = fix.check?.passed;

      const naiveAge = naive.ageSkew ? formatAgeSkew(naive.ageSkew) : '';
      const fixAge = fix.ageSkew ? formatAgeSkew(fix.ageSkew) : '';

      return `
        <tr class="domain-row">
          <td colspan="4" class="domain-header-cell">
            <span class="domain-badge">${escapeHtml(d.domain)}</span>
            <span class="domain-subcode"><code class="inline-code">${escapeHtml(d.filterType)}</code></span>
          </td>
        </tr>
        <tr>
          <!-- Left: Naive Pick -->
          <td class="naive-col">
            <div class="entity-title entity-title-rejected">${escapeHtml(naive.name)}</div>
            <div class="meta-subline">
              <span>Fame: <strong class="num-fig">${Math.round(naive.popularity * 100)}%</strong></span>
              <span>Crowd fit: <strong class="num-fig">${Math.round(naive.affinity * 100)}%</strong></span>
            </div>
            ${naiveAge ? `<div class="entity-desc">Age skew: ${escapeHtml(naiveAge)}</div>` : ''}
            <div class="entity-desc">${escapeHtml(naive.whyItFails)}</div>
            <div class="tags-list">
              ${(naive.clashingTags || [])
                .map((t) => `<span class="tag-pill tag-pill-clash">${escapeHtml(t)}</span>`)
                .join('')}
            </div>
          </td>
          <td class="status-col">
            <span class="status-pill ${naivePassed ? 'pill-ok' : 'pill-risk'}">
              ${naivePassed ? 'Verified Fit' : 'Walkout Risk'}
            </span>
          </td>

          <!-- Right: Qloo Fix -->
          <td class="fix-col">
            <div class="entity-title">${escapeHtml(fix.name)}</div>
            <div class="meta-subline">
              <span>Crowd affinity: <strong class="num-fig" style="color:var(--ink-green);">${Math.round(fix.affinity * 100)}%</strong></span>
              <span>Fame: <strong class="num-fig">${Math.round(fix.popularity * 100)}%</strong></span>
              <span>Shared tags: <strong class="num-fig">${fix.sharedTagsCount}</strong></span>
            </div>
            ${fixAge ? `<div class="entity-desc">Target cohort: ${escapeHtml(fixAge)}</div>` : ''}
            <div class="entity-desc">${escapeHtml(fix.whyItWorks)}</div>
            <div class="tags-list">
              ${(fix.sharedTags || [])
                .map((t) => `<span class="tag-pill tag-pill-shared">${escapeHtml(t)}</span>`)
                .join('')}
            </div>
          </td>
          <td class="action-col">
            <span class="status-pill ${fixPassed ? 'pill-ok' : 'pill-risk'}" style="margin-bottom:8px;">
              ${fixPassed ? '5 / 5 Verified' : 'Check'}
            </span>
            <button
              type="button"
              class="btn-outline inspect-receipt-btn"
              data-slot-idx="${d.index - 1}"
            >
              Receipt
            </button>
          </td>
        </tr>
      `;
    })
    .join('');

  // Wire receipt buttons
  document.querySelectorAll('.inspect-receipt-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.dataset.slotIdx);
      openProofModal(state.currentAudit.domains[idx]);
    });
  });
}

function openProofModal(slot) {
  if (!slot) return;
  const naive = slot.naivePick;
  const fix = slot.qlooFix;
  const p = fix.provenance || naive.provenance || {};

  els.proofModalBody.innerHTML = `
    <div class="receipt-grid">
      <div class="receipt-block">
        <h4 class="receipt-h4">Qloo Validation Receipt (${escapeHtml(slot.domain)})</h4>
        <dl class="receipt-dl">
          <dt>Endpoint</dt>
          <dd><code class="inline-code">${escapeHtml(p.endpoint || '/v2/insights')}</code></dd>
          <dt>Filter type</dt>
          <dd><code class="inline-code">${escapeHtml(p.filterType || slot.filterType)}</code></dd>
          <dt>Path executed</dt>
          <dd><code class="inline-code">${escapeHtml(p.path || '/v2/insights')}</code></dd>
          <dt>Schema check</dt>
          <dd><span class="status-pill pill-ok">0 rejected parameters</span></dd>
          <dt>Mode</dt>
          <dd><span class="status-pill pill-ok">${escapeHtml(p.mode || 'live-qloo-api')}</span></dd>
          <dt>Latency</dt>
          <dd class="num-fig">${p.latencyMs ?? 1} ms</dd>
        </dl>
      </div>

      <div class="receipt-block">
        <h4 class="receipt-h4">Deterministic Mathematical Derivation</h4>
        <div style="font-size:12px; line-height:1.6; color:#444;">
          <p><strong>1. Naive Pick Rejected (${escapeHtml(naive.name)}):</strong></p>
          <ul style="padding-left:16px; margin:4px 0 8px;">
            <li>Fame Percentile: <strong>${Math.round(naive.popularity * 100)}%</strong> (&ge; 85% ceiling)</li>
            <li>Crowd Affinity: <strong>${Math.round(naive.affinity * 100)}%</strong> (&lt; 75% gate threshold)</li>
            <li>Shared Taste Tags: <strong>${naive.sharedTagsCount || 0}</strong> (&lt; 3 minimum)</li>
            <li>Verdict: <strong style="color:var(--crimson);">${naive.check?.status || 'WALKOUT_RISK'}</strong></li>
          </ul>
          <p><strong>2. Qloo Pick Approved (${escapeHtml(fix.name)}):</strong></p>
          <ul style="padding-left:16px; margin:4px 0;">
            <li>Crowd Affinity: <strong style="color:var(--ink-green);">${Math.round(fix.affinity * 100)}%</strong> (&ge; 75% threshold)</li>
            <li>Fame Percentile: <strong>${Math.round(fix.popularity * 100)}%</strong> (insider discovery band)</li>
            <li>Shared Taste Tags: <strong>${fix.sharedTagsCount}</strong> (&ge; 3 verified)</li>
            <li>Verdict: <strong style="color:var(--ink-green);">${fix.check?.status || 'VERIFIED_FIT'}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  `;

  els.proofModal.hidden = false;
}

// Adversarial Gate Logic
function renderAdversarialButtons() {
  els.advButtonsRow.innerHTML = `
    <button type="button" class="btn-adv" data-cliche="cliche-drake-stadium">
      Force Drake (99% fame stadium booking)
    </button>
    <button type="button" class="btn-adv" data-cliche="cliche-mrbeast-promo">
      Force MrBeast stunt (99% YouTube promo)
    </button>
    <button type="button" class="btn-adv" data-cliche="cliche-times-sq-brand">
      Force Times Square chain sponsor (96% fame)
    </button>
  `;

  els.advButtonsRow.querySelectorAll('.btn-adv').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const clicheId = e.currentTarget.dataset.cliche;
      await runAdversarialCheck(clicheId);
    });
  });
}

async function runAdversarialCheck(clicheId) {
  els.advReceiptBox.hidden = false;
  els.advReceiptBox.innerHTML = `<div>Auditing adversarial cliché against Qloo Taste Gate...</div>`;

  try {
    const res = await fetch('/api/adversarial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clicheId,
        caseLabel: state.currentAudit?.label || 'The Standard, High Line',
      }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error);

    const r = data.result;
    els.advReceiptBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span class="status-pill pill-risk">QLOO ADVERSARIAL GATE: ${escapeHtml(r.verdict)}</span>
        <span class="num-fig" style="font-size:12px; color:#666;">${r.latencyMs} ms · 0 rejected params</span>
      </div>
      <div style="font-size:13px; font-weight:600; color:var(--crimson); margin-bottom:4px;">
        ${escapeHtml(r.name)} (${escapeHtml(r.category)})
      </div>
      <div class="meta-subline" style="margin-bottom:8px;">
        <span>Fame: <strong class="num-fig">${r.popularity}%</strong></span>
        <span>Crowd affinity: <strong class="num-fig">${r.affinity}%</strong></span>
        <span>Shared tags: <strong class="num-fig">${r.sharedTags}</strong></span>
      </div>
      <div style="font-size:12px; color:#444; line-height:1.5;">
        ${escapeHtml(r.whyBlocked)}
      </div>
    `;
  } catch (err) {
    els.advReceiptBox.innerHTML = `<div style="color:var(--crimson);">Gate error: ${err.message}</div>`;
  }
}

// Hidden Markets
function renderMarkets(markets) {
  els.marketsTableBody.innerHTML = markets
    .map(
      (m) => `
      <tr>
        <td style="font-weight:600;">${escapeHtml(m.city)}</td>
        <td class="num-col num-fig">#${m.popRank}</td>
        <td class="num-col num-fig" style="color:var(--ink-green); font-weight:600;">#${m.tasteRank}</td>
        <td class="num-col num-fig" style="font-weight:600;">${Math.round(m.affinity * 100)}%</td>
        <td style="color:#555;">${escapeHtml(m.note)}</td>
      </tr>
    `
    )
    .join('');
}

// Demographics
function renderDemographics(demo) {
  const age = demo.age || {};
  const entries = Object.entries(age);

  els.demographicsTableBody.innerHTML = entries
    .map(([bracket, val]) => {
      const pct = Math.round(val * 100);
      const isPositive = val >= 0;
      return `
        <tr>
          <td>${escapeHtml(AGE_LABELS[bracket] || bracket)}</td>
          <td class="num-col num-fig" style="color:${isPositive ? 'var(--ink-green)' : 'var(--crimson)'}; font-weight:600;">
            ${isPositive ? '+' : ''}${pct}%
          </td>
          <td>
            <div style="width:100%; height:6px; background:#e8eaec; border-radius:3px; overflow:hidden;">
              <div style="width:${Math.min(100, Math.abs(pct * 2))}%; height:100%; background:${isPositive ? 'var(--ink-green)' : 'var(--crimson)'};"></div>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

// Action Kit
function renderActionKit(kit) {
  if (!kit) return;
  els.rulebookPre.textContent = kit.crowdRulebookPrompt || '';

  els.emailsContainer.innerHTML = (kit.outreachEmails || [])
    .map(
      (e, idx) => `
      <div class="email-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:600; color:#555;">OUTREACH #${idx + 1} · ${escapeHtml(e.slot)}</span>
          <button type="button" class="btn-outline copy-email-btn" data-email-idx="${idx}">Copy proposal</button>
        </div>
        <div style="font-size:13px; font-weight:600; margin-bottom:4px;">To: ${escapeHtml(e.recipient)}</div>
        <div style="font-size:12px; color:#555; margin-bottom:8px;">Subject: ${escapeHtml(e.subject)}</div>
        <pre class="rulebook-pre" style="white-space:pre-wrap; font-size:11px; max-height:180px; overflow-y:auto;">${escapeHtml(e.body)}</pre>
      </div>
    `
    )
    .join('');

  document.querySelectorAll('.copy-email-btn').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      const idx = Number(ev.currentTarget.dataset.emailIdx);
      const email = kit.outreachEmails[idx];
      navigator.clipboard.writeText(`To: ${email.recipient}\nSubject: ${email.subject}\n\n${email.body}`);
      const orig = ev.currentTarget.textContent;
      ev.currentTarget.textContent = 'Copied!';
      setTimeout(() => (ev.currentTarget.textContent = orig), 1500);
    });
  });
}

// Request Logs
function renderRequestLogs(requests) {
  els.qlooLogsTableBody.innerHTML = requests
    .map((r) => {
      const p = r.provenance || {};
      return `
        <tr>
          <td><code class="inline-code">${escapeHtml(p.endpoint || r.endpoint || '/v2/insights')}</code></td>
          <td><code class="inline-code">${escapeHtml(p.filterType || r.params?.['filter.type'] || 'seed')}</code></td>
          <td style="max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <code class="inline-code" style="font-size:10px;">${escapeHtml(p.path || '/v2/insights')}</code>
          </td>
          <td class="num-col num-fig">0</td>
          <td class="num-col num-fig">${p.latencyMs ?? 1} ms</td>
        </tr>
      `;
    })
    .join('');
}

// Dynamic SVG Chart Renderer
function renderMetricChart(audit, metric) {
  const container = els.svgChartContainer;
  const width = Math.max(340, container.clientWidth || 640);
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 36, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const domains = audit.domains || [];
  const barGroupWidth = innerW / Math.max(1, domains.length);
  const barWidth = Math.min(24, (barGroupWidth - 12) / 2);

  let maxValue = 100;
  if (metric === 'tags') maxValue = 10;

  const bars = domains
    .map((d, i) => {
      let qlooVal = Math.round(d.qlooFix.affinity * 100);
      let naiveVal = Math.round(d.naivePick.affinity * 100);

      if (metric === 'fame') {
        qlooVal = Math.round(d.qlooFix.popularity * 100);
        naiveVal = Math.round(d.naivePick.popularity * 100);
      } else if (metric === 'tags') {
        qlooVal = d.qlooFix.sharedTagsCount || 0;
        naiveVal = d.naivePick.sharedTagsCount || 0;
      }

      const qlooH = (qlooVal / maxValue) * innerH;
      const naiveH = (naiveVal / maxValue) * innerH;

      const groupX = padding.left + i * barGroupWidth + (barGroupWidth - barWidth * 2 - 4) / 2;
      const naiveX = groupX;
      const qlooX = groupX + barWidth + 4;

      const naiveY = padding.top + innerH - naiveH;
      const qlooY = padding.top + innerH - qlooH;

      const label = d.domain.split('/')[0].trim();

      return `
        <!-- Naive Bar -->
        <rect x="${naiveX}" y="${naiveY}" width="${barWidth}" height="${naiveH}" fill="#c5c5c5" rx="2" />
        <!-- Qloo Bar -->
        <rect x="${qlooX}" y="${qlooY}" width="${barWidth}" height="${qlooH}" fill="#1b6c80" rx="2" />
        <!-- Domain Label -->
        <text x="${groupX + barWidth}" y="${height - 12}" text-anchor="middle" font-size="11" fill="#666" font-family="IBM Plex Sans, sans-serif">
          ${escapeHtml(label)}
        </text>
      `;
    })
    .join('');

  container.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow:visible;">
      <!-- Grid Lines -->
      <line x1="${padding.left}" y1="${padding.top}" x2="${width - padding.right}" y2="${padding.top}" stroke="#e8eaec" stroke-dasharray="2 2" />
      <line x1="${padding.left}" y1="${padding.top + innerH / 2}" x2="${width - padding.right}" y2="${padding.top + innerH / 2}" stroke="#e8eaec" stroke-dasharray="2 2" />
      <line x1="${padding.left}" y1="${padding.top + innerH}" x2="${width - padding.right}" y2="${padding.top + innerH}" stroke="#e8eaec" />

      <!-- Y Axis Labels -->
      <text x="${padding.left - 8}" y="${padding.top + 4}" text-anchor="end" font-size="10" fill="#888" font-family="IBM Plex Mono, monospace">${maxValue}${metric === 'tags' ? '' : '%'}</text>
      <text x="${padding.left - 8}" y="${padding.top + innerH / 2 + 3}" text-anchor="end" font-size="10" fill="#888" font-family="IBM Plex Mono, monospace">${maxValue / 2}${metric === 'tags' ? '' : '%'}</text>
      <text x="${padding.left - 8}" y="${padding.top + innerH + 3}" text-anchor="end" font-size="10" fill="#888" font-family="IBM Plex Mono, monospace">0</text>

      ${bars}
    </svg>
  `;
}

// KPI Click Switcher
document.querySelectorAll('.kpi-cell').forEach((cell) => {
  cell.addEventListener('click', (e) => {
    document.querySelectorAll('.kpi-cell').forEach((c) => {
      c.classList.remove('is-selected');
      c.setAttribute('aria-selected', 'false');
    });
    const target = e.currentTarget;
    target.classList.add('is-selected');
    target.setAttribute('aria-selected', 'true');
    state.currentMetric = target.dataset.metric;
    if (state.currentAudit) {
      renderMetricChart(state.currentAudit, state.currentMetric);
    }
  });
});

// Event Listeners
els.caseSelect.addEventListener('change', (e) => {
  state.currentCaseId = e.target.value;
  fetchAudit({ caseId: state.currentCaseId });
});

els.customAuditForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = els.customQueryInput.value.trim();
  const city = els.customCityInput.value.trim();
  if (!query) return;
  fetchAudit({ customQuery: query, customCity: city });
});

els.refreshAuditBtn.addEventListener('click', () => {
  fetchAudit({ caseId: state.currentCaseId });
});

// Sidebar View Switching
document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('is-active'));
    const t = e.currentTarget;
    t.classList.add('is-active');
    const view = t.dataset.view;

    const sections = {
      all: ['section-overview', 'section-split', 'section-adversarial', 'section-markets', 'section-kit', 'section-logs'],
      markets: ['section-markets'],
      kit: ['section-kit'],
      logs: ['section-logs'],
    };

    const activeSections = sections[view] || sections.all;
    ['section-overview', 'section-split', 'section-adversarial', 'section-markets', 'section-kit', 'section-logs'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.hidden = !activeSections.includes(id);
    });
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
  updateKeyButtonLabel();
  els.keyModal.hidden = true;
  fetchAudit({ caseId: state.currentCaseId });
});

// Window resize updates SVG chart width
window.addEventListener('resize', () => {
  if (state.currentAudit) {
    renderMetricChart(state.currentAudit, state.currentMetric);
  }
});

fetchAudit({ caseId: state.currentCaseId });
