/* ═══════════════════════════════════════════════════════════════════════════
   Gicons — Settings Page Logic (options.js)
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Shared Contract ────────────────────────────────────────────────────────

const ALL_ACTIONS = [
  { id: 'archive', label: 'Archive', type: 'native' },
  { id: 'delete', label: 'Delete', type: 'native' },
  { id: 'markRead', label: 'Mark as Read', type: 'native' },
  { id: 'snooze', label: 'Snooze', type: 'native' },
  { id: 'filterSender', label: 'Filter by Sender', type: 'custom' },
  { id: 'filterDomain', label: 'Filter by Domain', type: 'custom' },
  { id: 'copyEmail', label: 'Copy Sender Email', type: 'custom' },
  { id: 'markSpam', label: 'Mark as Spam', type: 'custom' },
  { id: 'unsubscribe', label: 'Quick Unsubscribe', type: 'custom' },
];

const DEFAULT_SETTINGS = {
  actionOrder: ['archive','delete','markRead','snooze','filterSender','filterDomain','copyEmail','markSpam','unsubscribe'],
  actionVisibility: {
    archive: true, delete: true, markRead: true, snooze: true,
    filterSender: true, filterDomain: true, copyEmail: true, markSpam: true, unsubscribe: true
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

const THEME_PRESETS = {
  blue:     { label: 'Google Blue',    iconColor: '#1a73e8', hoverBgColor: 'rgba(26,115,232,0.1)' },
  red:      { label: 'Ruby Red',       iconColor: '#d93025', hoverBgColor: 'rgba(217,48,37,0.1)' },
  graphite: { label: 'Dark Graphite',  iconColor: '#5f6368', hoverBgColor: 'rgba(32,33,36,0.059)' },
  green:    { label: 'Emerald Green',  iconColor: '#188038', hoverBgColor: 'rgba(24,128,56,0.1)' },
  custom:   { label: 'Custom',         iconColor: null,      hoverBgColor: null },
};

const DEFAULT_ICONS = {
  archive: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 5.99 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.51-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>',
  delete: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  markRead: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  snooze: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-3-8h3.63L9 16.15V17h6v-1.5h-3.63L15 11.35V11H9v1.5z"/></svg>',
  filterSender: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>',
  filterDomain: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>',
  copyEmail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>',
  markSpam: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/></svg>',
  unsubscribe: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-.77-3.37-2-4.46V16.46c1.23-1.09 2-2.69 2-4.46zM3.5 4l-1.41 1.41L7.18 10.5H3.5v3h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06c1.34-.3 2.57-.97 3.6-1.89l2.49 2.49L22 18.59l-18.5-14.59zM14.5 3.45v2.06c1.18.35 2.22 1 3.06 1.88l-1.43 1.43c-.56-.61-1.25-1.08-2.03-1.36V3.45c-.17-.03-.33-.05-.5-.05s-.33.02-.5.05v4.41l2 2V5.5c3.03 1.02 5 3.85 5 7 0 1.02-.2 2-.56 2.9l1.48 1.48c.6-1.32.98-2.78.98-4.38 0-4.63-3.32-8.49-7.7-9.35-.24-.05-.48-.1-.72-.13-.17-.02-.35-.02-.53-.02s-.36 0-.53.02c-.25.03-.49.08-.72.13z"/></svg>',
};

const CUSTOM_ACTION_IDS = ['filterSender', 'filterDomain', 'copyEmail', 'markSpam', 'unsubscribe'];

// ─── State ──────────────────────────────────────────────────────────────────

let currentSettings = structuredClone(DEFAULT_SETTINGS);
let dragSrcEl = null;

// ─── DOM References ─────────────────────────────────────────────────────────

const $ = (sel) => document.querySelector(sel);
const $id = (id) => document.getElementById(id);

// ─── Utilities ──────────────────────────────────────────────────────────────

/** Convert an rgba() string to the nearest hex (for color picker input). */
function rgbaToHex(rgba) {
  if (!rgba) return '#888888';
  if (rgba.startsWith('#')) return rgba;
  const match = rgba.match(/[\d.]+/g);
  if (!match || match.length < 3) return '#888888';
  const r = parseInt(match[0], 10);
  const g = parseInt(match[1], 10);
  const b = parseInt(match[2], 10);
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

/** Convert hex + optional alpha to rgba() string. */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Extract alpha from rgba string (default 0.15). */
function extractAlpha(rgba) {
  if (!rgba || !rgba.startsWith('rgba')) return 0.15;
  const match = rgba.match(/,\s*([\d.]+)\s*\)/);
  return match ? parseFloat(match[1]) : 0.15;
}

