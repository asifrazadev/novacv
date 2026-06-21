const API_URL_BASE = CONFIG.API_URL_BASE;
const LOGIN_URL = CONFIG.LOGIN_URL;

// Elements
const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const loginBtn = document.getElementById('login-btn');

const navTracker = document.getElementById('nav-tracker');
const navResumes = document.getElementById('nav-resumes');
const panelTracker = document.getElementById('panel-tracker');
const panelResumes = document.getElementById('panel-resumes');


// Tracker Elements
const companyInput = document.getElementById('company');
const positionInput = document.getElementById('position');
const statusSelect = document.getElementById('status-select');
const locationInput = document.getElementById('location');
const salaryInput = document.getElementById('salary');
const notesInput = document.getElementById('notes');
const saveBtn = document.getElementById('save-btn');
const autoInfo = document.getElementById('auto-info');
const statusMsg = document.getElementById('status-msg');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.getElementById('loading-text');

// Resumes Elements
const resumesList = document.getElementById('resumes-list');

let currentUrl = '';
let currentJobDescription = '';
let autoFilled = false;

// Helpers
function showLoading(text = 'Processing...') {
  loadingText.textContent = text;
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

function showMsg(msg, type = 'info') {
  statusMsg.textContent = msg;
  statusMsg.className = `alert alert-${type}`;
  statusMsg.classList.remove('hidden');
  setTimeout(() => statusMsg.classList.add('hidden'), 4000);
}

// Auth
loginBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: LOGIN_URL });
});

// Main Nav
navTracker.addEventListener('click', () => {
  navTracker.classList.add('active');
  navResumes.classList.remove('active');
  panelTracker.classList.add('active');
  panelResumes.classList.remove('active');
});

navResumes.addEventListener('click', () => {
  navResumes.classList.add('active');
  navTracker.classList.remove('active');
  panelResumes.classList.add('active');
  panelTracker.classList.remove('active');
  loadResumes();
});

// Data Extraction
async function extractAndFill() {
  if (autoFilled) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    if (results && results[0] && results[0].result) {
      const jobData = results[0].result;
      if (jobData.company || jobData.title) {
        companyInput.value = jobData.company || '';
        positionInput.value = jobData.title || '';
        currentUrl = jobData.url || '';
        currentJobDescription = jobData.description || '';
        autoFilled = true;
        autoInfo.textContent = 'Job details extracted successfully!';
        autoInfo.className = 'alert alert-success';
      } else {
        autoInfo.textContent = 'Could not detect job title/company automatically.';
        autoInfo.className = 'alert alert-warning';
      }
    } else {
      autoInfo.textContent = 'Please fill the details manually.';
      autoInfo.className = 'alert alert-error';
    }
  } catch (err) {
    autoInfo.textContent = 'Please fill the details manually.';
    autoInfo.className = 'alert alert-warning';
  }
}

// Initial
extractAndFill();

