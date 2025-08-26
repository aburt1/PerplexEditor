// Content script for Text Rewriter Pro extension

// Store the last known selection for restoration
let lastKnownSelection = {
  text: '',
  element: null,
  start: 0,
  end: 0
};

// Save the current selection whenever it changes
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const activeElement = document.activeElement;
  
  if (selection && selection.rangeCount > 0 && activeElement) {
    try {
      const selectedText = selection.toString();
      
      // For textarea/input elements, track selection more reliably
      if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        
        if (typeof start === 'number' && typeof end === 'number' && selectedText.length > 0) {
          lastKnownSelection = {
            text: selectedText,
            element: activeElement,
            start: start,
            end: end
          };
          console.log('Selection tracked:', { text: selectedText, start, end });
        }
      }
    } catch (e) {
      console.error('Error tracking selection:', e);
    }
  }
});

// Also track selection on mouseup and keyup for better coverage
document.addEventListener('mouseup', () => {
  setTimeout(() => {
    const selection = window.getSelection();
    const activeElement = document.activeElement;
    
    if (selection && selection.rangeCount > 0 && activeElement && 
        (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      const selectedText = selection.toString();
      if (selectedText.length > 0) {
        lastKnownSelection = {
          text: selectedText,
          element: activeElement,
          start: activeElement.selectionStart,
          end: activeElement.selectionEnd
        };
        console.log('Selection tracked on mouseup:', { text: selectedText, start: activeElement.selectionStart, end: activeElement.selectionEnd });
      }
    }
  }, 10);
});

// Listen for messages from background script
browser.runtime.onMessage.addListener(async (message) => {
  if (message.action && message.text && message.config) {
    try {
      // Show loading notification
      showNotification('Processing text...', 'info');
      
      // Special handling for Kuali notifications
      if (message.action === 'kuali-notification') {
        const result = await processKualiNotification(message.text, message.config);
        if (result) {
          showNotification('Kuali notification generated successfully!', 'success');
          // Parse and display the result in separate fields
          displayKualiNotificationResult(result);
        } else {
          showNotification('Failed to generate Kuali notification', 'error');
        }
        return;
      }
      
      // Process the text using Perplexity API
      const result = await processTextWithPerplexity(
        message.text,
        message.action,
        message.config
      );
      
      // Try to replace the selected text with the result
      const success = replaceSelectedText(result);
      
      if (success) {
        // Show success notification
        showNotification('Text processed successfully!', 'success');
        
        // If we're on the test page, add the result to the results section
        if (window.location.pathname.includes('test-extension.html') && window.addTestResult) {
          try {
            const actionName = message.action.replace('-', ' ');
            window.addTestResult(
              actionName,
              message.config.defaultTone || 'neutral',
              message.config.defaultLength || 'same',
              message.text,
              result
            );
          } catch (error) {
            console.error('Failed to add test result:', error);
          }
        }
      } else {
        // Show error notification
        showNotification('Failed to replace text. Check console for details.', 'error');
      }
      
    } catch (error) {
      console.error('Error processing text:', error);
      showNotification('Error processing text: ' + error.message, 'error');
    }
  }
  if (message && message.type === 'openActionMenu') {
    try {
      openInPageActionMenu();
      // Check if we're on a Kuali page and inject the context input if needed
      if (window.location.hostname.includes('kuali')) {
        injectKualiContextInput();
      }
    } catch (e) {
      console.error('Failed to open in-page action menu:', e);
    }
  }
});

// Function to process text with Perplexity API
async function processTextWithPerplexity(text, action, config) {
  const prompts = {
    'rewrite-text': config.rewritePrompt,
    'reword-text': config.rewordPrompt,
    'improve-text': config.improvePrompt,
    'summarize-text': config.summarizePrompt,
    'kuali-notification': config.kualiNotificationPrompt
  };
  
  let prompt = prompts[action] || config.rewritePrompt;
  
  // Apply tone and length settings
  const tone = config.defaultTone || 'neutral';
  const length = config.defaultLength || 'same';
  
  // Add tone instruction
  if (tone !== 'neutral') {
    const toneInstructions = {
      'formal': '\n\nTone Requirements:\n- Use formal, professional language\n- Maintain business-appropriate vocabulary\n- Avoid contractions and colloquialisms\n- Use complete sentences and proper grammar\n- Convey authority and expertise',
      'casual': '\n\nTone Requirements:\n- Use relaxed, conversational language\n- Include contractions and informal expressions\n- Maintain a friendly, approachable style\n- Use everyday vocabulary and phrases\n- Keep the tone light and accessible',
      'friendly': '\n\nTone Requirements:\n- Use warm, welcoming language\n- Include positive and encouraging words\n- Maintain a helpful and supportive tone\n- Use inclusive and approachable language\n- Convey genuine interest and care',
      'professional': '\n\nTone Requirements:\n- Use business-appropriate language\n- Maintain credibility and expertise\n- Use industry-standard terminology\n- Keep the tone confident and authoritative\n- Ensure clarity and precision',
      'technical': '\n\nTone Requirements:\n- Use precise, technical language\n- Include relevant terminology and jargon\n- Maintain accuracy and specificity\n- Use clear, structured explanations\n- Focus on technical accuracy and detail',
      'creative': '\n\nTone Requirements:\n- Use imaginative and engaging language\n- Include vivid descriptions and metaphors\n- Maintain an inspiring and motivational tone\n- Use dynamic and expressive vocabulary\n- Create an emotional connection with the reader',
      'concise': '\n\nTone Requirements:\n- Use direct, to-the-point language\n- Eliminate unnecessary words and phrases\n- Focus on essential information only\n- Use clear, simple sentence structures\n- Prioritize clarity and efficiency'
    };
    prompt += toneInstructions[tone] || '';
  }
  
  // Add length instruction
  if (length !== 'same') {
    const lengthInstructions = {
      'shorter': '\n\nLength Requirements:\n- Reduce the text length by 25-40%\n- Maintain all essential information and key points\n- Use more concise language and phrasing\n- Eliminate redundancy while preserving meaning\n- Focus on the most important details',
      'longer': '\n\nLength Requirements:\n- Increase the text length by 30-50%\n- Add relevant details, examples, and context\n- Expand on key points with supporting information\n- Include additional explanations where helpful\n- Maintain the same level of detail throughout',
      'concise': '\n\nLength Requirements:\n- Create a very brief, focused version\n- Reduce to the absolute essentials only\n- Use bullet points or numbered lists if appropriate\n- Aim for maximum clarity in minimum words\n- Prioritize key information over elaboration',
      'detailed': '\n\nLength Requirements:\n- Provide comprehensive coverage of the topic\n- Include extensive examples and explanations\n- Add relevant background information and context\n- Expand on all key points with thorough detail\n- Ensure complete understanding of the subject matter'
    };
    prompt += lengthInstructions[length] || '';
  }
  
  // Apply site-specific context if available
  if (config.siteContexts && config.siteContexts.length > 0) {
    const currentDomain = window.location.hostname;
    const siteContext = config.siteContexts.find(context => 
      currentDomain.includes(context.domain) || context.domain.includes(currentDomain)
    );
    
    if (siteContext) {
      console.log('Applying site-specific context:', siteContext);
      prompt += ` Context: This text is for ${siteContext.audience}.`;
    }
  }
  
  const fullPrompt = `${prompt}\n\nText: "${text}"`;
  
  console.log('Sending request to Perplexity API:', {
    action: action,
    textLength: text.length,
    prompt: prompt,
    tone: tone,
    length: length,
    currentDomain: window.location.hostname,
    siteContext: config.siteContexts?.find(context => 
      window.location.hostname.includes(context.domain) || context.domain.includes(window.location.hostname)
    ),
    model: 'sonar'
  });
  
  const requestBody = {
    model: 'sonar',
    messages: [
      {
        role: 'user',
        content: fullPrompt
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  };
  
  console.log('Request body:', requestBody);
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log('Response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('API Response data:', data);
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content.trim();
  } else {
    console.error('Unexpected API response format:', data);
    throw new Error('Invalid response from API');
  }
}

// Function to replace selected text
function replaceSelectedText(newText) {
  const activeElement = document.activeElement;
  let selection = window.getSelection();
  
  console.log('replaceSelectedText called with:', {
    newText: newText,
    activeElement: activeElement,
    activeElementTag: activeElement?.tagName,
    activeElementContentEditable: activeElement?.contentEditable,
    selectionExists: !!selection,
    selectionRangeCount: selection?.rangeCount,
    selectionText: selection?.toString()
  });
  
  // Try to restore selection if it was lost
  if (!selection || selection.rangeCount === 0) {
    console.log('Selection lost, attempting to restore...');
    
    // Try to restore focus to the active element
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      activeElement.focus();
      
      // Try to restore the last known selection
      if (lastKnownSelection.element === activeElement && lastKnownSelection.text.length > 0) {
        try {
          // Use a more direct approach for textarea/input
          if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
            activeElement.setSelectionRange(lastKnownSelection.start, lastKnownSelection.end);
            console.log('Restored selection using setSelectionRange');
            
            // Now try to replace the text directly
            try {
              activeElement.setRangeText(newText, lastKnownSelection.start, lastKnownSelection.end, 'end');
              console.log('Successfully replaced text using restored selection');
              return true;
            } catch (e) {
              console.error('setRangeText failed with restored selection:', e);
              // Fall through to other methods
            }
          }
        } catch (e) {
          console.error('Failed to restore selection range:', e);
        }
      }
      
      // If we can't restore selection, try to replace text at cursor position
      if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
        try {
          // Insert text at current cursor position
          const cursorPos = activeElement.selectionStart || 0;
          const currentText = activeElement.value;
          const beforeCursor = currentText.substring(0, cursorPos);
          const afterCursor = currentText.substring(cursorPos);
          
          // Insert the new text at cursor position
          activeElement.value = beforeCursor + newText + afterCursor;
          activeElement.setSelectionRange(cursorPos, cursorPos + newText.length);
          console.log('Inserted text at cursor position');
          return true;
        } catch (e) {
          console.error('Failed to insert text at cursor:', e);
        }
      }
    }
    
    console.error('No valid selection found and cannot restore');
    showNotification('No text selected or selection lost', 'error');
    return false;
  }
  
  if (selection.toString().trim().length === 0) {
    console.error('Selection is empty or whitespace only');
    showNotification('Please select some text to edit', 'error');
    return false;
  }
  
  // Handle INPUT/TEXTAREA with setRangeText to preserve behavior
  if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;
    if (typeof start === 'number' && typeof end === 'number') {
      try {
        activeElement.setRangeText(newText, start, end, 'end');
        console.log('Successfully replaced text in INPUT/TEXTAREA');
        return true;
      } catch (e) {
        console.error('setRangeText failed:', e);
        showNotification('Failed to replace text in input field', 'error');
        return false;
      }
    }
  }

  // For contentEditable/rich editors, try a formatting-preserving replacement across text nodes
  if (isEditableContext()) {
    try {
      const replaced = replaceSelectedTextPreserveInline(newText);
      if (replaced) {
        console.log('Successfully replaced text preserving inline formatting');
        return true;
      }
    } catch (e) {
      console.error('Formatting-preserving replacement failed:', e);
      // Continue to fallback methods
    }
  }

  // For contentEditable/rich editors, prefer execCommand('insertText') to keep current formatting context
  try {
    // eslint-disable-next-line no-undef
    const supported = document.queryCommandSupported && document.queryCommandSupported('insertText');
    if (supported) {
      // eslint-disable-next-line no-undef
      const ok = document.execCommand('insertText', false, newText);
      if (ok) {
        console.log('Successfully replaced text using execCommand insertText');
        return true;
      } else {
        console.warn('execCommand insertText returned false');
      }
    }
  } catch (e) {
    console.error('execCommand insertText failed:', e);
  }

  // Fallback: direct Range replacement (may strip formatting within selection)
  try {
    const range = selection.getRangeAt(0);
    if (!range) {
      console.error('No valid range found in selection');
      showNotification('Selection range is invalid', 'error');
      return false;
    }
    
    // Check if range is still valid
    if (range.collapsed) {
      console.error('Range is collapsed (no selection)');
      showNotification('Selection has been lost', 'error');
      return false;
    }
    
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
    selection.removeAllRanges();
    console.log('Successfully replaced text using direct Range replacement');
    return true;
  } catch (e) {
    console.error('Direct Range replacement failed:', e);
    showNotification('Failed to replace text: ' + e.message, 'error');
    return false;
  }
  
  return false;
}

