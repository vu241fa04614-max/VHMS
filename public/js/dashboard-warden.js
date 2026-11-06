/**
 * Vignan Hostel Management System
 * Warden Control Desk Controller
 */

// Protect route — only warden
if (!Auth.requireRole(['warden', 'super_admin'])) {
  // auth.js redirects
}

let wardenUser = null;
let currentWardenOutpassesPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
  initSidebar();
  initProfileMenu();
  populateUserInfo();
  initNotificationPanel(loadNotifications);

  wardenUser = Auth.getUser();
  if (wardenUser) {
    document.getElementById('sidebarWardenName').textContent = wardenUser.name;
    document.getElementById('headerWardenName').textContent = wardenUser.name.split(' ')[0];
  }

  loadWardenOverview();

  // Listen to navigation events
  document.addEventListener('sectionChange', (e) => {
    const section = e.detail.section;
    switch (section) {
      case 'overview':
        loadWardenOverview();
        break;
      case 'outpasses':
        loadWardenOutpasses(1);
        break;
      case 'students':
        loadWardenStudents();
        break;
      case 'rooms':
        loadWardenRooms();
        break;
      case 'complaints':
        loadWardenComplaints();
        break;
      case 'announcements':
        loadWardenAnnouncements();
        break;
    }
  });
});