/** Deep clone helper. */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Get an action definition by id. */
function getActionDef(id) {
  return ALL_ACTIONS.find(a => a.id === id);
}

// ─── Toast Notification ─────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const container = $id('toastContainer');
  const icons = {
    success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    error:   '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4V7h2v6h-2z"/></svg>',
    info:    '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(toast);

  // Trigger reflow for animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('visible'));
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

// ─── Render: Action List ────────────────────────────────────────────────────

function renderActionList() {
  const list = $id('actionList');
  list.innerHTML = '';

  currentSettings.actionOrder.forEach(actionId => {
    const def = getActionDef(actionId);
    if (!def) return;

    const li = document.createElement('li');
    li.className = 'action-item';
    li.setAttribute('draggable', 'true');
    li.dataset.actionId = actionId;

    const isVisible = currentSettings.actionVisibility[actionId] !== false;
    const iconSvg = currentSettings.customIcons[actionId] || DEFAULT_ICONS[actionId] || '';
    const isCustomIcon = !!currentSettings.customIcons[actionId];

    // Build icon preview
    let iconPreviewHTML;
    if (isCustomIcon && currentSettings.customIcons[actionId].startsWith('data:')) {
      iconPreviewHTML = `<img src="${currentSettings.customIcons[actionId]}" alt="${def.label}">`;
    } else {
      iconPreviewHTML = iconSvg;
    }

    li.innerHTML = `
      <span class="drag-handle" aria-label="Drag to reorder">⋮⋮</span>
      <div class="action-icon-preview">${iconPreviewHTML}</div>
      <span class="action-label">${def.label}</span>
      <span class="action-badge ${def.type === 'custom' ? 'custom' : ''}">${def.type}</span>
      <label class="toggle-switch" title="Toggle visibility">
        <input type="checkbox" data-toggle-action="${actionId}" ${isVisible ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    `;

    // ── Drag events ──
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('dragenter', handleDragEnter);
    li.addEventListener('dragleave', handleDragLeave);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragend', handleDragEnd);

    // ── Toggle event ──
    const toggle = li.querySelector(`input[data-toggle-action="${actionId}"]`);
    toggle.addEventListener('change', () => {
      currentSettings.actionVisibility[actionId] = toggle.checked;
    });

    list.appendChild(li);
  });
}

// ─── Drag & Drop Handlers ───────────────────────────────────────────────────

function handleDragStart(e) {
  dragSrcEl = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.actionId);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  if (this !== dragSrcEl) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  this.classList.remove('drag-over');

  if (dragSrcEl === this) return;

  const srcId = dragSrcEl.dataset.actionId;
  const targetId = this.dataset.actionId;
  const order = [...currentSettings.actionOrder];
  const srcIdx = order.indexOf(srcId);
  const targetIdx = order.indexOf(targetId);

  if (srcIdx === -1 || targetIdx === -1) return;

  // Remove source and insert at target position
  order.splice(srcIdx, 1);
  const newTargetIdx = order.indexOf(targetId);
  order.splice(newTargetIdx + (srcIdx < targetIdx ? 1 : 0), 0, srcId);

  currentSettings.actionOrder = order;
  renderActionList();
}

function handleDragEnd() {
  // Clean up all drag classes
  document.querySelectorAll('.action-item').forEach(item => {
    item.classList.remove('dragging', 'drag-over');
  });
  dragSrcEl = null;
}

