/**
 * Vignan Hostel Management System
 * Student Portal Controller
 */

// Protect route — only student
if (!Auth.requireRole(['student'])) {
  // auth.js automatically redirects
}

let studentProfile = null;

document.addEventListener('DOMContentLoaded', async () => {
  initSidebar();
  initProfileMenu();
  populateUserInfo();
  initNotificationPanel(loadNotifications);

  await loadStudentProfile();
  loadOverviewData();

  // Listen to navigation events
  document.addEventListener('sectionChange', (e) => {
    const section = e.detail.section;
    switch (section) {
      case 'overview':
        loadOverviewData();
        break;
      case 'profile':
        renderFullProfile();
        break;
      case 'room':
        loadRoomAndHostelDetails();
        break;
      case 'fees':
        loadStudentFees();
        break;
      case 'outpass':
        loadStudentOutpasses();
        break;
      case 'complaints':
        loadStudentComplaints();
        break;
      case 'mess':
        loadStudentMessMenu();
        break;
      case 'announcements':
        loadStudentAnnouncements();
        break;
    }
  });
});

// ——— 1. PROFILE & INITIALIZATION ———
async function loadStudentProfile() {
  try {
    const res = await api.getMyProfile();
    if (res.success && res.data) {
      studentProfile = res.data;
      const u = studentProfile.userId || {};
      const name = u.name || 'Student';
      const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

      document.getElementById('sidebarStudentName').textContent = name;
      document.getElementById('headerStudentName').textContent = name.split(' ')[0];
      document.getElementById('headerAvatar').textContent = initials;
      document.getElementById('welcomeHeading').textContent = `Welcome Back, ${name}`;

      // Populate room stats if allocated
      if (studentProfile.roomId) {
        document.getElementById('statMyRoom').textContent = studentProfile.roomId.roomNumber;
      }
      if (studentProfile.hostelId) {
        document.getElementById('statMyHostel').textContent = studentProfile.hostelId.name;
      }
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

// ——— 2. OVERVIEW DESK ———
async function loadOverviewData() {
  try {
    const [outRes, compRes, feeRes, annRes] = await Promise.all([
      api.getMyOutpasses(),
      api.getMyComplaints(),
      api.getMyFees(),
      api.getAnnouncements({ limit: 3 })
    ]);

    // Outpasses
    if (outRes.success) {
      const outpasses = outRes.data || [];
      const pending = outpasses.filter(o => o.status === 'pending').length;
      document.getElementById('statMyPendingOutpasses').textContent = pending;

      const tbody = document.getElementById('overviewOutpassesTbody');
      if (!outpasses.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No applications found.</td></tr>';
      } else {
        tbody.innerHTML = outpasses.slice(0, 4).map(o => `
          <tr>
            <td class="text-upper text-xs fw-bold">${o.type}</td>
            <td class="text-xs">${formatDate(o.departureDate)}</td>
            <td class="text-xs">${formatDate(o.expectedReturnDate)}</td>
            <td>${getStatusBadge(o.status)}</td>
          </tr>
        `).join('');
      }
    }

    // Complaints
    if (compRes.success) {
      const complaints = compRes.data || [];
      const open = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
      document.getElementById('statMyOpenComplaints').textContent = open;

      const tbody = document.getElementById('overviewComplaintsTbody');
      if (!complaints.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No complaints logged.</td></tr>';
      } else {
        tbody.innerHTML = complaints.slice(0, 4).map(c => `
          <tr>
            <td class="text-mono text-xs">${c.complaintNumber}</td>
            <td><span class="badge badge-blue text-upper">${c.category}</span></td>
            <td class="text-xs fw-bold">${escapeHtml(c.title)}</td>
            <td>${getStatusBadge(c.status)}</td>
          </tr>
        `).join('');
      }
    }

    // Fees
    if (feeRes.success) {
      const fees = feeRes.data || [];
      const latest = fees[0];
      if (latest) {
        document.getElementById('statMyFeeStatus').textContent = latest.status.toUpperCase();
        document.getElementById('statMyFeeDue').textContent = latest.outstandingAmount > 0 
          ? `Outstanding ${formatCurrency(latest.outstandingAmount)}`
          : 'All Clear / Settled';
      }
    }

    // Announcements
    if (annRes.success) {
      const anns = annRes.data || [];
      const container = document.getElementById('overviewAnnouncementsList');
      if (!anns.length) {
        container.innerHTML = '<div class="p-sm text-muted text-xs">No active notices published.</div>';
      } else {
        container.innerHTML = anns.map(a => `
          <div class="p-sm" style="background:var(--bg-secondary);border-left:3px solid var(--color-inst-blue);">
            <div class="flex justify-between items-center text-xs mb-xs">
              <span class="fw-bold">${escapeHtml(a.title)}</span>
              <span class="text-muted">${formatDate(a.publishedAt)}</span>
            </div>
            <div class="text-xs text-secondary">${escapeHtml(a.content.substring(0, 140))}...</div>
          </div>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Overview error:', err);
  }
}

// ——— 3. PROFILE DETAILS ———
function renderFullProfile() {
  if (!studentProfile) return;
  const s = studentProfile;
  const u = s.userId || {};

  document.getElementById('profileAvatarLarge').textContent = (u.name || 'ST').substring(0, 2).toUpperCase();
  document.getElementById('profileFullName').textContent = u.name || '—';
  document.getElementById('profileRegNo').textContent = s.registrationNumber || '—';
  document.getElementById('profileHostelName').textContent = s.hostelId?.name || 'Unassigned';
  document.getElementById('profileRoomBed').textContent = s.roomId ? `Room ${s.roomId.roomNumber}` : 'Unallocated';
  document.getElementById('profileBloodGroup').textContent = s.bloodGroup || '—';

  document.getElementById('profileDept').textContent = s.department || '—';
  document.getElementById('profileYear').textContent = `Year ${s.year} of Study`;
  document.getElementById('profileEmail').textContent = u.email || '—';
  document.getElementById('profilePhone').textContent = u.phone || '—';

  document.getElementById('profileParentName').textContent = s.parentName || '—';
  document.getElementById('profileParentPhone').textContent = s.parentPhone || '—';
  document.getElementById('profileAddress').textContent = s.permanentAddress?.city ? `${s.permanentAddress.city}, ${s.permanentAddress.state || ''}` : 'On File with Admissions';
}

// ——— 4. ROOM & HOSTEL ———
async function loadRoomAndHostelDetails() {
  const container = document.getElementById('myRoomDetailsContainer');
  if (!studentProfile?.roomId) {
    container.innerHTML = `
      <div class="card p-xl text-center" style="grid-column:span 2;">
        <div class="empty-state-title">No Room Allocated Yet</div>
        <p class="empty-state-desc">Your accommodation allocation is currently pending review by the hostel administration office.</p>
      </div>
    `;
    return;
  }

  const r = studentProfile.roomId;
  const h = studentProfile.hostelId || {};

  container.innerHTML = `
    <div class="card" style="border-top:3px solid var(--color-royal-blue);">
      <div class="card-header">
        <div>
          <span class="badge badge-blue">ROOM ALLOCATION</span>
          <h3 class="card-title mt-xs">Room ${escapeHtml(r.roomNumber)}</h3>
        </div>
        <span class="badge badge-green">ACTIVE</span>
      </div>
      <div class="grid grid-2 gap-md mb-md text-sm">
        <div><span class="text-muted text-xs text-upper">Hostel Block</span><div class="fw-bold">${escapeHtml(h.name || 'Hostel')}</div></div>
        <div><span class="text-muted text-xs text-upper">Floor</span><div class="fw-bold">Floor ${r.floor}</div></div>
        <div><span class="text-muted text-xs text-upper">Room Type</span><div class="fw-bold text-upper">${r.type || 'Standard'}</div></div>
        <div><span class="text-muted text-xs text-upper">Occupancy</span><div class="fw-bold">${r.currentOccupancy} of ${r.capacity} Beds</div></div>
      </div>
      <div class="divider"></div>
      <div class="text-xs">
        <strong>Included Amenities:</strong>
        <div class="flex flex-wrap gap-xs mt-xs">
          <span class="badge badge-gray">Study Table</span>
          <span class="badge badge-gray">Wardrobe</span>
          <span class="badge badge-gray">High-Speed WiFi</span>
          <span class="badge badge-gray">Attached Bath</span>
        </div>
      </div>
    </div>

    <div class="card" style="border-top:3px solid var(--color-crimson);">
      <div class="card-header">
        <span class="card-title">Hostel Warden & Support</span>
      </div>
      <div class="flex flex-col gap-sm text-sm">
        <div><strong>Facility Name:</strong> ${escapeHtml(h.name || 'Vignan Residence')}</div>
        <div><strong>Campus Location:</strong> Vignan University Campus, Guntur</div>
        <div><strong>Hostel Office Phone:</strong> <span class="text-mono fw-bold">${escapeHtml(h.contactPhone || '0863-2345671')}</span></div>
        <div><strong>Hostel Helpdesk:</strong> <span class="text-mono">${escapeHtml(h.contactEmail || 'hostel@vignan.ac.in')}</span></div>
      </div>
      <div class="divider"></div>
      <div class="alert alert-info" style="margin-bottom:0;">
        Resident curfew is 10:30 PM. Please ensure outpass approval for any off-campus travel.
      </div>
    </div>
  `;
}

// ——— 5. FEES ———
async function loadStudentFees() {
  const tbody = document.getElementById('studentFeeBreakdownTbody');
  showTableSkeleton(tbody, 8, 3);

  try {
    const res = await api.getMyFees();
    if (res.success) {
      const fees = res.data || [];
      if (!fees.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No fee records assessed yet.</td></tr>';
        return;
      }

      const totalFee = fees.reduce((s, f) => s + f.totalFee, 0);
      const paid = fees.reduce((s, f) => s + f.paidAmount, 0);
      const outstanding = fees.reduce((s, f) => s + f.outstandingAmount, 0);

      document.getElementById('feeTotalAmount').textContent = formatCurrency(totalFee);
      document.getElementById('feePaidAmount').textContent = formatCurrency(paid);
      document.getElementById('feeOutstandingAmount').textContent = formatCurrency(outstanding);

      if (fees[0]?.dueDate) {
        document.getElementById('feeDueDateLabel').textContent = `Due by ${formatDate(fees[0].dueDate)}`;
      }

      tbody.innerHTML = fees.map(f => `
        <tr>
          <td class="fw-bold">Sem ${f.semester} (${escapeHtml(f.academicYear)})</td>
          <td class="text-mono">${formatCurrency(f.hostelFee)}</td>
          <td class="text-mono">${formatCurrency(f.messFee)}</td>
          <td class="text-mono">${formatCurrency(f.maintenanceFee)}</td>
          <td class="text-mono fw-bold">${formatCurrency(f.totalFee)}</td>
          <td class="text-mono text-success fw-bold">${formatCurrency(f.paidAmount)}</td>
          <td class="text-mono text-danger fw-bold">${formatCurrency(f.outstandingAmount)}</td>
          <td>${getStatusBadge(f.status)}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

// ——— 6. OUTPASS WORKFLOW ———
async function loadStudentOutpasses() {
  const tbody = document.getElementById('studentOutpassTableBody');
  showTableSkeleton(tbody, 8, 4);

  try {
    const res = await api.getMyOutpasses();
    if (res.success) {
      const outpasses = res.data || [];
      if (!outpasses.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No outpass requests submitted yet.</td></tr>';
        return;
      }
      tbody.innerHTML = outpasses.map(o => `
        <tr>
          <td><span class="badge badge-dark text-upper">${o.type}</span></td>
          <td class="fw-bold">${escapeHtml(o.purpose)}</td>
          <td>${escapeHtml(o.destination || '—')}</td>
          <td class="text-xs">${formatDateTime(o.departureDate)}</td>
          <td class="text-xs">${formatDateTime(o.expectedReturnDate)}</td>
          <td>${getStatusBadge(o.status)}</td>
          <td class="text-xs text-secondary">${escapeHtml(o.rejectionReason || o.remarks || '—')}</td>
          <td>
            ${o.status === 'pending' ? `
              <button class="btn btn-ghost btn-sm text-danger" onclick="cancelOutpass('${o._id}')">Cancel</button>
            ` : '—'}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openApplyOutpassModal() {
  resetForm(document.getElementById('formApplyOutpass'));
  Modal.open('modalApplyOutpass');
}

async function handleApplyOutpass(e) {
  e.preventDefault();
  const form = document.getElementById('formApplyOutpass');
  const data = getFormData(form);

  try {
    const res = await api.applyOutpass(data);
    if (res.success) {
      Toast.success('Application Submitted', 'Your leave request is sent to the warden for review.');
      Modal.close('modalApplyOutpass');
      loadStudentOutpasses();
      loadOverviewData();
    }
  } catch (err) {
    Toast.error('Submission Failed', err.message);
  }
}

function cancelOutpass(id) {
  showConfirm(
    'Cancel Outpass Request',
    'Are you sure you want to withdraw this pending outpass application?',
    async () => {
      try {
        await api.cancelOutpass(id);
        Toast.success('Withdrawn', 'Outpass request cancelled.');
        loadStudentOutpasses();
        loadOverviewData();
      } catch (err) {
        Toast.error('Error', err.message);
      }
    }
  );
}

// ——— 7. COMPLAINTS TRACKING ———
async function loadStudentComplaints() {
  const tbody = document.getElementById('studentComplaintTableBody');
  showTableSkeleton(tbody, 7, 4);

  try {
    const res = await api.getMyComplaints();
    if (res.success) {
      const complaints = res.data || [];
      if (!complaints.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No maintenance complaints registered.</td></tr>';
        return;
      }
      tbody.innerHTML = complaints.map(c => `
        <tr>
          <td class="text-mono fw-bold text-xs">${escapeHtml(c.complaintNumber)}</td>
          <td><span class="badge badge-blue text-upper">${c.category}</span></td>
          <td>
            <div class="fw-bold">${escapeHtml(c.title)}</div>
            <div class="text-xs text-muted">${escapeHtml(c.description)}</div>
          </td>
          <td>${getPriorityBadge(c.priority)}</td>
          <td class="text-xs">${formatDate(c.createdAt)}</td>
          <td>${getStatusBadge(c.status)}</td>
          <td class="text-xs text-secondary">${escapeHtml(c.resolutionDetails || 'Pending investigation')}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openNewComplaintModal() {
  resetForm(document.getElementById('formNewComplaint'));
  Modal.open('modalNewComplaint');
}

async function handleSubmitComplaint(e) {
  e.preventDefault();
  const form = document.getElementById('formNewComplaint');
  const data = getFormData(form);

  try {
    const res = await api.submitComplaint(data);
    if (res.success) {
      Toast.success('Complaint Registered', `Ticket #${res.data.complaintNumber} created.`);
      Modal.close('modalNewComplaint');
      loadStudentComplaints();
      loadOverviewData();
    }
  } catch (err) {
    Toast.error('Submission Failed', err.message);
  }
}

// ——— 8. MESS SCHEDULE ———
async function loadStudentMessMenu() {
  const container = document.getElementById('studentMessContainer');
  if (!studentProfile?.hostelId) {
    container.innerHTML = '<div class="p-lg text-muted">Hostel allocation pending.</div>';
    return;
  }
  try {
    const res = await api.getCurrentMenu(studentProfile.hostelId._id);
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
      container.innerHTML = '<div class="p-lg text-center text-muted">Mess schedule for the current week is being updated.</div>';
    }
  } catch (err) {
    container.innerHTML = `<div class="p-lg text-danger">${escapeHtml(err.message)}</div>`;
  }
}

// ——— 9. ANNOUNCEMENTS ———
async function loadStudentAnnouncements() {
  const grid = document.getElementById('studentAnnouncementsGrid');
  grid.innerHTML = '<div class="card p-lg text-muted">Loading circulars...</div>';

  try {
    const res = await api.getAnnouncements();
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        grid.innerHTML = '<div class="card p-lg text-muted">No circulars published at this time.</div>';
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
          <p class="text-sm text-secondary" style="line-height:1.65;">${escapeHtml(a.content)}</p>
          <div class="mt-md text-xs text-muted">
            Published by: <strong>${escapeHtml(a.publishedBy?.name || 'Administration')}</strong>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    grid.innerHTML = `<div class="card p-lg text-danger">${escapeHtml(err.message)}</div>`;
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
    console.error(err);
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
      Toast.success('Password Changed', 'Your password has been successfully updated.');
      Modal.close('modalChangePassword');
    }
  } catch (err) {
    Toast.error('Password Update Failed', err.message);
  }
}