// Save Job Application
saveBtn.addEventListener('click', async () => {
  if (!companyInput.value || !positionInput.value) {
    showMsg('Company and Position are required.', 'error');
    return;
  }

  showLoading('Saving to Kanban...');

  const payload = {
    company: companyInput.value,
    position: positionInput.value,
    status: statusSelect.value,
    location: locationInput.value,
    salary: salaryInput.value,
    notes: notesInput.value,
    url: currentUrl
  };

  try {
    const res = await fetch(`${API_URL_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
      body: JSON.stringify(payload)
    });

    if (res.status === 401) {
      appView.classList.add('hidden');
      authView.classList.remove('hidden');
      hideLoading();
      return;
    }

    const json = await res.json();
    hideLoading();
    
    if (res.ok && json.success) {
      showMsg('Saved to Kanban board!', 'success');
      setTimeout(() => window.close(), 1500);
    } else {
      showMsg(json.error || 'Failed to save.', 'error');
    }
  } catch (err) {
    hideLoading();
    showMsg('Error connecting to NovaCV.', 'error');
  }
});

// Load Resumes List
async function loadResumes() {
  resumesList.innerHTML = '<div class="text-center" style="font-size:12px; color:var(--muted); padding:20px 0;">Loading resumes...</div>';
  
  try {
    const res = await fetch(`${API_URL_BASE}/resumes`, {
      method: 'GET',
      credentials: 'include'
    });

    if (res.status === 401) {
      appView.classList.add('hidden');
      authView.classList.remove('hidden');
      return;
    }

    const json = await res.json();
    
    if (res.ok && json.success) {
      renderResumes(json.resumes);
    } else {
      resumesList.innerHTML = `<div class="alert alert-error">${json.error || 'Failed to load resumes'}</div>`;
    }
  } catch (err) {
    resumesList.innerHTML = '<div class="alert alert-error">Error connecting to NovaCV</div>';
  }
}

function renderResumes(resumes) {
  if (!resumes || resumes.length === 0) {
    resumesList.innerHTML = '<div class="alert alert-warning">No resumes found. Create one in NovaCV first.</div>';
    return;
  }

  resumesList.innerHTML = resumes.map(r => `
    <div class="resume-card" id="resume-${r.id}">
      <div class="resume-title">${r.title || 'Untitled Resume'}</div>
      <div class="resume-meta">Updated: ${new Date(r.updated_at).toLocaleDateString()}</div>
      <div class="resume-actions" style="margin-top: 10px; display: flex; justify-content: flex-end; align-items: center;">
         <div style="display: flex; gap: 8px;">
           <button class="btn btn-secondary fill-form-btn" data-resume-id="${r.id}" style="padding: 6px 10px; font-size: 11px; width: auto;">Auto-Fill</button>
           <button class="btn btn-secondary pdf-btn" data-resume-id="${r.id}" style="padding: 6px 10px; font-size: 11px; width: auto;">PDF</button>
         </div>
      </div>
    </div>
  `).join('');

  // Attach event listeners for PDF buttons
  const pdfBtns = resumesList.querySelectorAll('.pdf-btn');
  pdfBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const resumeId = e.target.getAttribute('data-resume-id');
      const pdfUrl = `${CONFIG.BASE_URL}/api/resumes/${resumeId}/pdf`;
      showLoading('Generating PDF...');
      chrome.downloads.download({
        url: pdfUrl,
        filename: `NovaCV_Resume_${resumeId.substring(0,6)}.pdf`,
        saveAs: true
      }, () => {
        hideLoading();
      });
    });
  });
}

  // Attach event listeners for auto-fill buttons
  const fillBtns = resumesList.querySelectorAll('.fill-form-btn');
  fillBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const resumeId = e.target.getAttribute('data-resume-id');
      fillFormWithResume(resumeId);
    });
  });

async function fillFormWithResume(resumeId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  showLoading('Analyzing form fields...');

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    if (!results || !results[0] || !results[0].result) {
      hideLoading();
      showMsg("Could not detect form fields on page.", "error");
      return;
    }

    const formFields = results[0].result.formFields || [];
    if (formFields.length === 0) {
      hideLoading();
      showMsg("No input fields found to auto-fill.", "warning");
      return;
    }

    showLoading('AI is mapping your resume to the form...');
    
    try {
      const res = await fetch(`${API_URL_BASE}/autofill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resumeId, fields: formFields })
      });

      const json = await res.json();
      hideLoading();

      if (res.ok && json.success) {
        showMsg("Mapping complete! Filling form...", "success");
        
        // Send mappings to content.js to perform the actual DOM updates
        chrome.tabs.sendMessage(tab.id, { 
          action: "fillForm", 
          mappings: json.fields 
        }, (response) => {
          if (response && response.success) {
            showMsg("Form successfully auto-filled!", "success");
          } else {
            showMsg("Could not update form elements.", "warning");
          }
        });
      } else {
        showMsg(json.error || "Failed to map fields.", "error");
      }
    } catch (err) {
      hideLoading();
      showMsg("Error connecting to AI service.", "error");
    }
  } catch (err) {
    hideLoading();
    showMsg("Cannot run auto-fill on this type of page.", "warning");
  }
}

// Extension Update Check
async function checkForUpdates() {
  try {
    const res = await fetch(`${CONFIG.BASE_URL}/api/extension/version`);
    if (res.ok) {
      const data = await res.json();
      const currentVersion = chrome.runtime.getManifest().version;
      
      if (data.version && currentVersion !== data.version) {
        showUpdateBanner(data);
      }
    }
  } catch (err) {
    console.error('Update check failed:', err);
    // Fallback: check storage if background script already fetched it
    chrome.storage.local.get(['extensionUpdate'], (result) => {
      if (result.extensionUpdate && result.extensionUpdate.version !== chrome.runtime.getManifest().version) {
        showUpdateBanner(result.extensionUpdate);
      }
    });
  }
}

function showUpdateBanner(updateData) {
  const updateBanner = document.getElementById('update-banner');
  const updateNotes = document.getElementById('update-notes');
  const updateBtn = document.getElementById('update-btn');

  updateNotes.textContent = updateData.releaseNotes || 'A new version is available with bug fixes and improvements.';
  updateBanner.classList.remove('hidden');

  updateBtn.onclick = () => {
    chrome.tabs.create({ url: updateData.updateUrl || `${CONFIG.BASE_URL}/api/extension/download` });
  };

  if (updateData.forceUpdate) {
    // Disable main interactions
    appView.style.pointerEvents = 'none';
    appView.style.opacity = '0.5';
    authView.style.pointerEvents = 'none';
    authView.style.opacity = '0.5';
  }
}

// Initial update check
checkForUpdates();
