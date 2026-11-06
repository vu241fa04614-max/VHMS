/**
 * Vignan Hostel Management System
 * Admin Dashboard Controller
 */

// Protect route — only super_admin and admin
if (!Auth.requireRole(['super_admin', 'admin'])) {
  // auth.js automatically redirects
}

let occupancyChart = null;
let complaintsChart = null;
let currentStudentsPage = 1;
let currentOutpassesPage = 1;
let currentComplaintsPage = 1;
let currentFeesPage = 1;

let cachedHostels = [];
let cachedBlocks = [];
let cachedRooms = [];

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initProfileMenu();
  populateUserInfo();
  initNotificationPanel(loadNotifications);

  // Initialize data
  loadDashboardOverview();
  preloadDropdownData();

  // Listen to section navigation
  document.addEventListener('sectionChange', (e) => {
    const section = e.detail.section;
    switch (section) {
      case 'overview':
        loadDashboardOverview();
        break;
      case 'students':
        loadStudents(1);
        break;
      case 'hostels':
        loadHostelsAndBlocks();
        break;
      case 'rooms':
        loadRooms();
        loadAllocations();
        break;
      case 'outpasses':
        loadOutpasses(1);
        break;
      case 'complaints':
        loadComplaints(1);
        break;
      case 'fees':
        loadFees(1);
        break;
      case 'mess':
        loadMessMenu();
        break;
      case 'staff':
        loadStaff();
        break;
      case 'announcements':
        loadAnnouncements();
        break;
      case 'reports':
        loadFullReports();
        break;
    }
  });

  // Global search handler
  document.getElementById('globalSearch')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) {
        navigateTo('students');
        document.getElementById('studentSearchInput').value = q;
        loadStudents(1);
      }
    }
  });
});

// ——— 1. DASHBOARD OVERVIEW & CHARTS ———
async function loadDashboardOverview() {
  try {
    const res = await api.getDashboardStats();
    if (res.success && res.data) {
      const d = res.data;
      animateCounter(document.getElementById('statTotalStudents'), d.totalStudents || 0);
      animateCounter(document.getElementById('statTotalRooms'), d.totalRooms || 0);
      animateCounter(document.getElementById('statOccupiedRooms'), d.occupiedRooms || 0);
      document.getElementById('statAvailableRooms').textContent = d.availableRooms || 0;
      document.getElementById('statOccupancyRate').textContent = `${d.occupancyRate || 0}% Occupancy`;

      animateCounter(document.getElementById('statPendingOutpasses'), d.pendingOutpasses || 0);
      animateCounter(document.getElementById('statPendingComplaints'), d.pendingComplaints || 0);

      document.getElementById('badgeOutpasses').textContent = d.pendingOutpasses || 0;
      document.getElementById('badgeComplaints').textContent = d.pendingComplaints || 0;

      document.getElementById('statFeeCollection').textContent = formatCurrency(d.feeCollection || 0);
      document.getElementById('statOutstandingFees').textContent = formatCurrency(d.outstandingFees || 0);
      document.getElementById('statTotalHostels').textContent = d.totalHostels || 2;

      // Render recent activity table
      renderActivityLogs(d.recentActivity || []);
    }

    // Render charts
    await Promise.all([renderOccupancyChart(), renderComplaintsChart()]);
  } catch (err) {
    Toast.error('Failed to load dashboard statistics', err.message);
  }
}