// Replace selection by distributing newText across the selected Text nodes, preserving inline formatting wrappers
function replaceSelectedTextPreserveInline(newText) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return false;

  const common = range.commonAncestorContainer;
  const walker = document.createTreeWalker(common, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Only consider text nodes that intersect the selection range
      try {
        const intersects = range.intersectsNode(node);
        return intersects ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      } catch (e) {
        return NodeFilter.FILTER_REJECT;
      }
    }
  });

  const segments = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    // Compute selection offsets within this text node
    let startOffset = 0;
    let endOffset = node.nodeValue.length;

    if (node === range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
      startOffset = range.startOffset;
    }
    if (node === range.endContainer && range.endContainer.nodeType === Node.TEXT_NODE) {
      endOffset = range.endOffset;
    }

    // If the selection starts/ends in ancestor elements, we still take full node where applicable
    if (startOffset < endOffset) {
      segments.push({ node, startOffset, endOffset });
    }
  }

  if (segments.length === 0) return false;

  // Distribute newText across the segments sequentially
  let remaining = newText;
  for (let i = 0; i < segments.length; i++) {
    const { node, startOffset, endOffset } = segments[i];
    const before = node.nodeValue.slice(0, startOffset);
    const selectedLen = endOffset - startOffset;
    const after = node.nodeValue.slice(endOffset);

    // Assign slice of remaining text to this segment
    let slice;
    if (i === segments.length - 1) {
      slice = remaining; // last segment gets the rest (can grow/shrink)
    } else {
      // Proportionally split based on original segment length relative to total selected length
      // Simpler approach: take up to selectedLen chars; if not enough remaining, use what's left
      slice = remaining.slice(0, Math.max(0, Math.min(selectedLen, remaining.length)));
    }

    node.nodeValue = before + slice + after;
    remaining = remaining.slice(slice.length);
  }

  // If remaining still has content (newText was longer), append to the last segment's node
  if (remaining && segments.length > 0) {
    const last = segments[segments.length - 1].node;
    // Insert after the portion we replaced in last node
    const lastInfo = segments[segments.length - 1];
    const insertionPoint = lastInfo.startOffset + (lastInfo.node.nodeValue.length - (lastInfo.node.nodeValue.slice(lastInfo.endOffset).length));
    // Fallback: append to the end of the last node
    last.nodeValue = last.nodeValue + remaining;
  }

  // Clear selection
  selection.removeAllRanges();
  return true;
}

