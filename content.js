// Content script to extract company name from the page
let cachedCompanyName = '';

function extractCompanyName() {
  let companyName = '';

  // Try to get company name from LinkedIn (data-test-id)
  const linkedInCompany = document.querySelector('[data-test-id="top-card-company-name"]');
  if (linkedInCompany) {
    companyName = linkedInCompany.textContent.trim();
    if (companyName) return companyName;
  }

  // Try LinkedIn with alternative selectors
  const linkedInAlt = document.querySelector('.jobs-details-top-card__company-name');
  if (linkedInAlt) {
    companyName = linkedInAlt.textContent.trim();
    if (companyName) return companyName;
  }

  // Try Indeed company name
  const indeedCompany = document.querySelector('[data-company-name]');
  if (indeedCompany) {
    companyName = indeedCompany.getAttribute('data-company-name');
    if (companyName) return companyName;
  }

  // Try Indeed with alternative selector
  const indeedCompanyName = document.querySelector('div[data-testid="jobsearch-CompanyName"]');
  if (indeedCompanyName) {
    companyName = indeedCompanyName.textContent.trim();
    if (companyName) return companyName;
  }

  // Try meta tags for company info
  const ogSite = document.querySelector('meta[property="og:site_name"]');
  if (ogSite) {
    companyName = ogSite.getAttribute('content');
    if (companyName) return companyName;
  }

  // Try schema.org structured data
  const schemaScript = document.querySelector('script[type="application/ld+json"]');
  if (schemaScript) {
    try {
      const schema = JSON.parse(schemaScript.textContent);
      if (schema.hiringOrganization && schema.hiringOrganization.name) {
        companyName = schema.hiringOrganization.name;
        if (companyName) return companyName;
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // Try to extract from page title (e.g., "Job Title at Company Name")
  const titleMatch = document.title.match(/at\s+([^-|–|·|•]+)/i);
  if (titleMatch) {
    companyName = titleMatch[1].trim();
    if (companyName && companyName.length > 1) return companyName;
  }

  // Look for company-related text in headings
  const headings = document.querySelectorAll('h1, h2, h3');
  for (let heading of headings) {
    const text = heading.textContent;
    if (text.toLowerCase().includes('at ')) {
      const parts = text.split(/\s+at\s+/i);
      if (parts.length > 1) {
        companyName = parts[1].trim();
        if (companyName) return companyName;
      }
    }
  }

  // Try common selectors that might contain company info
  const possibleCompanySelectors = [
    '.company-name',
    '.employer-name',
    '[class*="company"]',
    '[class*="employer"]',
    '[id*="company"]'
  ];

  for (let selector of possibleCompanySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      companyName = element.textContent.trim();
      if (companyName && companyName.length > 1) return companyName;
    }
  }

  return companyName;
}

// Extract company name immediately when script loads
function initializeExtraction() {
  cachedCompanyName = extractCompanyName();
  console.log('Job Tracker: Company name cached:', cachedCompanyName);
}

// Try to extract as soon as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtraction);
} else {
  initializeExtraction();
}

// Also re-extract after a short delay to catch dynamically loaded content
setTimeout(() => {
  const newCompanyName = extractCompanyName();
  if (newCompanyName && !cachedCompanyName) {
    cachedCompanyName = newCompanyName;
    console.log('Job Tracker: Company name found on delay:', cachedCompanyName);
  }
}, 500);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCompanyName') {
    // If we have a cached name, return it immediately
    if (cachedCompanyName) {
      console.log('Job Tracker: Returning cached company name:', cachedCompanyName);
      sendResponse({ companyName: cachedCompanyName });
    } else {
      // Otherwise try to extract now
      const company = extractCompanyName();
      console.log('Job Tracker: Extracted company name on demand:', company);
      cachedCompanyName = company;
      sendResponse({ companyName: company });
    }
  }
});

console.log('Job Tracker content script loaded');
