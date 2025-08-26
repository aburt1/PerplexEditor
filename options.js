// Options page JavaScript for AI Text Editor extension

document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  loadSettings();
  
  // Add event listeners for save buttons
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('saveBtn2').addEventListener('click', saveSettings);
  document.getElementById('saveBtn3').addEventListener('click', saveSettings);
  
  // Add event listener for add site context button
  document.getElementById('addSiteContext').addEventListener('click', () => {
    addSiteContextRow();
  });
  
  // Add tab switching functionality
  setupTabs();
});

// Setup tab switching
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// Load saved settings from storage
async function loadSettings() {
  try {
    const config = await browser.storage.sync.get({
      apiKey: '',
      defaultTone: 'neutral',
      defaultLength: 'same',
      siteContexts: [],
      rewritePrompt: 'Rewrite the following text to make it clearer and more engaging. IMPORTANT: Return ONLY the rewritten text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the rewritten text:',
      rewordPrompt: 'Reword the following text using different vocabulary while maintaining the same meaning. IMPORTANT: Return ONLY the reworded text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the reworded text:',
      improvePrompt: 'Improve the following text by enhancing clarity, grammar, and flow. IMPORTANT: Return ONLY the improved text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the improved text:',
      summarizePrompt: 'Provide a concise summary of the following text. IMPORTANT: Return ONLY the summary. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the summary:'
    });
    
    // Populate form fields
    document.getElementById('apiKey').value = config.apiKey;
    document.getElementById('defaultTone').value = config.defaultTone;
    document.getElementById('defaultLength').value = config.defaultLength;
    document.getElementById('rewritePrompt').value = config.rewritePrompt;
    document.getElementById('rewordPrompt').value = config.rewordPrompt;
    document.getElementById('improvePrompt').value = config.improvePrompt;
    document.getElementById('summarizePrompt').value = config.summarizePrompt;
    
    // Load site contexts
    loadSiteContexts(config.siteContexts || []);
    
  } catch (error) {
    console.error('Error loading settings', error);
    showStatus('Error loading settings', 'error');
  }
}

// Save settings to storage
async function saveSettings() {
  try {
    const apiKey = document.getElementById('apiKey').value.trim();
    const defaultTone = document.getElementById('defaultTone').value;
    const defaultLength = document.getElementById('defaultLength').value;
    const rewritePrompt = document.getElementById('rewritePrompt').value.trim();
    const rewordPrompt = document.getElementById('rewordPrompt').value.trim();
    const improvePrompt = document.getElementById('improvePrompt').value.trim();
    const summarizePrompt = document.getElementById('summarizePrompt').value.trim();
    
    // Get site contexts
    const siteContexts = getSiteContexts();
    
    // Validate required fields
    if (!apiKey) {
      showStatus('API Key is required', 'error');
      return;
    }
    
    if (!rewritePrompt || !rewordPrompt || !improvePrompt || !summarizePrompt) {
      showStatus('All prompts are required', 'error');
      return;
    }
    
    // Save to storage
    await browser.storage.sync.set({
      apiKey: apiKey,
      defaultTone: defaultTone,
      defaultLength: defaultLength,
      siteContexts: siteContexts,
      rewritePrompt: rewritePrompt,
      rewordPrompt: rewordPrompt,
      improvePrompt: improvePrompt,
      summarizePrompt: summarizePrompt
    });
    
    showStatus('Settings saved successfully!', 'success');
    
    // Clear status after 3 seconds
    setTimeout(() => {
      hideStatus();
    }, 3000);
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings: ' + error.message, 'error');
  }
}

// Show status message
function showStatus(message, type) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  statusElement.style.display = 'block';
}

// Hide status message
function hideStatus() {
  const statusElement = document.getElementById('status');
  statusElement.style.display = 'none';
}

// Add input validation
document.getElementById('apiKey').addEventListener('input', validateApiKey);
document.getElementById('rewritePrompt').addEventListener('input', validatePrompt);
document.getElementById('rewordPrompt').addEventListener('input', validatePrompt);
document.getElementById('improvePrompt').addEventListener('input', validatePrompt);
document.getElementById('summarizePrompt').addEventListener('input', validatePrompt);

function validateApiKey() {
  const apiKey = document.getElementById('apiKey').value.trim();
  const input = document.getElementById('apiKey');
  
  if (apiKey.length === 0) {
    input.style.borderColor = '#f59e0b';
  } else if (apiKey.length < 10) {
    input.style.borderColor = '#ef4444';
  } else {
    input.style.borderColor = '#10b981';
  }
}

function validatePrompt() {
  const prompt = this.value.trim();
  const input = this;
  
  if (prompt.length === 0) {
    input.style.borderColor = '#ef4444';
  } else if (prompt.length < 10) {
    input.style.borderColor = '#f59e0b';
  } else {
    input.style.borderColor = '#10b981';
  }
}

// Load site contexts into the UI
function loadSiteContexts(contexts) {
  const container = document.getElementById('siteContextsContainer');
  container.innerHTML = '';
  
  contexts.forEach((context, index) => {
    addSiteContextRow(context.domain, context.audience, index);
  });
}

// Add a new site context row
function addSiteContextRow(domain = '', audience = '', index = null) {
  const container = document.getElementById('siteContextsContainer');
  const contextDiv = document.createElement('div');
  contextDiv.className = 'site-context-item';
  
  const rowId = index !== null ? index : Date.now();
  
  contextDiv.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Domain (e.g., outlook.office.com):</label>
        <input type="text" class="site-domain" value="${domain}" placeholder="outlook.office.com">
      </div>
      <div class="form-group">
        <label>Audience Context:</label>
        <input type="text" class="site-audience" value="${audience}" placeholder="Business colleagues, formal tone">
      </div>
      <button type="button" class="remove-btn" onclick="removeSiteContext(${rowId})">Remove</button>
    </div>
  `;
  
  contextDiv.dataset.index = rowId;
  container.appendChild(contextDiv);
}

// Remove a site context row
function removeSiteContext(index) {
  const container = document.getElementById('siteContextsContainer');
  const contextDiv = container.querySelector(`[data-index="${index}"]`);
  if (contextDiv) {
    contextDiv.remove();
  }
}

// Get all site contexts from the UI
function getSiteContexts() {
  const contexts = [];
  const contextDivs = document.querySelectorAll('.site-context-item');
  
  contextDivs.forEach(div => {
    const domain = div.querySelector('.site-domain').value.trim();
    const audience = div.querySelector('.site-audience').value.trim();
    
    if (domain && audience) {
      contexts.push({ domain, audience });
    }
  });
  
  return contexts;
}
