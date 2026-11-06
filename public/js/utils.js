/**
 * Vignan Hostel Management System
 * Shared utility functions
 */

// ——— Toast Notification System ———
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(title, message = '', type = 'info', duration = 4000) {
    this.init();
    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16845B" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C83D45" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C88720" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2876B8" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        <div class="toast-title">${escapeHtml(title)}</div>
        ${message ? `<div class="toast-message">${escapeHtml(message)}</div>` : ''}
      </div>
      <span class="toast-close" onclick="this.parentElement.remove()">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(title, msg) { this.show(title, msg, 'success'); },
  error(title, msg)   { this.show(title, msg, 'error'); },
  warning(title, msg) { this.show(title, msg, 'warning'); },
  info(title, msg)    { this.show(title, msg, 'info'); }
};

// ——— Modal System ———
const Modal = {
  open(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      const firstInput = overlay.querySelector('input, select, textarea');
      if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }
  },

  close(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
};

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) Modal.closeAll();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') Modal.closeAll();
});

// ——— Confirm Dialog ———
function showConfirm(title, message, onConfirm, type = 'danger') {
  const existing = document.getElementById('confirmDialog');
  if (existing) existing.remove();

  const dialog = document.createElement('div');
  dialog.id = 'confirmDialog';
  dialog.className = 'modal-overlay confirm-dialog';
  dialog.innerHTML = `
    <div class="modal" style="max-width:440px;border-top-color:${type === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'}">
      <div class="modal-header">
        <h3 class="modal-title">${escapeHtml(title)}</h3>
      </div>
      <div class="modal-body">
        <p class="text-secondary">${escapeHtml(message)}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline-dark" onclick="this.closest('.modal-overlay').remove();document.body.style.overflow=''">Cancel</button>
        <button class="btn btn-${type === 'danger' ? 'danger' : 'warning'}" id="confirmBtn">${type === 'danger' ? 'Delete' : 'Confirm'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
  document.body.style.overflow = 'hidden';
  setTimeout(() => dialog.classList.add('active'), 10);

  document.getElementById('confirmBtn').addEventListener('click', () => {
    dialog.remove();
    document.body.style.overflow = '';
    onConfirm();
  });
}

// ——— Counter Animation ———
function animateCounter(el, target, duration = 1200) {
  const start = 0;
  const startTime = performance.now();
  const format = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Math.round(n).toLocaleString('en-IN');
  };
  const step = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = format(current);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = format(target);
  };
  requestAnimationFrame(step);
}

// ——— Format helpers ———
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

// ——— Status Badge Helpers ———
function getStatusBadge(status) {
  const map = {
    pending:        ['badge-yellow',  'Pending'],
    approved:       ['badge-green',   'Approved'],
    rejected:       ['badge-red',     'Rejected'],
    returned:       ['badge-blue',    'Returned'],
    overstayed:     ['badge-red',     'Overstayed'],
    in_progress:    ['badge-blue',    'In Progress'],
    resolved:       ['badge-green',   'Resolved'],
    closed:         ['badge-gray',    'Closed'],
    active:         ['badge-green',   'Active'],
    vacated:        ['badge-gray',    'Vacated'],
    available:      ['badge-green',   'Available'],
    occupied:       ['badge-red',     'Occupied'],
    partially_occupied: ['badge-yellow', 'Partial'],
    maintenance:    ['badge-gray',    'Maintenance'],
    paid:           ['badge-green',   'Paid'],
    partial:        ['badge-yellow',  'Partial'],
    overdue:        ['badge-red',     'Overdue'],
    success:        ['badge-green',   'Success'],
    failed:         ['badge-red',     'Failed'],
  };
  const [cls, label] = map[status] || ['badge-gray', status || '—'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function getPriorityBadge(priority) {
  const map = {
    low:    ['badge-blue',   'Low'],
    medium: ['badge-yellow', 'Medium'],
    high:   ['badge-red',    'High'],
    urgent: ['badge-red',    '🔴 Urgent'],
  };
  const [cls, label] = map[priority] || ['badge-gray', priority || '—'];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ——— Loading Skeleton ———
function showTableSkeleton(tbody, cols = 6, rows = 5) {
  const skeletonRow = Array(cols).fill(`<td><div class="skeleton" style="height:16px;width:80%;"></div></td>`).join('');
  tbody.innerHTML = Array(rows).fill(`<tr>${skeletonRow}</tr>`).join('');
}

// ——— Pagination Builder ———
function buildPagination(container, currentPage, totalPages, onPageChange) {
  container.innerHTML = '';
  if (totalPages <= 1) return;
  const createBtn = (label, page, active = false, disabled = false) => {
    const btn = document.createElement('button');
    btn.className = `page-btn${active ? ' active' : ''}`;
    btn.textContent = label;
    btn.disabled = disabled;
    if (!disabled && !active) btn.addEventListener('click', () => onPageChange(page));
    return btn;
  };
  container.appendChild(createBtn('«', 1, false, currentPage === 1));
  container.appendChild(createBtn('‹', currentPage - 1, false, currentPage === 1));
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    container.appendChild(createBtn(i, i, i === currentPage));
  }
  container.appendChild(createBtn('›', currentPage + 1, false, currentPage === totalPages));
  container.appendChild(createBtn('»', totalPages, false, currentPage === totalPages));
}

// ——— Form Helpers ———
function getFormData(formEl) {
  const data = {};
  new FormData(formEl).forEach((value, key) => { data[key] = value; });
  return data;
}

function setFormValues(formEl, data) {
  Object.entries(data).forEach(([key, value]) => {
    const el = formEl.querySelector(`[name="${key}"]`);
    if (el && value !== null && value !== undefined) el.value = value;
  });
}

function resetForm(formEl) {
  formEl.reset();
  formEl.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
  formEl.querySelectorAll('.form-error').forEach(el => el.remove());
}

function showFieldError(input, message) {
  input.classList.add('error');
  const existing = input.parentElement.querySelector('.form-error');
  if (existing) existing.remove();
  const err = document.createElement('div');
  err.className = 'form-error';
  err.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${escapeHtml(message)}`;
  input.parentElement.appendChild(err);
}