// ─── Render: Custom Icons Grid ──────────────────────────────────────────────

function renderCustomIconsGrid() {
  const grid = $id('customIconsGrid');
  grid.innerHTML = '';

  CUSTOM_ACTION_IDS.forEach(actionId => {
    const def = getActionDef(actionId);
    if (!def) return;

    const hasCustom = !!currentSettings.customIcons[actionId];
    const row = document.createElement('div');
    row.className = 'icon-upload-row';
    row.id = `iconRow-${actionId}`;

    let previewHTML;
    if (hasCustom && currentSettings.customIcons[actionId].startsWith('data:')) {
      previewHTML = `<img src="${currentSettings.customIcons[actionId]}" alt="${def.label}">`;
    } else {
      previewHTML = DEFAULT_ICONS[actionId] || '';
    }

    row.innerHTML = `
      <div class="icon-upload-preview" id="iconPreview-${actionId}">${previewHTML}</div>
      <div class="icon-upload-info">
        <div class="name">${def.label}</div>
        <div class="status" id="iconStatus-${actionId}">${hasCustom ? 'Custom icon uploaded' : 'Using default icon'}</div>
      </div>
      <div class="icon-upload-actions">
        <input type="file" class="file-input-hidden" id="iconFile-${actionId}" accept=".svg,.png" data-action-id="${actionId}">
        <button class="btn btn-sm btn-ghost" id="iconUploadBtn-${actionId}" title="Upload icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
          Upload
        </button>
        <button class="btn btn-sm btn-danger" id="iconResetBtn-${actionId}" title="Reset to default" style="display:${hasCustom ? 'inline-flex' : 'none'}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          Reset
        </button>
      </div>
    `;

    // Upload button click → trigger file input
    row.querySelector(`#iconUploadBtn-${actionId}`).addEventListener('click', () => {
      row.querySelector(`#iconFile-${actionId}`).click();
    });

    // File input change
    row.querySelector(`#iconFile-${actionId}`).addEventListener('change', (e) => {
      handleIconUpload(actionId, e.target.files[0]);
      e.target.value = ''; // reset so same file can be re-selected
    });

    // Reset button
    row.querySelector(`#iconResetBtn-${actionId}`).addEventListener('click', () => {
      delete currentSettings.customIcons[actionId];
      renderCustomIconsGrid();
      renderActionList(); // refresh preview in action list too
      showToast(`${def.label} icon reset to default`, 'info');
    });

    grid.appendChild(row);
  });
}

