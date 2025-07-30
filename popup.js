// Cookie classification database
const cookieDB = {
  'ASP.NET_SessionId': {
    risk: 'low',
    purpose: 'Maintains your login session on the website',
    category: 'Essential'
  },
  'IsLoggedIn': {
    risk: 'low',
    purpose: 'Remembers your login state',
    category: 'Essential'
  },
  '__RequestVerificationToken': {
    risk: 'low',
    purpose: 'Security token that prevents form submission attacks',
    category: 'Security'
  },
  'Language': {
    risk: 'low',
    purpose: 'Stores your language preference',
    category: 'Functional'
  },
  'selectedSport': {
    risk: 'low',
    purpose: 'Remembers your sports betting preferences',
    category: 'Functional'
  },
  'ShowBetslipIcons': {
    risk: 'low',
    purpose: 'Stores UI display preferences',
    category: 'Functional'
  },
  '_ga': { risk: 'high', purpose: 'Google Analytics tracking', category: 'Tracking' },
  '_gid': { risk: 'high', purpose: 'Google Analytics tracking', category: 'Tracking' },
  '_gat': { risk: 'high', purpose: 'Google Analytics throttling', category: 'Tracking' },
  'fb_': { risk: 'high', purpose: 'Facebook tracking', category: 'Tracking' },
  'tr_': { risk: 'high', purpose: 'Common tracking pattern', category: 'Tracking' },
  'ads': { risk: 'high', purpose: 'Advertising-related tracking', category: 'Tracking' }
};

// Classify a cookie based on name
function classifyCookie(cookie) {
  if (cookieDB[cookie.name]) {
    return cookieDB[cookie.name];
  }

  for (const [pattern, info] of Object.entries(cookieDB)) {
    if (cookie.name.includes(pattern)) {
      return info;
    }
  }

  return {
    risk: 'medium',
    purpose: 'Unknown purpose',
    category: 'Unclassified'
  };
}

// Display cookies for current site
async function loadCookies() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const domain = url.hostname;

  document.getElementById("current-site").textContent = domain;
  document.getElementById("cookies-list").innerHTML = '<div class="loading">Scanning cookies...</div>';

  const cookies = await chrome.cookies.getAll({ domain });

  if (cookies.length === 0) {
    document.getElementById("cookies-list").innerHTML = '<p>No cookies found on this site.</p>';
    return;
  }

  let safeCount = 0, mediumCount = 0, riskyCount = 0;
  let cookiesHTML = '';
  let cookieIndex = 1;

  cookies.forEach(cookie => {
    const { risk, purpose, category } = classifyCookie(cookie);

    if (risk === 'low') safeCount++;
    else if (risk === 'medium') mediumCount++;
    else riskyCount++;

    const genericName = `Cookie #${cookieIndex++} (${category})`;

    cookiesHTML += `
      <div class="cookie-item">
        <div class="cookie-header">
          <div class="cookie-risk risk-${risk}"></div>
          <div class="cookie-name">${genericName}</div>
        </div>
        <div class="cookie-domain">Domain: ${cookie.domain}</div>
        <div class="cookie-meta">Type: ${category} • ${risk === 'high' ? '⚠️ ' : ''}${risk} risk</div>
        <p class="cookie-desc">${purpose}</p>
      </div>
    `;
  });

  document.getElementById("safe-count").textContent = safeCount;
  document.getElementById("medium-count").textContent = mediumCount;
  document.getElementById("risky-count").textContent = riskyCount;
  document.getElementById("cookies-list").innerHTML = cookiesHTML;
}

// Initial load
document.addEventListener('DOMContentLoaded', loadCookies);

// Refresh button
document.getElementById("refresh").addEventListener("click", loadCookies);