// Function to show notifications
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  // Set background color based on type
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#10b981';
      break;
    case 'error':
      notification.style.backgroundColor = '#ef4444';
      break;
    case 'info':
    default:
      notification.style.backgroundColor = '#3b82f6';
      break;
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

// Validate and potentially restore selection for Outlook's editor
function validateAndRestoreSelection() {
  const selection = window.getSelection();
  const activeElement = document.activeElement;
  
  console.log('Validating selection state:', {
    selectionExists: !!selection,
    selectionRangeCount: selection?.rangeCount,
    selectionText: selection?.toString(),
    activeElement: activeElement,
    activeElementTag: activeElement?.tagName,
    activeElementContentEditable: activeElement?.contentEditable
  });
  
  // If no selection but we're in an editable context, try to restore it
  if (!selection || selection.rangeCount === 0) {
    if (isEditableContext()) {
      console.log('Selection lost, attempting to restore focus to editable element');
      activeElement.focus();
      
      // Wait a bit for focus to settle, then check again
      setTimeout(() => {
        const newSelection = window.getSelection();
        console.log('Selection after focus restore:', {
          selectionExists: !!newSelection,
          selectionRangeCount: newSelection?.rangeCount,
          selectionText: newSelection?.toString()
        });
      }, 100);
      
      return false;
    }
    return false;
  }
  
  // Check if selection is still valid
  try {
    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) {
      console.log('Selection range is invalid or collapsed');
      return false;
    }
    
    const text = selection.toString().trim();
    if (text.length === 0) {
      console.log('Selection contains no text');
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Error validating selection range:', e);
    return false;
  }
}