function handleIconUpload(actionId, file) {
  if (!file) return;

  const def = getActionDef(actionId);
  const validTypes = ['image/svg+xml', 'image/png'];
  const ext = file.name.split('.').pop().toLowerCase();

  // Validate type
  if (!validTypes.includes(file.type) && !['svg', 'png'].includes(ext)) {
    showToast('Only SVG and PNG files are allowed', 'error');
    return;
  }

  // Validate size (100KB max)
  if (file.size > 100 * 1024) {
    showToast('File must be under 100 KB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    currentSettings.customIcons[actionId] = e.target.result;
    renderCustomIconsGrid();
    renderActionList();
    showToast(`${def ? def.label : actionId} icon updated`, 'success');
  };
  reader.onerror = () => {
    showToast('Failed to read file', 'error');
  };
  reader.readAsDataURL(file);
}

// ─── Theme & Color Logic ────────────────────────────────────────────────────

function initThemeSection() {
  const presetSelect = $id('themePreset');
  const iconColorInput = $id('iconColor');
  const iconColorText = $id('iconColorText');
  const hoverBgColorInput = $id('hoverBgColor');
  const hoverBgColorText = $id('hoverBgColorText');

  // Populate from current settings
  presetSelect.value = currentSettings.themePreset || 'graphite';
  iconColorInput.value = currentSettings.iconColor || '#5f6368';
  iconColorText.value = currentSettings.iconColor || '#5f6368';
  hoverBgColorInput.value = rgbaToHex(currentSettings.hoverBgColor);
  hoverBgColorText.value = currentSettings.hoverBgColor || 'rgba(95,99,104,0.15)';

  updateColorPickerEditability();

  // Theme preset change
  presetSelect.addEventListener('change', () => {
    const presetKey = presetSelect.value;
    currentSettings.themePreset = presetKey;

    if (presetKey !== 'custom') {
      const preset = THEME_PRESETS[presetKey];
      currentSettings.iconColor = preset.iconColor;
      currentSettings.hoverBgColor = preset.hoverBgColor;
      iconColorInput.value = preset.iconColor;
      iconColorText.value = preset.iconColor;
      hoverBgColorInput.value = rgbaToHex(preset.hoverBgColor);
      hoverBgColorText.value = preset.hoverBgColor;
    }

    updateColorPickerEditability();
  });

  // Icon color picker
  iconColorInput.addEventListener('input', () => {
    const val = iconColorInput.value;
    iconColorText.value = val;
    currentSettings.iconColor = val;
    switchToCustomPreset();
  });

  // Icon color text input
  iconColorText.addEventListener('change', () => {
    const val = iconColorText.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      iconColorInput.value = val;
      currentSettings.iconColor = val;
      switchToCustomPreset();
    }
  });

  // Hover bg color picker
  hoverBgColorInput.addEventListener('input', () => {
    const hex = hoverBgColorInput.value;
    const alpha = extractAlpha(currentSettings.hoverBgColor);
    const rgba = hexToRgba(hex, alpha);
    hoverBgColorText.value = rgba;
    currentSettings.hoverBgColor = rgba;
    switchToCustomPreset();
  });

  // Hover bg color text input
  hoverBgColorText.addEventListener('change', () => {
    const val = hoverBgColorText.value.trim();
    currentSettings.hoverBgColor = val;
    // Try to sync color picker
    if (val.startsWith('#')) {
      hoverBgColorInput.value = val;
    } else if (val.startsWith('rgb')) {
      hoverBgColorInput.value = rgbaToHex(val);
    }
    switchToCustomPreset();
  });
}

function switchToCustomPreset() {
  const presetSelect = $id('themePreset');
  // Check if current colors match any preset
  const matchingPreset = Object.entries(THEME_PRESETS).find(([key, preset]) => {
    return key !== 'custom' &&
           preset.iconColor === currentSettings.iconColor &&
           preset.hoverBgColor === currentSettings.hoverBgColor;
  });

  if (matchingPreset) {
    currentSettings.themePreset = matchingPreset[0];
    presetSelect.value = matchingPreset[0];
  } else {
    currentSettings.themePreset = 'custom';
    presetSelect.value = 'custom';
  }
  updateColorPickerEditability();
}

function updateColorPickerEditability() {
  const isCustom = currentSettings.themePreset === 'custom';
  const iconColorInput = $id('iconColor');
  const iconColorText = $id('iconColorText');
  const hoverBgColorInput = $id('hoverBgColor');
  const hoverBgColorText = $id('hoverBgColorText');

  // Color pickers are always interactive, but non-custom presets auto-switch to custom on change
  // We visually indicate the state
  const opacity = isCustom ? '1' : '0.7';
  iconColorText.style.opacity = opacity;
  hoverBgColorText.style.opacity = opacity;
}

// ─── Layout Section ─────────────────────────────────────────────────────────