function renderActivityLogs(logs) {
  const tbody = document.getElementById('activityLogTbody');
  if (!logs || logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No recent activities recorded.</td></tr>';
    return;
  }
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td class="text-xs text-muted">${formatDateTime(l.createdAt)}</td>
      <td class="fw-bold">${escapeHtml(l.userId?.name || 'System Admin')}</td>
      <td><span class="badge badge-dark">${escapeHtml(l.action)}</span></td>
      <td><span class="badge badge-blue">${escapeHtml(l.module)}</span></td>
      <td class="text-secondary">${escapeHtml(l.description || '—')}</td>
    </tr>
  `).join('');
}

async function renderOccupancyChart() {
  const ctx = document.getElementById('chartOccupancy')?.getContext('2d');
  if (!ctx) return;
  try {
    const res = await api.getOccupancyStats();
    const data = res.data || [];
    const labels = data.map(d => d.hostelName);
    const occupied = data.map(d => d.occupied);
    const available = data.map(d => d.available);

    if (occupancyChart) occupancyChart.destroy();
    occupancyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Boys Hostel', 'Girls Hostel'],
        datasets: [
          {
            label: 'Occupied Beds',
            data: occupied.length ? occupied : [180, 140],
            backgroundColor: '#173F70',
            borderRadius: 0,
          },
          {
            label: 'Available Beds',
            data: available.length ? available : [120, 110],
            backgroundColor: '#16845B',
            borderRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans' } } }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, grid: { color: '#E9EDF2' } }
        }
      }
    });
  } catch (err) {
    console.error('Occupancy chart error:', err);
  }
}

async function renderComplaintsChart() {
  const ctx = document.getElementById('chartComplaints')?.getContext('2d');
  if (!ctx) return;
  try {
    const res = await api.getComplaintCategories();
    const data = res.data || [];
    const labels = data.map(d => (d._id || 'other').toUpperCase());
    const counts = data.map(d => d.count);

    if (complaintsChart) complaintsChart.destroy();
    complaintsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['ELECTRICAL', 'PLUMBING', 'WIFI', 'MESS'],
        datasets: [{
          data: counts.length ? counts : [5, 3, 4, 2],
          backgroundColor: ['#173F70', '#B32635', '#C69B45', '#16845B', '#245A91', '#C88720'],
          borderRadius: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 10, font: { family: 'Plus Jakarta Sans', size: 11 } } }
        }
      }
    });
  } catch (err) {
    console.error('Complaints chart error:', err);
  }
}

// ——— PRELOAD DROPDOWNS ———
async function preloadDropdownData() {
  try {
    const [hRes] = await Promise.all([api.getHostels()]);
    if (hRes.success) {
      cachedHostels = hRes.data || [];
      const opts = cachedHostels.map(h => `<option value="${h._id}">${escapeHtml(h.name)}</option>`).join('');
      
      const filterHostel = document.getElementById('studentFilterHostel');
      if (filterHostel) filterHostel.innerHTML = '<option value="">All Hostels</option>' + opts;

      const roomHostel = document.getElementById('roomFilterHostel');
      if (roomHostel) roomHostel.innerHTML = '<option value="">All Hostels</option>' + opts;

      const allocHostel = document.getElementById('allocSelectHostel');
      if (allocHostel) allocHostel.innerHTML = '<option value="">Select hostel...</option>' + opts;
    }
  } catch (err) {
    console.error('Preload error:', err);
  }
}

// ——— 2. STUDENT DIRECTORY ———
async function loadStudents(page = 1) {
  currentStudentsPage = page;
  const tbody = document.getElementById('studentTableBody');
  showTableSkeleton(tbody, 8, 5);

  const params = { page, limit: 10 };
  const search = document.getElementById('studentSearchInput')?.value.trim();
  const hostelId = document.getElementById('studentFilterHostel')?.value;
  const department = document.getElementById('studentFilterDept')?.value;
  const year = document.getElementById('studentFilterYear')?.value;

  if (search) params.search = search;
  if (hostelId) params.hostelId = hostelId;
  if (department) params.department = department;
  if (year) params.year = year;

  try {
    const res = await api.getStudents(params);
    if (res.success) {
      renderStudentsTable(res.data || []);
      buildPagination(
        document.getElementById('studentPagination'),
        res.page || 1,
        res.pages || 1,
        (p) => loadStudents(p)
      );
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderStudentsTable(students) {
  const tbody = document.getElementById('studentTableBody');
  if (!students.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No students found matching current filters.</td></tr>';
    return;
  }
  tbody.innerHTML = students.map(s => `
    <tr>
      <td class="text-mono fw-bold">${escapeHtml(s.registrationNumber)}</td>
      <td>
        <div class="fw-bold">${escapeHtml(s.userId?.name || '—')}</div>
        <div class="text-xs text-muted">${escapeHtml(s.userId?.email || '—')}</div>
      </td>
      <td>${escapeHtml(s.hostelId?.name || 'Unassigned')}</td>
      <td>
        ${s.roomId ? `<span class="badge badge-blue">Room ${escapeHtml(s.roomId.roomNumber)}</span>` : '<span class="badge badge-gray">None</span>'}
      </td>
      <td class="text-xs">${escapeHtml(s.department || '—')}</td>
      <td>Year ${s.year}</td>
      <td class="text-mono text-xs">${escapeHtml(s.userId?.phone || s.parentPhone || '—')}</td>
      <td>
        <div class="flex gap-xs">
          <button class="btn btn-outline-dark btn-sm" onclick="viewStudentDetails('${s._id}')">View</button>
          <button class="btn btn-ghost btn-sm text-danger" onclick="confirmDeleteStudent('${s._id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function resetStudentFilters() {
  document.getElementById('studentSearchInput').value = '';
  document.getElementById('studentFilterHostel').value = '';
  document.getElementById('studentFilterDept').value = '';
  document.getElementById('studentFilterYear').value = '';
  loadStudents(1);
}

function openNewStudentModal() {
  resetForm(document.getElementById('formNewStudent'));
  Modal.open('modalNewStudent');
}

async function handleCreateStudent(e) {
  e.preventDefault();
  const form = document.getElementById('formNewStudent');
  const data = getFormData(form);

  try {
    const res = await api.createStudent(data);
    if (res.success) {
      Toast.success('Student Registered', `${data.name} was successfully enrolled.`);
      Modal.close('modalNewStudent');
      loadStudents(1);
      loadDashboardOverview();
    }
  } catch (err) {
    Toast.error('Registration Failed', err.message);
  }
}