// Enhanced isEditableContext with better Outlook detection
function isEditableContext() {
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  
  // Check for standard editable elements
  const isStandardEditable = activeElement.tagName === 'TEXTAREA' || 
                            activeElement.tagName === 'INPUT' ||
                            activeElement.contentEditable === 'true' ||
                            activeElement.isContentEditable;
  
  // Special handling for Outlook Web
  const isOutlookEditor = activeElement.closest('[role="textbox"]') ||
                         activeElement.closest('[contenteditable="true"]') ||
                         activeElement.closest('.editable') ||
                         activeElement.closest('[data-testid*="editor"]') ||
                         activeElement.closest('[aria-label*="editor"]') ||
                         activeElement.closest('[aria-label*="compose"]');
  
  const result = isStandardEditable || isOutlookEditor;
  
  console.log('isEditableContext check:', {
    activeElement: activeElement,
    tagName: activeElement.tagName,
    contentEditable: activeElement.contentEditable,
    isContentEditable: activeElement.isContentEditable,
    isStandardEditable,
    isOutlookEditor,
    result
  });
  
  return result;
}

// Lightweight in-page action menu for sites with custom context menus (e.g., Outlook Web)
function openInPageActionMenu() {
  const existing = document.getElementById('trp-action-menu');
  if (existing) {
    existing.remove();
  }
  // Validate selection state
  if (!validateAndRestoreSelection()) {
    showNotification('Please select text in an editable area and try again', 'info');
    return;
  }
  
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString() : '';
  if (!selectedText || !selectedText.trim()) {
    showNotification('Please select some text to edit', 'info');
    return;
  }

  const rect = selection.rangeCount ? selection.getRangeAt(0).getBoundingClientRect() : null;
  const menu = document.createElement('div');
  menu.id = 'trp-action-menu';
  menu.style.cssText = `
    position: fixed;
    top: ${rect ? rect.bottom + 8 : 20}px;
    left: ${rect ? rect.left : 20}px;
    background: #111827;
    color: #ffffff;
    border: 1px solid #374151;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
    padding: 6px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
  `;

  const actions = [
    { id: 'rewrite-text', label: 'Rewrite' },
    { id: 'reword-text', label: 'Reword' },
    { id: 'improve-text', label: 'Improve' },
    { id: 'summarize-text', label: 'Summarize' }
  ];

  // Add Kuali notification action if we're on a Kuali page
  if (window.location.hostname.includes('kuali')) {
    actions.push({ id: 'kuali-notification', label: 'Generate Notification' });
  }

  actions.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      all: unset;
      cursor: pointer;
      padding: 6px 10px;
      margin: 2px;
      color: #e5e7eb;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 6px;
    `;
    btn.onmouseenter = () => { btn.style.background = '#374151'; };
    btn.onmouseleave = () => { btn.style.background = '#1f2937'; };
    btn.onclick = async () => {
      menu.remove();
      try {
        const config = await browser.storage.sync.get({
          apiKey: '',
          defaultTone: 'neutral',
          defaultLength: 'same',
          siteContexts: [],
          rewritePrompt: 'Rewrite the following text to make it clearer and more engaging. IMPORTANT: Return ONLY the rewritten text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the rewritten text:',
          rewordPrompt: 'Reword the following text using different vocabulary while maintaining the same meaning. IMPORTANT: Return ONLY the reworded text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the reworded text:',
          improvePrompt: 'Improve the following text by enhancing clarity, grammar, and flow. IMPORTANT: Return ONLY the improved text. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the improved text:',
          summarizePrompt: 'Provide a concise summary of the following text. IMPORTANT: Return ONLY the summary. Preserve any existing dashes, hyphens, or symbols that are part of the original text, but do not add new quotes, dashes, explanations, or any other text. Just return the summary:',
          kualiNotificationPrompt: 'You are an expert at creating professional email notifications for Kuali workflow systems. Based on the provided context and text, create a comprehensive email notification that includes separate fields for:\n\n1. **Subject Line**: A clear, concise subject that summarizes the notification\n2. **Greeting**: Professional greeting appropriate for the recipient\n3. **Main Message**: The core notification content in clear, professional language\n4. **Action Required**: What the recipient needs to do (if any)\n5. **Deadline**: When action is needed (if applicable)\n6. **Contact Information**: Who to contact for questions\n7. **Closing**: Professional closing statement\n\nFormat your response exactly as follows (replace the placeholder text with your content):\n\nSUBJECT: [Your subject line here]\nGREETING: [Your greeting here]\nMESSAGE: [Your main message here]\nACTION: [Action required here]\nDEADLINE: [Deadline here]\nCONTACT: [Contact info here]\nCLOSING: [Your closing here]\n\nContext: '
        });
        if (!config.apiKey) {
          showNotification('Set API key in extension options', 'error');
          return;
        }
        const action = id;
        const result = await processTextWithPerplexity(selectedText, action, config);
        
        // Try to replace the text
        let success = replaceSelectedText(result);
        
        // If first attempt fails, try to restore selection and retry once
        if (!success) {
          console.log('First replacement attempt failed, trying to restore selection and retry...');
          
          // Wait a bit for any DOM updates to settle
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Try to restore selection
          if (validateAndRestoreSelection()) {
            console.log('Selection restored, retrying replacement...');
            success = replaceSelectedText(result);
          }
        }
        
        if (success) {
          showNotification(`${label} done`, 'success');
        } else {
          showNotification(`Failed to replace text. Check console for details.`, 'error');
        }
      } catch (e) {
        console.error('Action failed:', e);
        showNotification('Action failed', 'error');
      }
    };
    menu.appendChild(btn);
  });

  document.body.appendChild(menu);

  const onDocClick = (ev) => {
    if (!menu.contains(ev.target)) {
      menu.remove();
      document.removeEventListener('mousedown', onDocClick, true);
    }
  };
  document.addEventListener('mousedown', onDocClick, true);
}

// Kuali-specific functions
function injectKualiContextInput() {
  // Look for "Step Label" or similar elements
  const stepLabelElements = document.querySelectorAll('label, span, div');
  let stepLabelElement = null;
  
  for (const element of stepLabelElements) {
    if (element.textContent && element.textContent.toLowerCase().includes('step label')) {
      stepLabelElement = element;
      break;
    }
  }
  
  if (!stepLabelElement) {
    console.log('Step Label element not found');
    return;
  }
  
  // Check if we already injected the input
  if (document.getElementById('kuali-context-input')) {
    return;
  }
  
  // Create the context input field
  const contextInput = document.createElement('div');
  contextInput.id = 'kuali-context-input';
  contextInput.style.cssText = `
    margin-bottom: 15px;
    padding: 10px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  `;
  
  const label = document.createElement('label');
  label.textContent = 'Email Notification Context:';
  label.style.cssText = `
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #495057;
  `;
  
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Describe what you want the email notification to be about...';
  textarea.style.cssText = `
    width: 100%;
    min-height: 80px;
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
  `;
  
  const generateBtn = document.createElement('button');
  generateBtn.textContent = 'Generate Notification';
  generateBtn.style.cssText = `
    margin-top: 8px;
    padding: 6px 12px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  generateBtn.onmouseenter = () => { generateBtn.style.background = '#0056b3'; };
  generateBtn.onmouseleave = () => { generateBtn.style.background = '#007bff'; };
  
  generateBtn.onclick = async () => {
    const context = textarea.value.trim();
    if (!context) {
      alert('Please provide context for the email notification');
      return;
    }
    
    try {
      const config = await browser.storage.sync.get({
        apiKey: '',
        kualiNotificationPrompt: ''
      });
      
      if (!config.apiKey) {
        alert('Please set your Perplexity API key in the extension options');
        return;
      }
      
      // Generate the notification
      const result = await processKualiNotification(context, config);
      if (result) {
        displayKualiNotificationResult(result);
      }
    } catch (error) {
      console.error('Failed to generate notification:', error);
      alert('Failed to generate notification: ' + error.message);
    }
  };
  
  contextInput.appendChild(label);
  contextInput.appendChild(textarea);
  contextInput.appendChild(generateBtn);
  
  // Insert the context input above the step label
  stepLabelElement.parentNode.insertBefore(contextInput, stepLabelElement);
}