// ——— 1. WARDEN DESK OVERVIEW ———
async function loadWardenOverview() {
  try {
    const [dashRes, outRes, compRes] = await Promise.all([
      api.getDashboardStats(),
      api.getOutpasses({ status: 'pending', limit: 5 }),
      api.getComplaints({ status: 'pending', limit: 5 })
    ]);

    if (dashRes.success) {
      const d = dashRes.data || {};
      animateCounter(document.getElementById('statWardenPendingOutpasses'), d.pendingOutpasses || 0);
      animateCounter(document.getElementById('statWardenPendingComplaints'), d.pendingComplaints || 0);
      animateCounter(document.getElementById('statWardenStudents'), d.totalStudents || 0);
      document.getElementById('statWardenOccupancy').textContent = `${d.occupancyRate || 0}%`;
      document.getElementById('statWardenRoomsFree').textContent = `${d.availableRooms || 0} beds free`;

      document.getElementById('badgeWardenOutpasses').textContent = d.pendingOutpasses || 0;
      document.getElementById('badgeWardenComplaints').textContent = d.pendingComplaints || 0;
    }

    // Pending Outpass Queue
    if (outRes.success) {
      const outpasses = outRes.data || [];
      const tbody = document.getElementById('wardenPendingOutpassTbody');
      if (!outpasses.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No pending outpasses in queue.</td></tr>';
      } else {
        tbody.innerHTML = outpasses.map(o => `
          <tr>
            <td class="fw-bold">${escapeHtml(o.studentId?.userId?.name || '—')}</td>
            <td class="text-mono text-xs">${escapeHtml(o.studentId?.registrationNumber || '—')}</td>
            <td><span class="badge badge-dark text-upper">${o.type}</span></td>
            <td>${escapeHtml(o.purpose)}</td>
            <td>${escapeHtml(o.destination || '—')}</td>
            <td class="text-xs">${formatDateTime(o.departureDate)}</td>
            <td class="text-xs">${formatDateTime(o.expectedReturnDate)}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="openWardenReviewOutpassModal('${o._id}', '${escapeHtml(o.studentId?.userId?.name)}', '${o.type}', '${escapeHtml(o.purpose)}')">Decide</button>
            </td>
          </tr>
        `).join('');
      }
    }

    // Urgent Complaints Queue
    if (compRes.success) {
      const complaints = compRes.data || [];
      const tbody = document.getElementById('wardenRecentComplaintsTbody');
      if (!complaints.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No urgent complaints pending.</td></tr>';
      } else {
        tbody.innerHTML = complaints.map(c => `
          <tr>
            <td class="text-mono text-xs">${escapeHtml(c.complaintNumber)}</td>
            <td>${escapeHtml(c.studentId?.userId?.name || '—')}</td>
            <td><span class="badge badge-blue text-upper">${c.category}</span></td>
            <td>
              <div class="fw-bold">${escapeHtml(c.title)}</div>
              <div class="text-xs text-muted">${escapeHtml(c.description)}</div>
            </td>
            <td>${getPriorityBadge(c.priority)}</td>
            <td>${getStatusBadge(c.status)}</td>
            <td>
              <button class="btn btn-outline-dark btn-sm" onclick="openWardenComplaintModal('${c._id}', '${escapeHtml(c.complaintNumber)}', '${escapeHtml(c.title)}')">Resolve</button>
            </td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Warden overview error:', err);
  }
}

// ——— 2. OUTPASS SUPERVISION ———
async function loadWardenOutpasses(page = 1) {
  currentWardenOutpassesPage = page;
  const tbody = document.getElementById('wardenOutpassTableBody');
  showTableSkeleton(tbody, 9, 5);

  const status = document.getElementById('wardenOutpassFilter')?.value;
  const params = { page, limit: 10 };
  if (status) params.status = status;

  try {
    const res = await api.getOutpasses(params);
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No outpass records found.</td></tr>';
        return;
      }
      tbody.innerHTML = data.map(o => `
        <tr>
          <td>
            <div class="fw-bold">${escapeHtml(o.studentId?.userId?.name || '—')}</div>
            <div class="text-xs text-muted">${escapeHtml(o.studentId?.userId?.phone || '—')}</div>
          </td>
          <td class="text-mono text-xs">${escapeHtml(o.studentId?.registrationNumber || '—')}</td>
          <td><span class="badge badge-dark text-upper">${o.type}</span></td>
          <td>${escapeHtml(o.purpose)}</td>
          <td>${escapeHtml(o.destination || '—')}</td>
          <td class="text-xs">${formatDateTime(o.departureDate)}</td>
          <td class="text-xs">${formatDateTime(o.expectedReturnDate)}</td>
          <td>${getStatusBadge(o.status)}</td>
          <td>
            ${o.status === 'pending' ? `
              <button class="btn btn-primary btn-sm" onclick="openWardenReviewOutpassModal('${o._id}', '${escapeHtml(o.studentId?.userId?.name)}', '${o.type}', '${escapeHtml(o.purpose)}')">Decide</button>
            ` : o.status === 'approved' ? `
              <button class="btn btn-outline-dark btn-sm" onclick="markWardenOutpassReturn('${o._id}')">Mark Return</button>
            ` : '—'}
          </td>
        </tr>
      `).join('');

      buildPagination(
        document.getElementById('wardenOutpassPagination'),
        res.page || 1,
        res.pages || 1,
        (p) => loadWardenOutpasses(p)
      );
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openWardenReviewOutpassModal(id, studentName, type, purpose) {
  document.getElementById('wardenReviewOutpassId').value = id;
  document.getElementById('wardenReviewDetails').innerHTML = `
    <strong>Student:</strong> ${studentName}<br/>
    <strong>Type:</strong> ${type.toUpperCase()}<br/>
    <strong>Reason:</strong> ${purpose}
  `;
  document.getElementById('wardenRejectionGroup').style.display = 'none';
  Modal.open('modalWardenReviewOutpass');
}

function toggleWardenRejectionReason() {
  const val = document.getElementById('wardenReviewDecision').value;
  document.getElementById('wardenRejectionGroup').style.display = val === 'rejected' ? 'block' : 'none';
}

async function handleWardenReviewOutpass(e) {
  e.preventDefault();
  const id = document.getElementById('wardenReviewOutpassId').value;
  const status = document.getElementById('wardenReviewDecision').value;
  const remarks = document.getElementById('wardenRemarks').value;
  const rejectionReason = document.getElementById('wardenRejectionReason').value;

  try {
    const res = await api.reviewOutpass(id, { status, remarks, rejectionReason });
    if (res.success) {
      Toast.success('Decision Recorded', `Outpass ${status}.`);
      Modal.close('modalWardenReviewOutpass');
      loadWardenOutpasses(currentWardenOutpassesPage);
      loadWardenOverview();
    }
  } catch (err) {
    Toast.error('Error', err.message);
  }
}

async function markWardenOutpassReturn(id) {
  try {
    const res = await api.markReturn(id);
    if (res.success) {
      Toast.success('Return Logged', 'Student marked returned safely.');
      loadWardenOutpasses(currentWardenOutpassesPage);
    }
  } catch (err) {
    Toast.error('Error', err.message);
  }
}

// ——— 3. RESIDENT STUDENTS ———
async function loadWardenStudents() {
  const tbody = document.getElementById('wardenStudentsTableBody');
  showTableSkeleton(tbody, 7, 5);

  try {
    const res = await api.getStudents({ limit: 50 });
    if (res.success) {
      const students = res.data || [];
      if (!students.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No resident students found.</td></tr>';
        return;
      }
      tbody.innerHTML = students.map(s => `
        <tr>
          <td class="text-mono fw-bold">${escapeHtml(s.registrationNumber)}</td>
          <td class="fw-bold">${escapeHtml(s.userId?.name || '—')}</td>
          <td>${s.roomId ? `<span class="badge badge-blue">Room ${s.roomId.roomNumber}</span>` : '<span class="badge badge-gray">Unassigned</span>'}</td>
          <td class="text-xs">${escapeHtml(s.department)}</td>
          <td>Year ${s.year}</td>
          <td class="text-mono text-xs">${escapeHtml(s.userId?.phone || '—')}</td>
          <td class="text-mono text-xs">${escapeHtml(s.parentPhone || '—')}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

// ——— 4. ROOM OCCUPANCY ———
async function loadWardenRooms() {
  const grid = document.getElementById('wardenRoomGrid');
  try {
    const res = await api.getRooms();
    if (res.success) {
      const rooms = res.data || [];
      if (!rooms.length) {
        grid.innerHTML = '<div class="text-muted p-md">No rooms found.</div>';
        return;
      }
      grid.innerHTML = rooms.map(r => {
        let cls = 'available';
        if (r.status === 'occupied') cls = 'occupied';
        else if (r.status === 'partially_occupied') cls = 'partial';
        else if (r.status === 'maintenance') cls = 'maintenance';

        return `
          <div class="room-cell ${cls}" title="${escapeHtml(r.roomNumber)} (${r.currentOccupancy}/${r.capacity} beds occupied)">
            <div>${escapeHtml(r.roomNumber)}</div>
            <div style="font-size:10px;font-weight:400;">${r.currentOccupancy}/${r.capacity}</div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    grid.innerHTML = `<div class="text-danger p-md">${escapeHtml(err.message)}</div>`;
  }
}

// ——— 5. COMPLAINTS RESOLUTION ———
async function loadWardenComplaints() {
  const tbody = document.getElementById('wardenComplaintsTableBody');
  showTableSkeleton(tbody, 7, 5);

  try {
    const res = await api.getComplaints();
    if (res.success) {
      const complaints = res.data || [];
      if (!complaints.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No complaints logged.</td></tr>';
        return;
      }
      tbody.innerHTML = complaints.map(c => `
        <tr>
          <td class="text-mono text-xs fw-bold">${escapeHtml(c.complaintNumber)}</td>
          <td>${escapeHtml(c.studentId?.userId?.name || '—')}</td>
          <td><span class="badge badge-blue text-upper">${c.category}</span></td>
          <td>
            <div class="fw-bold">${escapeHtml(c.title)}</div>
            <div class="text-xs text-muted">${escapeHtml(c.description)}</div>
          </td>
          <td>${getPriorityBadge(c.priority)}</td>
          <td>${getStatusBadge(c.status)}</td>
          <td>
            <button class="btn btn-outline-dark btn-sm" onclick="openWardenComplaintModal('${c._id}', '${escapeHtml(c.complaintNumber)}', '${escapeHtml(c.title)}')">Resolve</button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openWardenComplaintModal(id, ticketNo, title) {
  document.getElementById('wardenComplaintId').value = id;
  document.getElementById('wardenComplaintDetails').innerHTML = `
    <strong>Ticket:</strong> ${ticketNo}<br/>
    <strong>Title:</strong> ${title}
  `;
  Modal.open('modalWardenComplaint');
}

async function handleWardenReviewComplaint(e) {
  e.preventDefault();
  const id = document.getElementById('wardenComplaintId').value;
  const status = document.getElementById('wardenComplaintStatus').value;
  const resolutionDetails = document.getElementById('wardenComplaintNotes').value;

  try {
    const res = await api.updateComplaintStatus(id, { status, resolutionDetails });
    if (res.success) {
      Toast.success('Maintenance Updated', `Ticket marked as ${status}.`);
      Modal.close('modalWardenComplaint');
      loadWardenComplaints();
      loadWardenOverview();
    }
  } catch (err) {
    Toast.error('Update Error', err.message);
  }
}

// ——— 6. ANNOUNCEMENTS ———
async function loadWardenAnnouncements() {
  const grid = document.getElementById('wardenAnnouncementsGrid');
  grid.innerHTML = '<div class="card p-lg text-muted">Loading notices...</div>';

  try {
    const res = await api.getAnnouncements();
    if (res.success) {
      const data = res.data || [];
      if (!data.length) {
        grid.innerHTML = '<div class="card p-lg text-muted">No notices posted.</div>';
        return;
      }
      grid.innerHTML = data.map(a => `
        <div class="card" style="border-left:4px solid ${a.type === 'urgent' ? 'var(--color-danger)' : 'var(--color-inst-blue)'}">
          <div class="card-header">
            <div>
              <span class="badge ${a.type === 'urgent' ? 'badge-red' : 'badge-blue'} text-upper">${a.type}</span>
              <h3 class="card-title mt-xs">${escapeHtml(a.title)}</h3>
            </div>
            <span class="text-xs text-muted">${formatDate(a.publishedAt)}</span>
          </div>
          <p class="text-sm text-secondary mb-md">${escapeHtml(a.content)}</p>
          <div class="text-xs text-muted">By: <strong>${escapeHtml(a.publishedBy?.name || 'Warden')}</strong></div>
        </div>
      `).join('');
    }
  } catch (err) {
    grid.innerHTML = `<div class="card p-lg text-danger">${escapeHtml(err.message)}</div>`;
  }
}

function openWardenAnnouncementModal() {
  Modal.open('modalWardenNotice');
}

async function handleWardenPostNotice(e) {
  e.preventDefault();
  const title = document.getElementById('wardenNoticeTitle').value;
  const type = document.getElementById('wardenNoticeType').value;
  const content = document.getElementById('wardenNoticeContent').value;

  try {
    const res = await api.createAnnouncement({
      title,
      type,
      content,
      targetAudience: 'students'
    });
    if (res.success) {
      Toast.success('Notice Published', 'Broadcasted to resident students.');
      Modal.close('modalWardenNotice');
      loadWardenAnnouncements();
    }
  } catch (err) {
    Toast.error('Post Error', err.message);
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
      Toast.success('Password Changed', 'Your password has been updated.');
      Modal.close('modalChangePassword');
    }
  } catch (err) {
    Toast.error('Password Update Failed', err.message);
  }
}

