/**
 * Gicons — Gmail Quick-Action Icons (Content Script v3)
 *
 * KEY ARCHITECTURE CHANGES (v3):
 *  - Self-contained overlay toolbar (no longer injects into Gmail's fragile <ul>)
 *  - ALL native actions use: select checkbox → click main toolbar button → deselect
 *  - Periodic scan every 2s as safety net for missed rows
 *  - Email-view toolbar with aggressive retry + hashchange listener
 */

(() => {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════════
   *  CONSTANTS
   * ═══════════════════════════════════════════════════════════════════════════ */

  const ALL_ACTIONS = [
    { id: 'archive',      label: 'Archive',            type: 'native',  ariaLabel: 'Archive' },
    { id: 'delete',       label: 'Delete',             type: 'native',  ariaLabel: 'Delete' },
    { id: 'markRead',     label: 'Mark as Read',       type: 'native',  ariaLabel: 'Mark as read' },
    { id: 'snooze',       label: 'Snooze',             type: 'native',  ariaLabel: 'Snooze' },
    { id: 'filterSender', label: 'Filter by Sender',   type: 'custom' },
    { id: 'filterDomain', label: 'Filter by Domain',   type: 'custom' },
    { id: 'copyEmail',    label: 'Copy Sender Email',  type: 'custom' },
    { id: 'markSpam',     label: 'Mark as Spam',       type: 'custom',  ariaLabel: 'Report spam' },
    { id: 'unsubscribe',  label: 'Quick Unsubscribe',  type: 'custom' },
  ];

  const ACTION_MAP = {};
  ALL_ACTIONS.forEach(a => { ACTION_MAP[a.id] = a; });

  const DEFAULT_ICONS = {
    archive:      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 5.99 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.51-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>',
    delete:       '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
    markRead:     '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    snooze:       '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-3-8h3.63L9 16.15V17h6v-1.5h-3.63L15 11.35V11H9v1.5z"/></svg>',
    filterSender: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>',
    filterDomain: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>',
    copyEmail:    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
    markSpam:     '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/></svg>',
    unsubscribe:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/><line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  };

  const DEFAULT_SETTINGS = {
    actionOrder: ['archive', 'delete', 'markRead', 'snooze', 'filterSender', 'filterDomain', 'copyEmail', 'markSpam', 'unsubscribe'],
    actionVisibility: {
      archive: true, delete: true, markRead: true, snooze: true,
      filterSender: true, filterDomain: true, copyEmail: true,
      markSpam: true, unsubscribe: true,
    },
    iconColor: '#5f6368',
    hoverBgColor: 'rgba(32,33,36,0.059)',
    iconSpacing: 0,
    toolbarPosition: 'right',
    maskBgColor: '#ffffff',
    customIcons: {},
    themePreset: 'graphite',
    keyboardShortcut: { ctrlKey: true, shiftKey: true, altKey: false, metaKey: false, key: 'f' },
  };

  const PROCESSED_FLAG = 'data-gicons-processed';
  let settings = { ...DEFAULT_SETTINGS };
  let hoveredRow = null;

  /* ═══════════════════════════════════════════════════════════════════════════
   *  SETTINGS
   * ═══════════════════════════════════════════════════════════════════════════ */

  function applyThemeVars() {
    const root = document.documentElement;
    root.style.setProperty('--gicons-color', settings.iconColor);
    root.style.setProperty('--gicons-hover-bg', settings.hoverBgColor);
    root.style.setProperty('--gicons-spacing', settings.iconSpacing + 'px');
    root.style.setProperty('--gicons-mask-bg', settings.maskBgColor);
  }

  async function loadSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS), (stored) => {
          if (chrome.runtime.lastError) {
            settings = { ...DEFAULT_SETTINGS };
          } else {
            settings = { ...DEFAULT_SETTINGS, ...stored };
          }
          ALL_ACTIONS.forEach(a => {
            if (settings.actionVisibility[a.id] === undefined) settings.actionVisibility[a.id] = true;
          });
          applyThemeVars();
          resolve();
        });
      } catch (e) {
        settings = { ...DEFAULT_SETTINGS };
        applyThemeVars();
        resolve();
      }
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const key of Object.keys(changes)) {
      if (key in DEFAULT_SETTINGS) settings[key] = changes[key].newValue;
    }
    applyThemeVars();
    reprocessAllRows();
    removeEmailViewToolbar();
  });

  /* ═══════════════════════════════════════════════════════════════════════════
   *  UTILITIES
   * ═══════════════════════════════════════════════════════════════════════════ */

  function extractSenderEmail(ctx) {
    if (ctx && ctx._senderEmail) return ctx._senderEmail;
    if (!ctx || !ctx.querySelector) return null;
    const s = ctx.querySelector('span[email]');
    if (s) { const e = s.getAttribute('email'); if (e && e.includes('@')) return e; }
    const h = ctx.querySelector('[data-hovercard-id]');
    if (h) { const e = h.getAttribute('data-hovercard-id'); if (e && e.includes('@')) return e; }
    const m = (ctx.textContent || '').match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
    return m ? m[0] : null;
  }

  function extractSenderFromEmailView() {
    const gd = document.querySelector('span.gD[email]');
    if (gd) return gd.getAttribute('email');
    const spans = document.querySelectorAll('span[email]');
    for (const s of spans) {
      const e = s.getAttribute('email');
      if (e && e.includes('@')) return e;
    }
    return null;
  }

  function extractDomain(email) {
    return (email && email.includes('@')) ? email.split('@')[1] : null;
  }

  /** Full pointer+mouse event chain for Gmail's Closure framework. */
  function realClick(el) {
    if (!el) return false;
    const o = { bubbles: true, cancelable: true, view: window };
    el.dispatchEvent(new PointerEvent('pointerdown', o));
    el.dispatchEvent(new MouseEvent('mousedown', o));
    el.dispatchEvent(new PointerEvent('pointerup', o));
    el.dispatchEvent(new MouseEvent('mouseup', o));
    el.dispatchEvent(new MouseEvent('click', o));
    return true;
  }

  function performGmailSearch(q) {
    window.location.hash = '#search/' + encodeURIComponent(q);
  }

  let toastTimer = null;
  function showToast(msg) {
    let t = document.querySelector('.gicons-toast');
    if (!t) { t = document.createElement('div'); t.className = 'gicons-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.remove('gicons-toast--visible');
    void t.offsetHeight;
    t.classList.add('gicons-toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('gicons-toast--visible'), 2500);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  NATIVE ACTION DISPATCH
   *  Reliable approach: select checkbox → click MAIN toolbar button → deselect
   * ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Executes a native Gmail action by:
   * 1. Selecting the row's checkbox (if not already selected)
   * 2. Finding the action button in Gmail's MAIN toolbar (the bar above the email list)
   * 3. Clicking it
   * 4. Deselecting the checkbox (if it wasn't selected before)
   */
  function executeNativeViaToolbar(row, ariaLabel) {
    const checkbox = row.querySelector('[role="checkbox"]');
    if (!checkbox) { showToast('Could not find row checkbox'); return; }

    const wasChecked = checkbox.getAttribute('aria-checked') === 'true';

    // Step 1: Select
    if (!wasChecked) realClick(checkbox);

    // Step 2: Wait for Gmail to update the main toolbar, then click
    const tryClick = (attempt) => {
      const labels = [ariaLabel];
      if (ariaLabel === 'Mark as read') labels.push('Mark as unread');
      if (ariaLabel === 'Mark as unread') labels.push('Mark as read');

      for (const label of labels) {
        const allBtns = document.querySelectorAll(`[aria-label="${label}"]`);
        for (const btn of allBtns) {
          // Skip buttons inside inbox rows and our own toolbars
          if (btn.closest('tr.zA')) continue;
          if (btn.closest('.gicons-row-toolbar')) continue;
          if (btn.closest('.gicons-email-toolbar')) continue;
          if (btn.closest('.gicons-toolbar-left')) continue;
          // This should be a main toolbar button
          realClick(btn);
          // Step 3: Deselect after action completes
          if (!wasChecked) setTimeout(() => realClick(checkbox), 300);
          return;
        }
      }

      // Retry up to 10 times
      if (attempt < 10) {
        setTimeout(() => tryClick(attempt + 1), 150);
      } else {
        showToast(ariaLabel + ' button not found');
        // Deselect to clean up
        if (!wasChecked) realClick(checkbox);
      }
    };

    setTimeout(() => tryClick(0), 150);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  ACTION EXECUTOR — INBOX ROWS
   * ═══════════════════════════════════════════════════════════════════════════ */

  function executeAction(actionId, context) {
    if (context && context._isEmailView) return executeEmailViewAction(actionId, context);
    const row = context;

    switch (actionId) {
      case 'archive':   executeNativeViaToolbar(row, 'Archive'); break;
      case 'delete':    executeNativeViaToolbar(row, 'Delete'); break;
      case 'markRead':  executeNativeViaToolbar(row, 'Mark as read'); break;
      case 'snooze':    executeNativeViaToolbar(row, 'Snooze'); break;

      case 'filterSender': {
        const e = extractSenderEmail(row);
        if (e) performGmailSearch('from:' + e); else showToast('Could not extract sender email');
        break;
      }
      case 'filterDomain': {
        const e = extractSenderEmail(row);
        const d = extractDomain(e);
        if (d) performGmailSearch('from:*@' + d); else showToast('Could not extract sender domain');
        break;
      }
      case 'copyEmail': {
        const e = extractSenderEmail(row);
        if (e) {
          navigator.clipboard.writeText(e).then(() => showToast('Copied: ' + e)).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = e; ta.style.cssText = 'position:fixed;opacity:0;';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy');
            document.body.removeChild(ta); showToast('Copied: ' + e);
          });
        } else showToast('Could not extract sender email');
        break;
      }
      case 'markSpam': executeNativeViaToolbar(row, 'Report spam'); break;

      case 'unsubscribe': {
        const link = row.querySelector('a[id]') || row.querySelector('.xT a') || row.querySelector('span.bog');
        if (link) {
          if (link.href) window.location.href = link.href; else realClick(link);
          setTimeout(findAndClickUnsubscribe, 2000);
        } else showToast('Could not open email');
        break;
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  ACTION EXECUTOR — EMAIL VIEW
   * ═══════════════════════════════════════════════════════════════════════════ */

  function executeEmailViewAction(actionId, ctx) {
    const sender = ctx._senderEmail || extractSenderFromEmailView();

    switch (actionId) {
      case 'archive': case 'delete': case 'snooze': case 'markSpam': {
        const a = ACTION_MAP[actionId];
        const btn = findEmailViewBtn(a.ariaLabel);
        if (btn) realClick(btn); else showToast(a.label + ' button not found');
        break;
      }
      case 'markRead': {
        const btn = findEmailViewBtn('Mark as unread') || findEmailViewBtn('Mark as read');
        if (btn) realClick(btn); else showToast('Mark as read/unread button not found');
        break;
      }
      case 'filterSender':
        if (sender) performGmailSearch('from:' + sender); else showToast('Could not extract sender');
        break;
      case 'filterDomain': {
        const d = extractDomain(sender);
        if (d) performGmailSearch('from:*@' + d); else showToast('Could not extract domain');
        break;
      }
      case 'copyEmail':
        if (sender) navigator.clipboard.writeText(sender).then(() => showToast('Copied: ' + sender)).catch(() => showToast('Copy failed'));
        else showToast('Could not extract sender');
        break;
      case 'unsubscribe': findAndClickUnsubscribe(); break;
    }
  }

  function findEmailViewBtn(ariaLabel) {
    const btns = document.querySelectorAll(`[aria-label="${ariaLabel}"]`);
    for (const b of btns) {
      if (b.closest('tr.zA')) continue;
      if (b.closest('.gicons-email-toolbar')) continue;
      if (b.closest('.gicons-row-toolbar')) continue;
      return b;
    }
    return null;
  }

  function findAndClickUnsubscribe() {
    for (const el of document.querySelectorAll('a, span[role="link"], button')) {
      if (el.textContent.trim().toLowerCase() === 'unsubscribe') { realClick(el); showToast('Unsubscribe triggered'); return; }
    }
    const a = document.querySelector('[aria-label*="nsubscribe" i]');
    if (a) { realClick(a); showToast('Unsubscribe triggered'); return; }
    showToast('No unsubscribe link found');
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  ICON BUTTON FACTORY
   * ═══════════════════════════════════════════════════════════════════════════ */

  function getIconSvg(actionId) {
    if (settings.customIcons && settings.customIcons[actionId]) {
      const u = settings.customIcons[actionId];
      if (u.startsWith('data:image/svg')) { try { return atob(u.split(',')[1]); } catch (e) { /* fall through */ } }
      return `<img src="${u}" width="20" height="20" style="pointer-events:none">`;
    }
    return DEFAULT_ICONS[actionId] || '';
  }

  function createIconButton(actionId, context) {
    const action = ACTION_MAP[actionId];
    if (!action) return null;
    const btn = document.createElement('button');
    btn.className = 'gicons-btn';
    btn.setAttribute('data-gicons-tooltip', action.label);
    btn.setAttribute('data-gicons-action', actionId);
    btn.setAttribute('type', 'button');
    btn.innerHTML = getIconSvg(actionId);

    const stop = (e) => { e.stopPropagation(); e.preventDefault(); };
    btn.addEventListener('mousedown', stop, true);
    btn.addEventListener('mouseup', stop, true);
    btn.addEventListener('pointerdown', (e) => e.stopPropagation(), true);
    btn.addEventListener('pointerup', (e) => e.stopPropagation(), true);
    btn.addEventListener('click', (e) => { stop(e); executeAction(actionId, context); }, true);
    return btn;
  }

  function getVisibleActions() {
    const order = settings.actionOrder || DEFAULT_SETTINGS.actionOrder;
    const vis = settings.actionVisibility || DEFAULT_SETTINGS.actionVisibility;
    return order.filter(id => vis[id] !== false && ACTION_MAP[id]);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  INBOX ROW INJECTION — SELF-CONTAINED OVERLAY
   *  No longer depends on finding Gmail's internal <ul> toolbar.
   * ═══════════════════════════════════════════════════════════════════════════ */

  function injectRightToolbar(row) {
    const toolbar = document.createElement('div');
    toolbar.className = 'gicons-row-toolbar';

    getVisibleActions().forEach(actionId => {
      const btn = createIconButton(actionId, row);
      if (btn) toolbar.appendChild(btn);
    });

    // Append directly to the row — Chrome renders this fine even though
    // strictly only <td>/<th> are valid children of <tr>.
    row.appendChild(toolbar);
  }

  function injectLeftToolbar(row) {
    let subjectCell = null;
    const xT = row.querySelector('.xT');
    if (xT) subjectCell = xT.closest('td') || xT.parentElement;
    if (!subjectCell) {
      for (const td of row.querySelectorAll('td')) {
        if (td.querySelector('.xT') || td.querySelector('.y6') || td.querySelector('.bog')) { subjectCell = td; break; }
      }
    }
    if (!subjectCell) { const tds = row.querySelectorAll('td'); if (tds.length >= 4) subjectCell = tds[3]; }
    if (!subjectCell) return;

    subjectCell.classList.add('gicons-subject-cell-relative');
    const toolbar = document.createElement('div');
    toolbar.className = 'gicons-toolbar-left';
    getVisibleActions().forEach(actionId => {
      const btn = createIconButton(actionId, row);
      if (btn) toolbar.appendChild(btn);
    });
    subjectCell.appendChild(toolbar);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  EMAIL-VIEW TOOLBAR
   * ═══════════════════════════════════════════════════════════════════════════ */

  function injectEmailViewToolbar() {
    if (document.querySelector('.gicons-email-toolbar')) return;

    // Must be in an email/thread view (hash like #inbox/FMfcg...)
    const h = window.location.hash;
    if (!h || !h.includes('/')) return;
    if (h === '#inbox' || h.startsWith('#settings') || h.startsWith('#label/') && !h.includes('/FMfcg')) return;
    // Must have at least one segment after the slash with a long-ish ID
    const parts = h.split('/');
    if (parts.length < 2 || parts[1].length < 8) return;

    // Strategy 1: Find toolbar via "Back to" button (most reliable in email view)
    let toolbar = null;
    const backBtns = document.querySelectorAll('[aria-label^="Back to"]');
    for (const btn of backBtns) {
      const p = btn.parentElement;
      if (p && !p.closest('tr.zA')) { toolbar = p; break; }
    }

    // Strategy 2: Find the container that has Archive + Delete + More (not in a row)
    if (!toolbar) {
      const archiveBtns = document.querySelectorAll('[aria-label="Archive"]');
      for (const btn of archiveBtns) {
        if (btn.closest('tr.zA') || btn.closest('.gicons-row-toolbar')) continue;
        const p = btn.parentElement;
        if (p && (p.querySelector('[aria-label="Delete"]') || p.querySelector('[aria-label="More"]'))) {
          toolbar = p; break;
        }
      }
    }

    // Strategy 3: role="toolbar" that isn't in a row
    if (!toolbar) {
      for (const tb of document.querySelectorAll('[role="toolbar"]')) {
        if (tb.closest('tr.zA')) continue;
        if (tb.querySelector('[aria-label="Archive"]') || tb.querySelector('[aria-label="Delete"]')) {
          toolbar = tb; break;
        }
      }
    }

    if (!toolbar) return;

    const sender = extractSenderFromEmailView();
    const emailCtx = { _isEmailView: true, _senderEmail: sender };

    const giconsToolbar = document.createElement('div');
    giconsToolbar.className = 'gicons-email-toolbar';

    getVisibleActions().forEach(actionId => {
      const btn = createIconButton(actionId, emailCtx);
      if (btn) giconsToolbar.appendChild(btn);
    });

    // Insert before "More" (⋮) button if found, else append
    const moreBtn = toolbar.querySelector('[aria-label="More"]');
    if (moreBtn) toolbar.insertBefore(giconsToolbar, moreBtn);
    else toolbar.appendChild(giconsToolbar);
  }

  function removeEmailViewToolbar() {
    const t = document.querySelector('.gicons-email-toolbar');
    if (t) t.remove();
  }

  function processEmailView() {
    if (!document.querySelector('.gicons-email-toolbar')) {
      injectEmailViewToolbar();
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  ROW PROCESSING
   * ═══════════════════════════════════════════════════════════════════════════ */

  function processRow(row) {
    if (row.hasAttribute(PROCESSED_FLAG)) return;
    row.setAttribute(PROCESSED_FLAG, 'true');
    row.addEventListener('mouseenter', () => { hoveredRow = row; });
    row.addEventListener('mouseleave', () => { if (hoveredRow === row) hoveredRow = null; });

    if (settings.toolbarPosition === 'left') injectLeftToolbar(row);
    else injectRightToolbar(row);
  }

  function cleanRow(row) {
    row.querySelectorAll('.gicons-row-toolbar, .gicons-toolbar-left').forEach(el => el.remove());
    row.querySelectorAll('.gicons-subject-cell-relative').forEach(td => td.classList.remove('gicons-subject-cell-relative'));
    row.removeAttribute(PROCESSED_FLAG);
  }

  function reprocessAllRows() {
    document.querySelectorAll(`tr.zA[${PROCESSED_FLAG}]`).forEach(row => { cleanRow(row); processRow(row); });
  }

  function scanAndProcessRows() {
    document.querySelectorAll(`tr.zA:not([${PROCESSED_FLAG}])`).forEach(row => processRow(row));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  MUTATION OBSERVER + PERIODIC SCAN
   * ═══════════════════════════════════════════════════════════════════════════ */

  let scanQueued = false;

  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    requestAnimationFrame(() => {
      scanQueued = false;
      scanAndProcessRows();
      processEmailView();
    });
  }

  function initObserver() {
    // Immediate scan
    scanAndProcessRows();
    processEmailView();

    // Observe DOM additions
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length > 0) { queueScan(); return; }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Safety net: periodic scan every 2s catches any rows the observer missed
    setInterval(() => {
      scanAndProcessRows();
      processEmailView();
    }, 2000);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  NAVIGATION — inbox ↔ email view
   * ═══════════════════════════════════════════════════════════════════════════ */

  function onHashChange() {
    removeEmailViewToolbar();
    setTimeout(() => { scanAndProcessRows(); processEmailView(); }, 500);
    setTimeout(processEmailView, 1500);
    setTimeout(processEmailView, 3000);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  KEYBOARD SHORTCUT
   * ═══════════════════════════════════════════════════════════════════════════ */

  function initKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      const sc = settings.keyboardShortcut || DEFAULT_SETTINGS.keyboardShortcut;
      if (!!sc.ctrlKey !== e.ctrlKey || !!sc.shiftKey !== e.shiftKey ||
          !!sc.altKey !== e.altKey || !!sc.metaKey !== e.metaKey) return;
      if (e.key.toLowerCase() !== (sc.key || '').toLowerCase()) return;
      e.preventDefault(); e.stopPropagation();

      const row = hoveredRow ||
                  document.querySelector('tr.zA[aria-selected="true"]') ||
                  document.querySelector('tr.zA.x7') ||
                  document.querySelector('tr.zA.zE');
      if (row) executeAction('filterSender', row);
      else showToast('Hover over an email to use this shortcut');
    }, true);
  }

  // Also listen for relay from background.js
  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'GICONS_SHORTCUT' && msg.action === 'filterSender') {
        const row = hoveredRow || document.querySelector('tr.zA.x7');
        if (row) executeAction('filterSender', row);
        else showToast('Hover over an email to use the shortcut');
      }
      return false;
    });
  } catch (e) { /* Extension context may not be available */ }

  /* ═══════════════════════════════════════════════════════════════════════════
   *  INIT
   * ═══════════════════════════════════════════════════════════════════════════ */

  async function init() {
    await loadSettings();
    initObserver();
    initKeyboardShortcut();
    window.addEventListener('hashchange', onHashChange);

    // Staggered retries for reliability
    setTimeout(scanAndProcessRows, 300);
    setTimeout(scanAndProcessRows, 1000);
    setTimeout(() => { scanAndProcessRows(); processEmailView(); }, 3000);
  }

  init();

})();