async function processKualiNotification(context, config) {
  try {
    const prompt = config.kualiNotificationPrompt + context;
    
    const requestBody = {
      model: 'sonar',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    };
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error('Invalid response from API');
    }
  } catch (error) {
    console.error('Error processing Kuali notification:', error);
    throw error;
  }
}

function displayKualiNotificationResult(result) {
  // Parse the result into separate fields
  const fields = {};
  const lines = result.split('\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (value && value !== '[Your subject line here]' && value !== '[Your greeting here]' && 
          value !== '[Your main message here]' && value !== '[Action required here]' && 
          value !== '[Deadline here]' && value !== '[Contact info here]' && value !== '[Your closing here]') {
        fields[key.trim()] = value;
      }
    }
  }
  
  // Create a modal to display the results
  const modal = document.createElement('div');
  modal.id = 'kuali-notification-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;
  
  const title = document.createElement('h3');
  title.textContent = 'Generated Email Notification';
  title.style.cssText = `
    margin: 0 0 20px 0;
    color: #333;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  `;
  closeBtn.onclick = () => modal.remove();
  
  modalContent.appendChild(closeBtn);
  modalContent.appendChild(title);
  
  // Display each field
  Object.entries(fields).forEach(([key, value]) => {
    const fieldDiv = document.createElement('div');
    fieldDiv.style.cssText = `
      margin-bottom: 15px;
    `;
    
    const fieldLabel = document.createElement('label');
    fieldLabel.textContent = key + ':';
    fieldLabel.style.cssText = `
      display: block;
      font-weight: 500;
      margin-bottom: 5px;
      color: #495057;
    `;
    
    const fieldValue = document.createElement('div');
    fieldValue.textContent = value;
    fieldValue.style.cssText = `
      padding: 8px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      min-height: 20px;
      white-space: pre-wrap;
    `;
    
    fieldDiv.appendChild(fieldLabel);
    fieldDiv.appendChild(fieldValue);
    modalContent.appendChild(fieldDiv);
  });
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };
}