function initLayoutSection() {
  const positionSelect = $id('toolbarPosition');
  const spacingInput = $id('iconSpacing');
  const maskGroup = $id('maskColorGroup');
  const maskColorInput = $id('maskBgColor');
  const maskColorText = $id('maskBgColorText');

  positionSelect.value = currentSettings.toolbarPosition || 'right';
  spacingInput.value = currentSettings.iconSpacing ?? 2;
  maskColorInput.value = currentSettings.maskBgColor || '#ffffff';
  maskColorText.value = currentSettings.maskBgColor || '#ffffff';

  updateMaskVisibility();

  positionSelect.addEventListener('change', () => {
    currentSettings.toolbarPosition = positionSelect.value;
    updateMaskVisibility();
  });

  spacingInput.addEventListener('input', () => {
    let val = parseInt(spacingInput.value, 10);
    if (isNaN(val)) val = 2;
    val = Math.max(0, Math.min(20, val));
    currentSettings.iconSpacing = val;
  });

  maskColorInput.addEventListener('input', () => {
    maskColorText.value = maskColorInput.value;
    currentSettings.maskBgColor = maskColorInput.value;
  });

  maskColorText.addEventListener('change', () => {
    const val = maskColorText.value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      maskColorInput.value = val;
      currentSettings.maskBgColor = val;
    }
  });

  function updateMaskVisibility() {
    if (currentSettings.toolbarPosition === 'left') {
      maskGroup.classList.add('visible');
    } else {
      maskGroup.classList.remove('visible');
    }
  }
}

// ─── Keyboard Shortcut ──────────────────────────────────────────────────────

let isRecordingShortcut = false;
let recordingKeyHandler = null;

function initShortcutSection() {
  const recorder = $id('shortcutRecorder');
  const recordBtn = $id('recordShortcutBtn');
  const resetBtn = $id('resetShortcutBtn');

  // Ensure shortcut exists in currentSettings
  if (!currentSettings.keyboardShortcut) {
    currentSettings.keyboardShortcut = structuredClone(DEFAULT_SETTINGS.keyboardShortcut);
  }

  // Display the current shortcut
  updateShortcutDisplay(currentSettings.keyboardShortcut);

  // Record button
  recordBtn.addEventListener('click', () => {
    if (isRecordingShortcut) {
      stopRecording();
      return;
    }
    startRecording();
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    currentSettings.keyboardShortcut = structuredClone(DEFAULT_SETTINGS.keyboardShortcut);
    updateShortcutDisplay(currentSettings.keyboardShortcut);
    if (isRecordingShortcut) stopRecording();
    showToast('Shortcut reset to Ctrl + Shift + F', 'info');
  });

  function startRecording() {
    isRecordingShortcut = true;
    recorder.classList.add('recording');
    recordBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
      Press keys...
    `;

    recordingKeyHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore bare modifier-only presses
      const modifierKeys = ['Control', 'Shift', 'Alt', 'Meta'];
      if (modifierKeys.includes(e.key)) return;

      const shortcut = {
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        key: e.key.length === 1 ? e.key.toLowerCase() : e.key,
      };

      currentSettings.keyboardShortcut = shortcut;
      updateShortcutDisplay(shortcut);
      stopRecording();

      // Build display string for toast
      const parts = [];
      if (shortcut.ctrlKey) parts.push('Ctrl');
      if (shortcut.shiftKey) parts.push('Shift');
      if (shortcut.altKey) parts.push('Alt');
      if (shortcut.metaKey) parts.push('Meta');
      parts.push(shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);
      showToast(`Shortcut set to ${parts.join(' + ')}`, 'success');
    };

    document.addEventListener('keydown', recordingKeyHandler, true);
  }

  function stopRecording() {
    isRecordingShortcut = false;
    recorder.classList.remove('recording');
    recordBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg>
      Record Shortcut
    `;
    if (recordingKeyHandler) {
      document.removeEventListener('keydown', recordingKeyHandler, true);
      recordingKeyHandler = null;
    }
  }
}

function updateShortcutDisplay(shortcut) {
  const display = $id('shortcutKeysDisplay');
  display.innerHTML = '';

  const parts = [];
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push('Meta');
  parts.push(shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key);

  parts.forEach(label => {
    const kbd = document.createElement('kbd');
    kbd.textContent = label;
    display.appendChild(kbd);
  });
}

// ─── Save & Reset ───────────────────────────────────────────────────────────

