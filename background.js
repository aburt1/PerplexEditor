// Background script for Text Rewriter Pro extension

// Create context menu items
browser.contextMenus.create({
  id: "rewrite-text",
  title: "Rewrite Text",
  contexts: ["selection"]
});

browser.contextMenus.create({
  id: "reword-text",
  title: "Reword Text",
  contexts: ["selection"]
});

browser.contextMenus.create({
  id: "improve-text",
  title: "Improve Text",
  contexts: ["selection"]
});

browser.contextMenus.create({
  id: "summarize-text",
  title: "Summarize Text",
  contexts: ["selection"]
});

// Kuali-specific context menu item
browser.contextMenus.create({
  id: "kuali-notification",
  title: "Generate Kuali Notification",
  contexts: ["selection"],
  documentUrlPatterns: ["*://*.kuali.com/*", "*://*.kuali.co/*", "*://*.kuali.org/*", "*://kuali.com/*", "*://kuali.co/*", "*://kuali.org/*"]
});

// Toolbar button: open in-page action menu
browser.browserAction.onClicked.addListener(async (tab) => {
  try {
    await browser.tabs.sendMessage(tab.id, { type: 'openActionMenu' });
  } catch (e) {
    console.error('Failed to open action menu:', e);
  }
});

// Keyboard shortcuts (commands)
browser.commands.onCommand.addListener(async (command) => {
  try {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || activeTab.id == null) return;
    
    if (command === 'open-action-menu') {
      await browser.tabs.sendMessage(activeTab.id, { type: 'openActionMenu' });
      return;
    }
    
    const selectionInfo = await browser.tabs.executeScript(activeTab.id, {
      code: "window.getSelection().toString()",
    });
    const selectedText = Array.isArray(selectionInfo) ? selectionInfo[0] : '';
    if (!selectedText || !selectedText.trim()) return;

    const config = await browser.storage.sync.get({
      apiKey: '',
      defaultTone: 'neutral',
      defaultLength: 'same',
      siteContexts: [],
      rewritePrompt: 'You are an expert text editor and communication specialist. Your task is to rewrite the provided text to make it clearer, more engaging, and more effective while preserving the original meaning and intent.\n\nGuidelines:\n- Maintain the core message and purpose\n- Improve clarity, flow, and readability\n- Use active voice and strong verbs where appropriate\n- Eliminate redundancy and wordiness\n- Ensure logical structure and coherence\n- Keep the same level of formality unless tone is specified\n- Preserve any existing dashes, hyphens, or symbols that are part of the original text\n\nCRITICAL: Return ONLY the rewritten text. Do not add quotes, explanations, or any other text. Just return the rewritten version:\n\nText to rewrite:',
      rewordPrompt: 'You are a skilled linguist and communication expert. Your task is to rephrase the provided text using different vocabulary and sentence structures while maintaining the exact same meaning, tone, and intent.\n\nGuidelines:\n- Use synonyms and alternative phrasing\n- Vary sentence structure and length\n- Maintain the same level of formality\n- Keep the same emotional tone and emphasis\n- Preserve all specific details and facts\n- Ensure the new version conveys identical meaning\n- Preserve any existing dashes, hyphens, or symbols that are part of the original text\n\nCRITICAL: Return ONLY the reworded text. Do not add quotes, explanations, or any other text. Just return the alternative version:\n\nText to reword:',
      improvePrompt: 'You are a professional editor and writing consultant. Your task is to improve the provided text by enhancing its clarity, grammar, structure, and overall effectiveness while maintaining the original message and style.\n\nGuidelines:\n- Fix grammar, punctuation, and spelling errors\n- Improve sentence structure and flow\n- Enhance clarity and readability\n- Maintain the original tone and style\n- Ensure logical organization and coherence\n- Use more precise and effective language\n- Preserve any existing dashes, hyphens, or symbols that are part of the original text\n\nCRITICAL: Return ONLY the improved text. Do not add quotes, explanations, or any other text. Just return the enhanced version:\n\nText to improve:',
      summarizePrompt: 'You are an expert at creating clear, concise summaries. Your task is to provide a comprehensive yet concise summary of the provided text that captures the key points, main ideas, and essential information.\n\nGuidelines:\n- Identify and extract the main points and key ideas\n- Maintain the original meaning and intent\n- Use clear, direct language\n- Organize information logically\n- Include relevant details and examples\n- Ensure the summary is self-contained and understandable\n- Preserve any existing dashes, hyphens, or symbols that are part of the original text\n\nCRITICAL: Return ONLY the summary. Do not add quotes, explanations, or any other text. Just return the summary:\n\nText to summarize:'
    });
    if (!config.apiKey) return;

    let action = null;
    if (command === 'rewrite-text') action = 'rewrite-text';
    if (command === 'reword-text') action = 'reword-text';
    if (command === 'improve-text') action = 'improve-text';
    if (command === 'summarize-text') action = 'summarize-text';
    if (!action) return;

    await browser.tabs.sendMessage(activeTab.id, {
      action,
      text: selectedText,
      config
    });
  } catch (e) {
    console.error('Command handling failed:', e);
  }
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.selectionText) {
    const action = info.menuItemId;
    
    try {
      // Get stored API key and prompts
      const config = await browser.storage.sync.get({
        apiKey: '',
        defaultTone: 'neutral',
        defaultLength: 'same',
        siteContexts: [],
              rewritePrompt: 'You are an expert text editor and communication specialist. Your task is to rewrite the provided text to make it clearer, more engaging, and more effective while preserving the original meaning and intent.\n\nGuidelines:\n- Maintain the core message and purpose\n- Improve clarity, flow, and readability\n- Use active voice and strong verbs where appropriate\n- Eliminate redundancy and wordiness\n- Ensure logical structure and coherence\n- Keep the same level of formality unless tone is specified\n- Preserve any existing dashes, hyphens, or symbols that are part of the original text\n\nCRITICAL: Return ONLY the rewritten text. Do not add quotes, explanations, or any other text. Just return the rewritten version:\n\nText to rewrite:',
      rewordPrompt: 'You are an expert text editor and communication specialist. Your task is to rewrite the provided text to make it clearer, more engaging, and more effective while preserving the original meaning and intent.\n\nGuidelines:\n- Maintain the core message and purpose\n- Improve clarity, flow, and readability\n- Use active voice and strong verbs where appropriate\n- Eliminate redundancy and wordiness\n- Ensure logical structure and coherence\n- Keep the same level of formality unless tone is specified\n- Preserve any existing dashes, hyphens, or symbols that are part of the original text\n\nCRITICAL: Return ONLY the rewritten text. Do not add quotes, explanations, or any other text. Just return the rewritten version:\n\nText to rewrite:',
      improvePrompt: 'You are a professional editor and writing consultant. Your task is to improve the provided text by enhancing its clarity, grammar, structure, and overall effectiveness while maintaining the original message and style.\n\nGuidelines:\n- Fix grammar, punctuation, and spelling errors\n- Improve sentence structure and flow\n- Enhance clarity and readability\n- Maintain the original tone and style\n- Ensure logical organization and coherence\n- Use more precise and effective language\n- Preserve any existing dashes, hyphens, or symbols that are part of the original text\n\nCRITICAL: Return ONLY the improved text. Do not add quotes, explanations, or any other text. Just return the enhanced version:\n\nText to improve:',
      summarizePrompt: 'You are an expert at creating clear, concise summaries. Your task is to provide a comprehensive yet concise summary of the provided text that captures the key points, main ideas, and essential information.\n\nGuidelines:\n- Identify and extract the main points and key ideas\n- Maintain the original meaning and intent\n- Use clear, direct language\n- Organize information logically\n- Include relevant details and examples\n- Ensure the summary is self-contained and understandable\n- Preserve any existing dashes, hyphens, or symbols that are part of the original text\n\nCRITICAL: Return ONLY the summary. Do not add quotes, explanations, or any other text. Just return the summary:\n\nText to summarize:',
            kualiNotificationPrompt: 'You are an expert at creating professional email notifications for Kuali workflow systems. Based on the provided context and text, create a comprehensive email notification that includes separate fields for:\n\n1. **Subject Line**: A clear, concise subject that summarizes the notification\n2. **Greeting**: Professional greeting appropriate for the recipient\n3. **Main Message**: The core notification content in clear, professional language\n4. **Action Required**: What the recipient needs to do (if any)\n5. **Deadline**: When action is needed (if applicable)\n6. **Contact Information**: Who to contact for questions\n7. **Closing**: Professional closing statement\n\nFormat your response exactly as follows (replace the placeholder text with your content):\n\nSUBJECT: [Your subject line here]\nGREETING: [Your greeting here]\nMESSAGE: [Your main message here]\nACTION: [Action required here]\nDEADLINE: [Deadline here]\nCONTACT: [Contact info here]\nCLOSING: [Your closing here]\n\nContext: '
      });
      
      if (!config.apiKey) {
        console.error('API Key not configured');
        return;
      }
      
      // Send message to content script to process the text
      browser.tabs.sendMessage(tab.id, {
        action: action,
        text: info.selectionText,
        config: config
      });
      
    } catch (error) {
      console.error('Error processing context menu action:', error);
    }
  }
});