function confirmDeleteStudent(studentId) {
  showConfirm(
    'Deactivate Student',
    'Are you sure you want to deactivate this student account? This will release their allocated room and prevent portal login.',
    async () => {
      try {
        await api.deleteStudent(studentId);
        Toast.success('Student Deactivated', 'The record has been deactivated.');
        loadStudents(currentStudentsPage);
        loadDashboardOverview();
      } catch (err) {
        Toast.error('Deactivation Failed', err.message);
      }
    }
  );
}

// ——— 3. HOSTELS & BLOCKS ———
async function loadHostelsAndBlocks() {
  try {
    const [hRes, bRes] = await Promise.all([api.getHostels(), api.getBlocks()]);
    if (hRes.success) renderHostelCards(hRes.data || []);
    if (bRes.success) renderBlockTable(bRes.data || []);
  } catch (err) {
    Toast.error('Failed to load hostel data', err.message);
  }
}

function renderHostelCards(hostels) {
  const container = document.getElementById('hostelCardsContainer');
  if (!hostels.length) {
    container.innerHTML = '<div class="card p-lg text-muted">No hostels registered.</div>';
    return;
  }
  container.innerHTML = hostels.map(h => {
    const stats = h.liveStats || {};
    const occPct = stats.totalCapacity ? Math.round((stats.totalOccupied / stats.totalCapacity) * 100) : 0;
    return `
      <div class="card" style="border-top:3px solid ${h.type === 'boys' ? 'var(--color-royal-blue)' : 'var(--color-crimson)'};">
        <div class="card-header">
          <div>
            <span class="badge ${h.type === 'boys' ? 'badge-blue' : 'badge-red'}">${h.type.toUpperCase()} HOSTEL</span>
            <h3 class="card-title mt-xs">${escapeHtml(h.name)}</h3>
          </div>
          <span class="text-mono text-sm fw-bold">${escapeHtml(h.code)}</span>
        </div>
        <div class="grid grid-3 gap-sm mb-md text-center">
          <div class="p-sm" style="background:var(--bg-secondary);">
            <div class="text-xs text-muted text-upper">Capacity</div>
            <div class="text-xl fw-bold">${stats.totalCapacity || h.totalCapacity}</div>
          </div>
          <div class="p-sm" style="background:var(--bg-secondary);">
            <div class="text-xs text-muted text-upper">Occupied</div>
            <div class="text-xl fw-bold text-danger">${stats.totalOccupied || 0}</div>
          </div>
          <div class="p-sm" style="background:var(--bg-secondary);">
            <div class="text-xs text-muted text-upper">Available</div>
            <div class="text-xl fw-bold text-success">${stats.available || 0}</div>
          </div>
        </div>
        <div class="mb-sm">
          <div class="flex justify-between text-xs mb-xs">
            <span class="text-muted">Occupancy</span>
            <span class="fw-bold">${occPct}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar ${occPct > 85 ? 'danger' : occPct > 60 ? 'warning' : 'success'}" style="width:${occPct}%"></div>
          </div>
        </div>
        <div class="text-xs text-secondary mt-md">
          <div><strong>Warden:</strong> ${escapeHtml(h.wardenId?.name || 'Not assigned')} (${escapeHtml(h.contactPhone || '—')})</div>
          <div><strong>Facilities:</strong> ${(h.facilities || []).join(', ')}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderBlockTable(blocks) {
  const tbody = document.getElementById('blockTableBody');
  if (!blocks.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No blocks created yet.</td></tr>';
    return;
  }
  tbody.innerHTML = blocks.map(b => `
    <tr>
      <td class="fw-bold">${escapeHtml(b.hostelId?.name || '—')}</td>
      <td>${escapeHtml(b.name)}</td>
      <td class="text-mono fw-bold">${escapeHtml(b.code)}</td>
      <td>${b.floors} Floors</td>
      <td>${b.totalRooms} Rooms</td>
      <td>${getStatusBadge(b.isActive ? 'active' : 'maintenance')}</td>
      <td>
        <button class="btn btn-outline-dark btn-sm" onclick="navigateTo('rooms')">View Rooms</button>
      </td>
    </tr>
  `).join('');
}

// ——— 4. ROOM DIRECTORY & ALLOCATIONS ———
function switchRoomTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('roomTab-directory').classList.toggle('active', tab === 'directory');
  document.getElementById('roomTab-allocations').classList.toggle('active', tab === 'allocations');
}

async function loadBlocksForRoomFilter() {
  const hostelId = document.getElementById('roomFilterHostel')?.value;
  const select = document.getElementById('roomFilterBlock');
  if (!hostelId) {
    select.innerHTML = '<option value="">All Blocks</option>';
    return;
  }
  try {
    const res = await api.getBlocks(hostelId);
    if (res.success) {
      select.innerHTML = '<option value="">All Blocks</option>' +
        (res.data || []).map(b => `<option value="${b._id}">${escapeHtml(b.name)}</option>`).join('');
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadRooms() {
  const tbody = document.getElementById('roomTableBody');
  const grid = document.getElementById('roomVisualGrid');
  showTableSkeleton(tbody, 9, 5);

  const params = {};
  const hostelId = document.getElementById('roomFilterHostel')?.value;
  const blockId = document.getElementById('roomFilterBlock')?.value;
  const status = document.getElementById('roomFilterStatus')?.value;

  if (hostelId) params.hostelId = hostelId;
  if (blockId) params.blockId = blockId;
  if (status) params.status = status;

  try {
    const res = await api.getRooms(params);
    if (res.success) {
      cachedRooms = res.data || [];
      renderRoomsTable(cachedRooms);
      renderRoomMatrix(cachedRooms);
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderRoomsTable(rooms) {
  const tbody = document.getElementById('roomTableBody');
  if (!rooms.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No rooms match filter.</td></tr>';
    return;
  }
  tbody.innerHTML = rooms.map(r => `
    <tr>
      <td class="text-mono fw-bold">${escapeHtml(r.roomNumber)}</td>
      <td>${escapeHtml(r.hostelId?.name || '—')} / ${escapeHtml(r.blockId?.name || '—')}</td>
      <td>Floor ${r.floor}</td>
      <td class="text-upper text-xs">${r.type}</td>
      <td>${r.capacity}</td>
      <td class="fw-bold">${r.currentOccupancy}</td>
      <td class="fw-bold ${r.capacity - r.currentOccupancy > 0 ? 'text-success' : 'text-danger'}">
        ${r.capacity - r.currentOccupancy}
      </td>
      <td>${getStatusBadge(r.status)}</td>
      <td class="text-mono">${formatCurrency(r.monthlyFee)}</td>
    </tr>
  `).join('');
}

function renderRoomMatrix(rooms) {
  const grid = document.getElementById('roomVisualGrid');
  if (!rooms.length) {
    grid.innerHTML = '<div class="text-muted p-md">No rooms to display.</div>';
    return;
  }
  grid.innerHTML = rooms.map(r => {
    let cls = 'available';
    if (r.status === 'occupied') cls = 'occupied';
    else if (r.status === 'partially_occupied') cls = 'partial';
    else if (r.status === 'maintenance') cls = 'maintenance';

    return `
      <div class="room-cell ${cls}" title="${escapeHtml(r.roomNumber)} (${r.currentOccupancy}/${r.capacity} beds)">
        <div>${escapeHtml(r.roomNumber)}</div>
        <div style="font-size:10px;font-weight:400;">${r.currentOccupancy}/${r.capacity}</div>
      </div>
    `;
  }).join('');
}

async function loadAllocations() {
  const tbody = document.getElementById('allocationsTableBody');
  showTableSkeleton(tbody, 8, 5);
  try {
    const res = await api.getAllocations();
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No room allocations recorded yet.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(a => `
        <tr>
          <td class="fw-bold">${escapeHtml(a.studentId?.userId?.name || '—')}</td>
          <td class="text-mono">${escapeHtml(a.studentId?.registrationNumber || '—')}</td>
          <td>${escapeHtml(a.hostelId?.name || '—')}</td>
          <td><span class="badge badge-blue">Room ${escapeHtml(a.roomId?.roomNumber || '—')}</span></td>
          <td class="text-mono">${escapeHtml(a.bedNumber || '—')}</td>
          <td class="text-xs">${formatDate(a.allocationDate)}</td>
          <td>${getStatusBadge(a.status)}</td>
          <td>
            ${a.status === 'active' ? `
              <button class="btn btn-ghost btn-sm text-danger" onclick="vacateStudentRoom('${a._id}')">Vacate Bed</button>
            ` : '—'}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function openAllocateRoomModal() {
  try {
    // Fetch unallocated students
    const sRes = await api.getStudents({ limit: 100 });
    const selectStudent = document.getElementById('allocSelectStudent');
    const unallocated = (sRes.data || []).filter(s => !s.roomId);

    selectStudent.innerHTML = '<option value="">Select an unassigned student...</option>' +
      unallocated.map(s => `<option value="${s._id}">${escapeHtml(s.userId?.name)} (${escapeHtml(s.registrationNumber)})</option>`).join('');

    Modal.open('modalAllocateRoom');
  } catch (err) {
    Toast.error('Error', err.message);
  }
}

async function onAllocHostelChange() {
  const hostelId = document.getElementById('allocSelectHostel')?.value;
  const blockSelect = document.getElementById('allocSelectBlock');
  if (!hostelId) {
    blockSelect.innerHTML = '<option value="">Select block...</option>';
    return;
  }
  const res = await api.getBlocks(hostelId);
  blockSelect.innerHTML = '<option value="">Select block...</option>' +
    (res.data || []).map(b => `<option value="${b._id}">${escapeHtml(b.name)}</option>`).join('');
}

async function onAllocBlockChange() {
  const blockId = document.getElementById('allocSelectBlock')?.value;
  const roomSelect = document.getElementById('allocSelectRoom');
  if (!blockId) {
    roomSelect.innerHTML = '<option value="">Select room...</option>';
    return;
  }
  const res = await api.getRooms({ blockId });
  const availableRooms = (res.data || []).filter(r => r.currentOccupancy < r.capacity && r.status !== 'maintenance');
  roomSelect.innerHTML = '<option value="">Select room...</option>' +
    availableRooms.map(r => `<option value="${r._id}">Room ${escapeHtml(r.roomNumber)} (${r.capacity - r.currentOccupancy} beds free)</option>`).join('');
}

async function handleAllocateRoom(e) {
  e.preventDefault();
  const form = document.getElementById('formAllocateRoom');
  const data = getFormData(form);

  try {
    const res = await api.createAllocation(data);
    if (res.success) {
      Toast.success('Room Allocated', 'Student bed assignment successfully confirmed.');
      Modal.close('modalAllocateRoom');
      loadRooms();
      loadAllocations();
      loadDashboardOverview();
    }
  } catch (err) {
    Toast.error('Allocation Error', err.message);
  }
}

function vacateStudentRoom(allocId) {
  showConfirm(
    'Vacate Bed Allocation',
    'Are you sure you want to mark this allocation as vacated? The bed will immediately become available in the room matrix.',
    async () => {
      try {
        await api.vacateAllocation(allocId, { remarks: 'Vacated by Administration' });
        Toast.success('Room Vacated', 'The bed is now marked as available.');
        loadAllocations();
        loadRooms();
        loadDashboardOverview();
      } catch (err) {
        Toast.error('Error', err.message);
      }
    }
  );
}

// ——— 5. OUTPASS REVIEW WORKFLOW ———
async function loadOutpasses(page = 1) {
  currentOutpassesPage = page;
  const tbody = document.getElementById('outpassTableBody');
  showTableSkeleton(tbody, 9, 5);

  const status = document.getElementById('outpassFilterStatus')?.value;
  const params = { page, limit: 10 };
  if (status) params.status = status;

  try {
    const res = await api.getOutpasses(params);
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No outpass requests found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(o => `
        <tr>
          <td>
            <div class="fw-bold">${escapeHtml(o.studentId?.userId?.name || '—')}</div>
            <div class="text-xs text-muted">${escapeHtml(o.studentId?.registrationNumber || '—')}</div>
          </td>
          <td>${escapeHtml(o.hostelId?.name || '—')}</td>
          <td><span class="badge badge-dark text-upper">${o.type}</span></td>
          <td>${escapeHtml(o.purpose)}</td>
          <td>${escapeHtml(o.destination || '—')}</td>
          <td class="text-xs">${formatDateTime(o.departureDate)}</td>
          <td class="text-xs">${formatDateTime(o.expectedReturnDate)}</td>
          <td>${getStatusBadge(o.status)}</td>
          <td>
            ${o.status === 'pending' ? `
              <button class="btn btn-primary btn-sm" onclick="openReviewOutpassModal('${o._id}', '${escapeHtml(o.studentId?.userId?.name)}', '${o.type}', '${escapeHtml(o.purpose)}')">Review</button>
            ` : o.status === 'approved' ? `
              <button class="btn btn-outline-dark btn-sm" onclick="markOutpassReturned('${o._id}')">Mark Return</button>
            ` : '—'}
          </td>
        </tr>
      `).join('');

      buildPagination(
        document.getElementById('outpassPagination'),
        res.page || 1,
        res.pages || 1,
        (p) => loadOutpasses(p)
      );
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openReviewOutpassModal(id, studentName, type, purpose) {
  document.getElementById('reviewOutpassId').value = id;
  document.getElementById('reviewOutpassDetails').innerHTML = `
    <strong>Student:</strong> ${studentName}<br/>
    <strong>Leave Type:</strong> ${type.toUpperCase()}<br/>
    <strong>Purpose:</strong> ${purpose}
  `;
  document.getElementById('rejectionReasonGroup').style.display = 'none';
  Modal.open('modalReviewOutpass');
}

function toggleRejectionReason() {
  const val = document.getElementById('reviewOutpassDecision').value;
  document.getElementById('rejectionReasonGroup').style.display = val === 'rejected' ? 'block' : 'none';
}

async function handleReviewOutpass(e) {
  e.preventDefault();
  const id = document.getElementById('reviewOutpassId').value;
  const status = document.getElementById('reviewOutpassDecision').value;
  const remarks = document.getElementById('reviewRemarks').value;
  const rejectionReason = document.getElementById('reviewRejectionReason').value;

  try {
    const res = await api.reviewOutpass(id, { status, remarks, rejectionReason });
    if (res.success) {
      Toast.success('Decision Recorded', `Outpass marked as ${status}.`);
      Modal.close('modalReviewOutpass');
      loadOutpasses(currentOutpassesPage);
      loadDashboardOverview();
    }
  } catch (err) {
    Toast.error('Review Error', err.message);
  }
}

async function markOutpassReturned(id) {
  try {
    const res = await api.markReturn(id);
    if (res.success) {
      Toast.success('Student Returned', 'Movement record updated to returned.');
      loadOutpasses(currentOutpassesPage);
    }
  } catch (err) {
    Toast.error('Error', err.message);
  }
}

// ——— 6. COMPLAINTS RESOLUTION ———
async function loadComplaints(page = 1) {
  currentComplaintsPage = page;
  const tbody = document.getElementById('complaintTableBody');
  showTableSkeleton(tbody, 8, 5);

  const category = document.getElementById('complaintFilterCategory')?.value;
  const status = document.getElementById('complaintFilterStatus')?.value;
  const params = { page, limit: 10 };
  if (category) params.category = category;
  if (status) params.status = status;

  try {
    const res = await api.getComplaints(params);
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No maintenance complaints found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(c => `
        <tr>
          <td class="text-mono text-xs fw-bold">${escapeHtml(c.complaintNumber)}</td>
          <td>${escapeHtml(c.studentId?.userId?.name || '—')}</td>
          <td><span class="badge badge-blue text-upper">${c.category}</span></td>
          <td>
            <div class="fw-bold">${escapeHtml(c.title)}</div>
            <div class="text-xs text-muted" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${escapeHtml(c.description)}
            </div>
          </td>
          <td>${getPriorityBadge(c.priority)}</td>
          <td class="text-xs">${formatDate(c.createdAt)}</td>
          <td>${getStatusBadge(c.status)}</td>
          <td>
            <button class="btn btn-outline-dark btn-sm" onclick="openReviewComplaintModal('${c._id}', '${escapeHtml(c.complaintNumber)}', '${escapeHtml(c.title)}', '${c.status}')">Update</button>
          </td>
        </tr>
      `).join('');

      buildPagination(
        document.getElementById('complaintPagination'),
        res.page || 1,
        res.pages || 1,
        (p) => loadComplaints(p)
      );
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openReviewComplaintModal(id, ticketNo, title, status) {
  document.getElementById('reviewComplaintId').value = id;
  document.getElementById('reviewComplaintDetails').innerHTML = `
    <strong>Ticket:</strong> ${ticketNo}<br/>
    <strong>Title:</strong> ${title}
  `;
  document.getElementById('reviewComplaintStatus').value = status;
  Modal.open('modalReviewComplaint');
}

async function handleReviewComplaint(e) {
  e.preventDefault();
  const id = document.getElementById('reviewComplaintId').value;
  const status = document.getElementById('reviewComplaintStatus').value;
  const resolutionDetails = document.getElementById('reviewComplaintNotes').value;

  try {
    const res = await api.updateComplaintStatus(id, { status, resolutionDetails });
    if (res.success) {
      Toast.success('Ticket Updated', `Status changed to ${status}.`);
      Modal.close('modalReviewComplaint');
      loadComplaints(currentComplaintsPage);
      loadDashboardOverview();
    }
  } catch (err) {
    Toast.error('Update Error', err.message);
  }
}

// ——— 7. FEES & PAYMENTS ———
async function loadFees(page = 1) {
  currentFeesPage = page;
  const tbody = document.getElementById('feeTableBody');
  showTableSkeleton(tbody, 9, 5);

  const status = document.getElementById('feeFilterStatus')?.value;
  const params = { page, limit: 10 };
  if (status) params.status = status;

  try {
    const res = await api.getFees(params);
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No fee records found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(f => `
        <tr>
          <td>
            <div class="fw-bold">${escapeHtml(f.studentId?.userId?.name || '—')}</div>
            <div class="text-xs text-muted">${escapeHtml(f.studentId?.registrationNumber || '—')}</div>
          </td>
          <td>${escapeHtml(f.hostelId?.name || '—')}</td>
          <td>Sem ${f.semester} (${escapeHtml(f.academicYear)})</td>
          <td class="text-mono fw-bold">${formatCurrency(f.totalFee)}</td>
          <td class="text-mono text-success">${formatCurrency(f.paidAmount)}</td>
          <td class="text-mono text-danger fw-bold">${formatCurrency(f.outstandingAmount)}</td>
          <td class="text-xs">${formatDate(f.dueDate)}</td>
          <td>${getStatusBadge(f.status)}</td>
          <td>
            ${f.outstandingAmount > 0 ? `
              <button class="btn btn-outline-dark btn-sm" onclick="quickFillPayment('${f._id}', ${f.outstandingAmount})">Pay</button>
            ` : '<span class="text-xs text-success fw-bold">Settled</span>'}
          </td>
        </tr>
      `).join('');

      buildPagination(
        document.getElementById('feePagination'),
        res.page || 1,
        res.pages || 1,
        (p) => loadFees(p)
      );
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function openRecordPaymentModal() {
  try {
    const fRes = await api.getFees({ limit: 50 });
    const pendingFees = (fRes.data || []).filter(f => f.outstandingAmount > 0);
    const select = document.getElementById('paymentSelectFee');

    select.innerHTML = '<option value="">Select pending invoice...</option>' +
      pendingFees.map(f => `
        <option value="${f._id}">
          ${escapeHtml(f.studentId?.userId?.name)} — Outstanding: ₹${f.outstandingAmount}
        </option>
      `).join('');

    Modal.open('modalRecordPayment');
  } catch (err) {
    Toast.error('Error', err.message);
  }
}

function quickFillPayment(feeId, amount) {
  openRecordPaymentModal().then(() => {
    document.getElementById('paymentSelectFee').value = feeId;
    document.querySelector('#formRecordPayment input[name="amount"]').value = amount;
  });
}

async function handleRecordPayment(e) {
  e.preventDefault();
  const form = document.getElementById('formRecordPayment');
  const data = getFormData(form);
  data.amount = Number(data.amount);

  try {
    const res = await api.recordPayment(data);
    if (res.success) {
      Toast.success('Payment Recorded', `Receipt #${res.data.receiptNumber} successfully created.`);
      Modal.close('modalRecordPayment');
      loadFees(currentFeesPage);
      loadDashboardOverview();
    }
  } catch (err) {
    Toast.error('Payment Error', err.message);
  }
}

// ——— 8. MESS TIMETABLE ———
async function loadMessMenu() {
  const container = document.getElementById('messMenuContainer');
  try {
    const hostels = cachedHostels.length ? cachedHostels : (await api.getHostels()).data || [];
    if (!hostels.length) return;
    const targetHostelId = hostels[0]._id;

    const res = await api.getCurrentMenu(targetHostelId);
    if (res.success && res.data) {
      const menu = res.data.menu || {};
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      container.innerHTML = `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Breakfast (07:30 - 09:00)</th>
                <th>Lunch (12:30 - 14:00)</th>
                <th>Snacks (17:00 - 18:00)</th>
                <th>Dinner (19:30 - 21:30)</th>
              </tr>
            </thead>
            <tbody>
              ${days.map(d => `
                <tr>
                  <td class="fw-bold text-upper" style="color:var(--color-inst-blue);">${d}</td>
                  <td>${escapeHtml(menu[d]?.breakfast || '—')}</td>
                  <td>${escapeHtml(menu[d]?.lunch || '—')}</td>
                  <td>${escapeHtml(menu[d]?.snacks || '—')}</td>
                  <td>${escapeHtml(menu[d]?.dinner || '—')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      container.innerHTML = '<div class="p-lg text-center text-muted">No weekly menu configured yet.</div>';
    }
  } catch (err) {
    container.innerHTML = `<div class="p-lg text-danger">${escapeHtml(err.message)}</div>`;
  }
}

// ——— 9. STAFF & WARDENS ———
async function loadStaff() {
  const tbody = document.getElementById('staffTableBody');
  showTableSkeleton(tbody, 8, 4);

  try {
    const res = await api.getStaff();
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No staff records found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(s => `
        <tr>
          <td class="text-mono fw-bold">${escapeHtml(s.employeeId)}</td>
          <td class="fw-bold">${escapeHtml(s.userId?.name || '—')}</td>
          <td><span class="badge badge-dark">${escapeHtml(s.designation)}</span></td>
          <td>${escapeHtml(s.hostelId?.name || 'All Hostels')}</td>
          <td class="text-mono text-xs">${escapeHtml(s.userId?.phone || '—')}</td>
          <td class="text-xs">${escapeHtml(s.userId?.email || '—')}</td>
          <td>${getStatusBadge(s.isActive ? 'active' : 'maintenance')}</td>
          <td>
            <button class="btn btn-ghost btn-sm text-danger" onclick="confirmDeleteStaff('${s._id}')">Deactivate</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

// ——— 10. ANNOUNCEMENTS ———
async function loadAnnouncements() {
  const grid = document.getElementById('announcementsGrid');
  grid.innerHTML = '<div class="card p-lg text-muted">Loading announcements...</div>';

  try {
    const res = await api.getAnnouncements();
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        grid.innerHTML = '<div class="card p-lg text-muted">No campus announcements published.</div>';
        return;
      }
      grid.innerHTML = data.map(a => `
        <div class="card" style="border-left:4px solid ${a.type === 'urgent' ? 'var(--color-danger)' : a.type === 'fee' ? 'var(--color-gold)' : 'var(--color-inst-blue)'}">
          <div class="card-header">
            <div>
              <span class="badge ${a.type === 'urgent' ? 'badge-red' : 'badge-blue'} text-upper">${a.type}</span>
              ${a.isPinned ? '<span class="badge badge-yellow">📌 PINNED</span>' : ''}
              <h3 class="card-title mt-xs">${escapeHtml(a.title)}</h3>
            </div>
            <span class="text-xs text-muted">${formatDate(a.publishedAt)}</span>
          </div>
          <p class="text-sm text-secondary mb-md" style="line-height:1.6;">${escapeHtml(a.content)}</p>
          <div class="flex justify-between items-center text-xs text-muted">
            <span>By: <strong>${escapeHtml(a.publishedBy?.name || 'Administrator')}</strong></span>
            <button class="btn btn-ghost btn-sm text-danger" onclick="confirmDeleteAnnouncement('${a._id}')">Remove</button>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    grid.innerHTML = `<div class="card p-lg text-danger">${escapeHtml(err.message)}</div>`;
  }
}

function openNewAnnouncementModal() {
  resetForm(document.getElementById('formNewAnnouncement'));
  Modal.open('modalNewAnnouncement');
}

async function handleCreateAnnouncement(e) {
  e.preventDefault();
  const form = document.getElementById('formNewAnnouncement');
  const data = getFormData(form);
  data.isPinned = data.isPinned === 'true';

  try {
    const res = await api.createAnnouncement(data);
    if (res.success) {
      Toast.success('Announcement Published', 'Official circular broadcasted to users.');
      Modal.close('modalNewAnnouncement');
      loadAnnouncements();
    }
  } catch (err) {
    Toast.error('Broadcast Error', err.message);
  }
}

function confirmDeleteAnnouncement(id) {
  showConfirm(
    'Delete Announcement',
    'Are you sure you want to remove this announcement?',
    async () => {
      try {
        await api.deleteAnnouncement(id);
        Toast.success('Deleted', 'Announcement removed.');
        loadAnnouncements();
      } catch (err) {
        Toast.error('Error', err.message);
      }
    }
  );
}

// ——— 11. REPORTS & AUDIT TRAIL ———
async function loadFullReports() {
  const tbody = document.getElementById('fullAuditLogTbody');
  showTableSkeleton(tbody, 6, 8);

  try {
    const res = await api.getDashboardStats();
    const logs = res.data?.recentActivity || [];
    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No audit logs recorded.</td></tr>';
      return;
    }
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td class="text-mono text-xs">${formatDateTime(l.createdAt)}</td>
        <td class="fw-bold">${escapeHtml(l.userId?.name || 'Admin')}</td>
        <td><span class="badge badge-blue">${escapeHtml(l.module)}</span></td>
        <td><span class="badge badge-dark">${escapeHtml(l.action)}</span></td>
        <td class="text-secondary">${escapeHtml(l.description || '—')}</td>
        <td class="text-mono text-xs text-muted">${escapeHtml(l.ipAddress || '127.0.0.1')}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

// ——— NOTIFICATIONS ———
async function loadNotifications() {
  const list = document.getElementById('notifList');
  try {
    const res = await api.getNotifications();
    if (res.success) {
      const data = res.data || [];
      document.getElementById('notifBadge').textContent = res.unreadCount || 0;
      if (!data.length) {
        list.innerHTML = '<div class="p-md text-muted text-xs text-center">No notifications</div>';
        return;
      }
      list.innerHTML = data.map(n => `
        <div class="notif-item ${!n.isRead ? 'unread' : ''}" onclick="markNotifRead('${n._id}')">
          <div class="notif-dot" style="${n.isRead ? 'background:transparent;' : ''}"></div>
          <div style="flex:1;">
            <div class="text-xs fw-bold">${escapeHtml(n.title)}</div>
            <div class="text-xs text-secondary mt-xs">${escapeHtml(n.message)}</div>
            <div class="text-xs text-muted mt-xs">${timeAgo(n.createdAt)}</div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
}

async function markNotifRead(id) {
  try {
    await api.markNotificationRead(id);
    loadNotifications();
  } catch (err) {}
}

async function markAllNotificationsRead() {
  try {
    await api.markAllNotificationsRead();
    loadNotifications();
  } catch (err) {}
}

// ——— CHANGE PASSWORD ———
function openChangePasswordModal() {
  Modal.open('modalChangePassword');
}

async function handleChangePassword(e) {
  e.preventDefault();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  try {
    const res = await api.changePassword({ currentPassword, newPassword });
    if (res.success) {
      Toast.success('Password Changed', 'Your password has been updated.');
      Modal.close('modalChangePassword');
    }
  } catch (err) {
    Toast.error('Password Update Failed', err.message);
  }
}

