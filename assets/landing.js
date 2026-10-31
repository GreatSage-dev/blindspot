// BLINDSPOT Editorial Landing Page Controller (The printed annual)

const DOSSIER_PREVIEWS = {
  'standard-highline': {
    title: 'The Standard, High Line (New York)',
    meta: 'Hospitality & live venue · Target crowd: under 30',
    badSummary: 'Normal AI plan: 0 / 5 fit the crowd (97% avg fame · 17% crowd fit)',
    goodSummary: 'Blindspot + Qloo: 5 / 5 verified (68% insider fame · 94% crowd fit)',
    quietCause:
      'Loud effect: Under-30 weekend traffic dropped 31% even after cutting cocktail prices 20%. Quiet cause proven by Qloo: Your downtown crowd moved from bottle-service EDM to hi-fi vinyl listening bars, A24 cinema, and botanical aperitivo culture.',
    rows: [
      ['Music / Act', 'David Guetta', 98, 'KAYTRANADA / Men I Trust', '95%'],
      ['Brand Partner', 'Red Bull Vodka Promo', 99, 'Ghia × Mezcal Amarás', '93%'],
      ['Cultural Host', 'Viral Stunt Influencer', 97, 'Dev Hynes / Benny Safdie', '94%'],
      ['Podcast Tie-In', 'Celebrity Tabloid Show', 96, 'Throwing Fits Live Taping', '92%'],
      ['Film Night', 'Blockbuster Trivia', 95, 'Past Lives (35mm Rooftop)', '96%'],
    ],
  },
  'a24-indie-launch': {
    title: 'A24 Film & Merch Launch (Austin)',
    meta: 'Film studio & entertainment · Target crowd: under 30',
    badSummary: 'Normal AI plan: 0 / 5 fit the crowd (96% avg fame · 16% crowd fit)',
    goodSummary: 'Blindspot + Qloo: 5 / 5 verified (68% insider fame · 95% crowd fit)',
    quietCause:
      'Loud effect: Pre-release ticket conversion fell 64% in top population metros despite heavy ad spend. Quiet cause proven by Qloo: Your buyers reject polished studio promos and discover films via Austin/Portland rep cinemas, vinyl stores, and film-criticism podcasts.',
    rows: [
      ['Soundtrack', 'Imagine Dragons', 97, 'Mk.gee × Japanese Breakfast', '96%'],
      ['Merch Collab', 'Fast-Fashion Promo Tees', 96, 'Online Ceramics × Criterion', '95%'],
      ['Premiere Venue', 'Suburban Mall Multiplex', 94, 'Alamo Drafthouse South Lamar', '94%'],
      ['Podcast Partner', 'Morning News Ad Read', 95, 'The Big Picture Deep-Dive', '95%'],
      ['Creator Host', 'TikTok Dance Influencer', 96, 'Hideo Kojima × Sean Baker', '93%'],
    ],
  },
  'liquid-death-cult': {
    title: 'Liquid Death Cult Beverage (Atlanta)',
    meta: 'Consumer brand & retail · Target crowd: under 30',
    badSummary: 'Normal AI plan: 0 / 5 fit the crowd (94% avg fame · 14% crowd fit)',
    goodSummary: 'Blindspot + Qloo: 5 / 5 verified (73% insider fame · 94% crowd fit)',
    quietCause:
      'Loud effect: Automated AI agent spent $45k on yoga/wellness hydration ads and repeat orders dropped 29%. Quiet cause proven by Qloo: Your buyers have 0 overlap with spa/wellness tags, living instead in hardcore punk, comedy clubs, skateparks, and cult horror.',
    rows: [
      ['Tour Partner', 'Adult Acoustic Pop Tour', 98, 'Turnstile Pit Hydration', '96%'],
      ['Talent Partner', 'Luxury Spa Wellness Guru', 94, 'Mark Normand × Kill Tony', '94%'],
      ['Brand Collab', 'Pastel Pilates Bundle', 96, 'Vans Skate × Santa Cruz Deck', '93%'],
      ['Venue Placement', 'Uptown Spa Juice Bar', 91, 'Comedy Mothership & Masquerade', '95%'],
      ['Podcast Read', 'Corporate Routine Show', 92, 'Last Podcast on the Left', '94%'],
    ],
  },
};

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const sheetTitle = document.getElementById('sheetTitle');
const sheetMeta = document.getElementById('sheetMeta');
const sheetOpenAppLink = document.getElementById('sheetOpenAppLink');
const sheetBadBox = document.getElementById('sheetBadBox');
const sheetGoodBox = document.getElementById('sheetGoodBox');
const sheetQuietCause = document.getElementById('sheetQuietCause');
const sheetTableBody = document.getElementById('sheetTableBody');

function renderDossier(id) {
  const data = DOSSIER_PREVIEWS[id];
  if (!data || !sheetTableBody) return;

  sheetTitle.textContent = data.title;
  sheetMeta.textContent = data.meta;
  sheetOpenAppLink.setAttribute('href', `/app?case=${id}`);
  sheetBadBox.textContent = data.badSummary;
  sheetGoodBox.textContent = data.goodSummary;
  sheetQuietCause.textContent = data.quietCause;

  // The famous name is struck through; its fame score sits beside it, unstruck, so the line never wraps mid-strike.
  sheetTableBody.innerHTML = data.rows
    .map(
      ([slot, bad, fame, good, fit]) => `
      <tr>
        <td class="slot-cell">${escapeHtml(slot)}</td>
        <td><span class="strike-bad">${escapeHtml(bad)}</span><span class="fame-tag">${fame}% fame</span></td>
        <td class="match-good">${escapeHtml(good)}</td>
        <td class="num-cell">${escapeHtml(fit)}</td>
      </tr>
    `
    )
    .join('');
}

document.querySelectorAll('.dossier-switch-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dossier-switch-btn').forEach((b) => {
      b.classList.remove('is-selected');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('is-selected');
    btn.setAttribute('aria-selected', 'true');
    renderDossier(btn.getAttribute('data-dossier'));
  });
});

renderDossier('standard-highline');

// Inspector Margin Notes Interaction
document.querySelectorAll('.margin-note-card').forEach((btn) => {
  const activate = () => {
    const partId = btn.getAttribute('data-part');
    document.querySelectorAll('.margin-note-card').forEach((b) => b.classList.remove('is-highlighted'));
    document.querySelectorAll('.plate-row').forEach((p) => p.classList.remove('is-active'));
    btn.classList.add('is-highlighted');
    const target = document.getElementById(partId);
    if (target) target.classList.add('is-active');
  };
  btn.addEventListener('click', activate);
  btn.addEventListener('mouseenter', activate);
});

// Scroll Reveal Choreography (respects prefers-reduced-motion)
if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  const items = Array.from(document.querySelectorAll('.reveal-item'));
  items.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.85) {
      el.classList.add('is-hidden-init');
    } else {
      // Subtle entrance on first-screen elements after the initial paint
      el.style.transform = 'translateY(14px)';
      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.transform = 'translateY(0)';
        }, 60);
      });
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, idx) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.remove('is-hidden-init');
            }, idx * 45);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    items.forEach((el) => {
      if (el.classList.contains('is-hidden-init')) {
        observer.observe(el);
      }
    });

    window.addEventListener(
      'scroll',
      () => {
        if (window.scrollY > 1600) {
          items.forEach((el) => el.classList.remove('is-hidden-init'));
        }
      },
      { passive: true }
    );
  } else {
    items.forEach((el) => el.classList.remove('is-hidden-init'));
  }
}