// Handle installation
browser.runtime.onInstalled.addListener(() => {
  // Set default prompts
  browser.storage.sync.set({
    defaultTone: 'neutral',
    defaultLength: 'same',
    siteContexts: [
      {
        domain: 'outlook.office.com',
        audience: 'Business colleagues, formal tone, professional communication'
      }
    ],
    rewritePrompt: 'Rewrite the following text to make it clearer and more engaging. IMPORTANT: Return ONLY the rewritten text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the rewritten text:',
    rewordPrompt: 'Reword the following text using different vocabulary while maintaining the same meaning. IMPORTANT: Return ONLY the reworded text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the reworded text:',
    improvePrompt: 'Improve the following text by enhancing clarity, grammar, and flow. IMPORTANT: Return ONLY the improved text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the improved text:',
    summarizePrompt: 'Provide a concise summary of the following text. IMPORTANT: Return ONLY the summary. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the summary:',
    kualiNotificationPrompt: 'You are an expert at creating professional email notifications for Kuali workflow systems. Based on the provided context and text, create a comprehensive email notification that includes separate fields for:\n\n1. **Subject Line**: A clear, concise subject that summarizes the notification\n2. **Greeting**: Professional greeting appropriate for the recipient\n3. **Main Message**: The core notification content in clear, professional language\n4. **Action Required**: What the recipient needs to do (if any)\n5. **Deadline**: When action is needed (if applicable)\n6. **Contact Information**: Who to contact for questions\n7. **Closing**: Professional closing statement\n\nFormat your response exactly as follows (replace the placeholder text with your content):\n\nSUBJECT: [Your subject line here]\nGREETING: [Your greeting here]\nMESSAGE: [Your main message here]\nACTION: [Action required here]\nDEADLINE: [Deadline here]\nCONTACT: [Contact info here]\nCLOSING: [Your closing here]\n\nContext: '
  });
});