// ——— Lucide Icon helper ———
function icon(name, size = 16) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name}"><use href="#icon-${name}"/></svg>`;
}

// ——— Sidebar navigation ———
function initSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // Nav item click
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      navigateTo(section);
      // Close mobile sidebar
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    });
  });
}

function navigateTo(section) {
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.querySelector(`.nav-item[data-section="${section}"]`);
  if (activeNav) activeNav.classList.add('active');

  // Show/hide section panels
  document.querySelectorAll('.section-panel').forEach(el => el.classList.remove('active'));
  const panel = document.getElementById(`panel-${section}`);
  if (panel) {
    panel.classList.add('active');
    panel.classList.add('page-enter');
    setTimeout(() => panel.classList.remove('page-enter'), 400);
  }

  // Update breadcrumb
  const breadcrumb = document.getElementById('breadcrumbCurrent');
  if (breadcrumb && activeNav) breadcrumb.textContent = activeNav.querySelector('.nav-label')?.textContent || section;

  // Update page title
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle && activeNav) pageTitle.textContent = activeNav.querySelector('.nav-label')?.textContent || section;

  // Trigger section load event
  document.dispatchEvent(new CustomEvent('sectionChange', { detail: { section } }));
}

// ——— Notification Panel ———
function initNotificationPanel(loadFn) {
  const btn = document.getElementById('notifBtn');
  const panel = document.getElementById('notifPanel');
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && typeof loadFn === 'function') loadFn();
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('open');
  });
}

// ——— User Profile Menu ———
function initProfileMenu() {
  const btn = document.getElementById('profileMenuBtn');
  const menu = document.getElementById('profileDropdown');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) menu.classList.remove('open');
  });
}

// ——— Initialize user info in sidebar/header ———
function populateUserInfo() {
  const user = Auth.getUser();
  if (!user) return;
  const initials = user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  // Sidebar
  document.querySelectorAll('.sidebar-user-name').forEach(el => el.textContent = user.name);
  document.querySelectorAll('.sidebar-user-email').forEach(el => el.textContent = user.email);
  document.querySelectorAll('.sidebar-avatar').forEach(el => el.textContent = initials);
  document.querySelectorAll('.sidebar-role-name').forEach(el => {
    el.textContent = user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  });

  // Header
  document.querySelectorAll('.header-avatar').forEach(el => el.textContent = initials);
  document.querySelectorAll('.header-profile-name').forEach(el => el.textContent = user.name.split(' ')[0]);
}

// Export to global
window.Toast = Toast;
window.Modal = Modal;
window.showConfirm = showConfirm;
window.animateCounter = animateCounter;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatCurrency = formatCurrency;
window.escapeHtml = escapeHtml;
window.timeAgo = timeAgo;
window.getStatusBadge = getStatusBadge;
window.getPriorityBadge = getPriorityBadge;
window.showTableSkeleton = showTableSkeleton;
window.buildPagination = buildPagination;
window.getFormData = getFormData;
window.setFormValues = setFormValues;
window.resetForm = resetForm;
window.showFieldError = showFieldError;
window.initSidebar = initSidebar;
window.navigateTo = navigateTo;
window.initNotificationPanel = initNotificationPanel;
window.initProfileMenu = initProfileMenu;
window.populateUserInfo = populateUserInfo;