function saveSettings() {
  // Sync spacing value from input (in case of direct typing)
  const spacingInput = $id('iconSpacing');
  let spacingVal = parseInt(spacingInput.value, 10);
  if (isNaN(spacingVal)) spacingVal = 2;
  spacingVal = Math.max(0, Math.min(20, spacingVal));
  currentSettings.iconSpacing = spacingVal;
  spacingInput.value = spacingVal;

  const dataToSave = deepClone(currentSettings);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(dataToSave, () => {
      showToast('Settings saved successfully!', 'success');
    });
  } else {
    // Fallback for testing outside extension context
    localStorage.setItem('gicons_settings', JSON.stringify(dataToSave));
    showToast('Settings saved (localStorage fallback)', 'success');
  }
}

function resetSettings() {
  const confirmed = confirm('Reset all settings to defaults? This cannot be undone.');
  if (!confirmed) return;

  currentSettings = structuredClone(DEFAULT_SETTINGS);

  const dataToSave = deepClone(currentSettings);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set(dataToSave, () => {
      populateUI();
      showToast('All settings reset to defaults', 'info');
    });
  } else {
    localStorage.setItem('gicons_settings', JSON.stringify(dataToSave));
    populateUI();
    showToast('All settings reset to defaults (localStorage fallback)', 'info');
  }
}

// ─── Populate UI from Settings ──────────────────────────────────────────────

function populateUI() {
  renderActionList();
  renderCustomIconsGrid();
  initThemeSection();
  initLayoutSection();
  initShortcutSection();
}

// ─── Load Settings & Initialize ─────────────────────────────────────────────

function loadSettings(callback) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS), (stored) => {
      // Merge stored values over defaults
      currentSettings = { ...structuredClone(DEFAULT_SETTINGS), ...stored };

      // Ensure actionVisibility has all keys
      const defaultVis = DEFAULT_SETTINGS.actionVisibility;
      currentSettings.actionVisibility = { ...defaultVis, ...(currentSettings.actionVisibility || {}) };

      // Ensure actionOrder contains all action IDs
      const allIds = ALL_ACTIONS.map(a => a.id);
      const storedOrder = currentSettings.actionOrder || [];
      // Keep stored order, append any missing IDs
      const orderSet = new Set(storedOrder);
      const fullOrder = [...storedOrder.filter(id => allIds.includes(id))];
      allIds.forEach(id => {
        if (!orderSet.has(id)) fullOrder.push(id);
      });
      currentSettings.actionOrder = fullOrder;

      // Ensure customIcons is an object
      if (!currentSettings.customIcons || typeof currentSettings.customIcons !== 'object') {
        currentSettings.customIcons = {};
      }

      callback();
    });
  } else {
    // Fallback for testing outside extension context
    try {
      const stored = JSON.parse(localStorage.getItem('gicons_settings') || '{}');
      currentSettings = { ...structuredClone(DEFAULT_SETTINGS), ...stored };
      currentSettings.actionVisibility = { ...DEFAULT_SETTINGS.actionVisibility, ...(currentSettings.actionVisibility || {}) };
      if (!currentSettings.customIcons || typeof currentSettings.customIcons !== 'object') {
        currentSettings.customIcons = {};
      }
    } catch {
      currentSettings = structuredClone(DEFAULT_SETTINGS);
    }
    callback();
  }
}

// ─── Boot ───────────────────────────────────────────────────────────────────

// ─── Theme Toggle (Settings Page) ───────────────────────────────────────────

const THEME_SUN_SVG = '<svg viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>';
const THEME_MOON_SVG = '<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>';

function initThemeToggle() {
  const theme = localStorage.getItem('gicons_settings_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);

  const btn = $id('themeToggleBtn');
  btn.innerHTML = theme === 'dark' ? THEME_MOON_SVG : THEME_SUN_SVG;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('gicons_settings_theme', next);
    btn.innerHTML = next === 'dark' ? THEME_MOON_SVG : THEME_SUN_SVG;
  });
}

// ─── Boot ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Apply theme immediately
  initThemeToggle();

  loadSettings(() => {
    populateUI();

    // Wire up footer buttons
    $id('btnSave').addEventListener('click', saveSettings);
    $id('btnReset').addEventListener('click', resetSettings);
  });
});
