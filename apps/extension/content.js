function extractJobDetails() {
  const url = window.location.href;
  let title = '';
  let company = '';
  let description = '';

  if (url.includes('linkedin.com/jobs')) {
    title = document.querySelector('.job-details-jobs-unified-top-card__job-title, .job-title')?.innerText || '';
    company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description a')?.innerText || '';
    description = document.querySelector('.jobs-description, .jobs-description__content, #job-details')?.innerText || document.body.innerText;
  } else if (url.includes('indeed.com')) {
    title = document.querySelector('.jobsearch-JobInfoHeader-title')?.innerText || '';
    company = document.querySelector('[data-company-name="true"]')?.innerText || '';
    description = document.querySelector('#jobDescriptionText')?.innerText || document.body.innerText;
  } else {
    // Generic fallback
    title = document.title;
    description = document.body.innerText;
  }

  // Basic cleanup to avoid massive payloads
  if (description) {
    description = description.substring(0, 8000); 
  }

  // Detect form fields for auto-fill
  const formFields = [];
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), textarea, select');
  
  inputs.forEach((input, index) => {
    // Attempt to find a label
    let label = '';
    if (input.id) {
      const labelEl = document.querySelector(`label[for="${input.id}"]`);
      if (labelEl) label = labelEl.innerText;
    }
    if (!label && input.closest('label')) {
      label = input.closest('label').innerText;
    }
    if (!label) label = input.getAttribute('aria-label') || input.name || input.placeholder || '';
    
    // Clean up label
    label = label.replace(/\s+/g, ' ').trim();
    if (!label) return; // Skip fields we can't identify at all
    
    // Assign a unique ID if it doesn't have one
    const fieldId = input.id || input.name || `field_${index}`;
    if (!input.id) input.setAttribute('data-nova-id', fieldId);

    formFields.push({
      fieldId: fieldId,
      label: label,
      type: input.tagName.toLowerCase() === 'input' ? input.type : input.tagName.toLowerCase(),
      placeholder: input.placeholder || ''
    });
  });

  return { title, company, url, description, formFields };
}

// Function to actually fill the fields once AI mapping is done
function fillFormFields(mappings) {
  mappings.forEach(mapping => {
    const el = document.getElementById(mapping.fieldId) || 
               document.getElementsByName(mapping.fieldId)[0] ||
               document.querySelector(`[data-nova-id="${mapping.fieldId}"]`);
    
    if (el) {
      if (el.type === 'checkbox' || el.type === 'radio') {
        const isTrue = mapping.value === 'true' || mapping.value === true || mapping.value === 'Yes';
        el.checked = isTrue;
      } else {
        el.value = mapping.value;
      }
      // Trigger events so React/Angular picks up the change
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillForm" && request.mappings) {
    fillFormFields(request.mappings);
    sendResponse({ success: true });
  }
});

extractJobDetails();
