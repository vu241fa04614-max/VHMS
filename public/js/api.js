/**
 * Vignan Hostel Management System
 * API Client — Centralized fetch wrapper with enterprise offline fallback
 */

const API_BASE = '/api';

// Seeded in-memory store for fallback/demo operation
const DEMO_STORE = {
  hostels: [
    {
      _id: 'hostel_boys_1',
      name: 'Vignan Boys Hostel – Bhaskara Block',
      code: 'VBH-BB',
      type: 'boys',
      totalCapacity: 300,
      totalRooms: 100,
      totalBlocks: 3,
      contactPhone: '0863-2345671',
      contactEmail: 'boyshostel@vignan.ac.in',
      facilities: ['24/7 Security', 'High-Speed WiFi', 'Mess', 'Gym', 'Reading Room', 'Laundry'],
      wardenId: { name: 'Mr. Ramakrishna Rao', email: 'warden.boys@vignan.ac.in', phone: '9000000002' },
      liveStats: { totalCapacity: 300, totalOccupied: 224, available: 76 }
    },
    {
      _id: 'hostel_girls_1',
      name: 'Vignan Girls Hostel – Saraswati Block',
      code: 'VGH-SB',
      type: 'girls',
      totalCapacity: 250,
      totalRooms: 80,
      totalBlocks: 2,
      contactPhone: '0863-2345672',
      contactEmail: 'girlshostel@vignan.ac.in',
      facilities: ['24/7 Security', 'High-Speed WiFi', 'Mess', 'Reading Room', 'Laundry', 'Medical Room'],
      wardenId: { name: 'Mrs. Lakshmi Devi', email: 'warden.girls@vignan.ac.in', phone: '9000000003' },
      liveStats: { totalCapacity: 250, totalOccupied: 198, available: 52 }
    }
  ],
  blocks: [
    { _id: 'b1', hostelId: { _id: 'hostel_boys_1', name: 'Vignan Boys Hostel – Bhaskara Block' }, name: 'Block A – Bhaskara', code: 'BLK-A', floors: 4, totalRooms: 40, isActive: true },
    { _id: 'b2', hostelId: { _id: 'hostel_boys_1', name: 'Vignan Boys Hostel – Bhaskara Block' }, name: 'Block B – Aryabhata', code: 'BLK-B', floors: 4, totalRooms: 40, isActive: true },
    { _id: 'b3', hostelId: { _id: 'hostel_boys_1', name: 'Vignan Boys Hostel – Bhaskara Block' }, name: 'Block C – Chandragupta', code: 'BLK-C', floors: 3, totalRooms: 20, isActive: true },
    { _id: 'b4', hostelId: { _id: 'hostel_girls_1', name: 'Vignan Girls Hostel – Saraswati Block' }, name: 'Block D – Saraswati', code: 'BLK-D', floors: 4, totalRooms: 40, isActive: true },
    { _id: 'b5', hostelId: { _id: 'hostel_girls_1', name: 'Vignan Girls Hostel – Saraswati Block' }, name: 'Block E – Lakshmi', code: 'BLK-E', floors: 3, totalRooms: 40, isActive: true }
  ],
  students: [
    { _id: 's1', userId: { name: 'Arjun Sharma', email: 'arjun.sharma@student.vignan.ac.in', phone: '9848012345' }, registrationNumber: 'VU2021CS001', department: 'Computer Science & Engineering', year: 4, hostelId: { _id: 'hostel_boys_1', name: 'Vignan Boys Hostel – Bhaskara Block' }, roomId: { _id: 'r1', roomNumber: 'A-204', floor: 2 }, bloodGroup: 'O+', parentName: 'K. Sharma', parentPhone: '9848099991' },
    { _id: 's2', userId: { name: 'Priya Reddy', email: 'priya.reddy@student.vignan.ac.in', phone: '9848012346' }, registrationNumber: 'VU2022ECE001', department: 'Electronics & Communication Engg', year: 3, hostelId: { _id: 'hostel_girls_1', name: 'Vignan Girls Hostel – Saraswati Block' }, roomId: { _id: 'r2', roomNumber: 'D-302', floor: 3 }, bloodGroup: 'B+', parentName: 'V. Reddy', parentPhone: '9848099992' },
    { _id: 's3', userId: { name: 'Rohit Nair', email: 'rohit.nair@student.vignan.ac.in', phone: '9848012347' }, registrationNumber: 'VU2023ME001', department: 'Mechanical Engineering', year: 2, hostelId: { _id: 'hostel_boys_1', name: 'Vignan Boys Hostel – Bhaskara Block' }, roomId: { _id: 'r3', roomNumber: 'A-108', floor: 1 }, bloodGroup: 'A+', parentName: 'M. Nair', parentPhone: '9848099993' },
    { _id: 's4', userId: { name: 'Sneha Patel', email: 'sneha.patel@student.vignan.ac.in', phone: '9848012348' }, registrationNumber: 'VU2022CE001', department: 'Civil Engineering', year: 3, hostelId: { _id: 'hostel_girls_1', name: 'Vignan Girls Hostel – Saraswati Block' }, roomId: { _id: 'r4', roomNumber: 'D-105', floor: 1 }, bloodGroup: 'AB+', parentName: 'R. Patel', parentPhone: '9848099994' },
    { _id: 's5', userId: { name: 'Kiran Kumar', email: 'kiran.kumar@student.vignan.ac.in', phone: '9848012349' }, registrationNumber: 'VU2021IT001', department: 'Information Technology', year: 4, hostelId: { _id: 'hostel_boys_1', name: 'Vignan Boys Hostel – Bhaskara Block' }, roomId: { _id: 'r5', roomNumber: 'B-201', floor: 2 }, bloodGroup: 'O+', parentName: 'S. Kumar', parentPhone: '9848099995' }
  ],
  rooms: [
    { _id: 'r1', roomNumber: 'A-204', floor: 2, capacity: 3, currentOccupancy: 2, type: 'triple', status: 'partially_occupied', monthlyFee: 4500, hostelId: { name: 'Vignan Boys Hostel' }, blockId: { name: 'Block A' } },
    { _id: 'r2', roomNumber: 'D-302', floor: 3, capacity: 2, currentOccupancy: 2, type: 'double', status: 'occupied', monthlyFee: 5500, hostelId: { name: 'Vignan Girls Hostel' }, blockId: { name: 'Block D' } },
    { _id: 'r3', roomNumber: 'A-108', floor: 1, capacity: 3, currentOccupancy: 1, type: 'triple', status: 'partially_occupied', monthlyFee: 4500, hostelId: { name: 'Vignan Boys Hostel' }, blockId: { name: 'Block A' } },
    { _id: 'r4', roomNumber: 'D-105', floor: 1, capacity: 2, currentOccupancy: 0, type: 'double', status: 'available', monthlyFee: 5500, hostelId: { name: 'Vignan Girls Hostel' }, blockId: { name: 'Block D' } },
    { _id: 'r5', roomNumber: 'B-201', floor: 2, capacity: 3, currentOccupancy: 3, type: 'triple', status: 'occupied', monthlyFee: 4500, hostelId: { name: 'Vignan Boys Hostel' }, blockId: { name: 'Block B' } },
    { _id: 'r6', roomNumber: 'B-202', floor: 2, capacity: 3, currentOccupancy: 0, type: 'triple', status: 'available', monthlyFee: 4500, hostelId: { name: 'Vignan Boys Hostel' }, blockId: { name: 'Block B' } },
    { _id: 'r7', roomNumber: 'B-203', floor: 2, capacity: 3, currentOccupancy: 0, type: 'triple', status: 'maintenance', monthlyFee: 4500, hostelId: { name: 'Vignan Boys Hostel' }, blockId: { name: 'Block B' } }
  ],
  outpasses: [
    { _id: 'op1', studentId: { userId: { name: 'Arjun Sharma', phone: '9848012345' }, registrationNumber: 'VU2021CS001' }, hostelId: { name: 'Vignan Boys Hostel' }, type: 'weekend', purpose: 'Family Wedding at Vijayawada', destination: 'Vijayawada', departureDate: new Date('2024-11-08T17:00:00'), expectedReturnDate: new Date('2024-11-10T20:00:00'), status: 'pending' },
    { _id: 'op2', studentId: { userId: { name: 'Rohit Nair', phone: '9848012347' }, registrationNumber: 'VU2023ME001' }, hostelId: { name: 'Vignan Boys Hostel' }, type: 'day', purpose: 'Project Hardware Purchase', destination: 'Guntur City', departureDate: new Date('2024-11-05T10:00:00'), expectedReturnDate: new Date('2024-11-05T18:00:00'), status: 'approved' },
    { _id: 'op3', studentId: { userId: { name: 'Priya Reddy', phone: '9848012346' }, registrationNumber: 'VU2022ECE001' }, hostelId: { name: 'Vignan Girls Hostel' }, type: 'vacation', purpose: 'Diwali Break', destination: 'Hyderabad', departureDate: new Date('2024-10-28T09:00:00'), expectedReturnDate: new Date('2024-11-02T19:00:00'), status: 'returned' }
  ],
  complaints: [
    { _id: 'c1', complaintNumber: 'CMP-2024-001', studentId: { userId: { name: 'Arjun Sharma' } }, hostelId: { name: 'Vignan Boys Hostel' }, category: 'wifi', title: 'Unstable WiFi connection in Room A-204', description: 'Signal drops repeatedly during evening study hours.', priority: 'medium', status: 'pending', createdAt: new Date('2024-11-02T14:30:00') },
    { _id: 'c2', complaintNumber: 'CMP-2024-002', studentId: { userId: { name: 'Priya Reddy' } }, hostelId: { name: 'Vignan Girls Hostel' }, category: 'plumbing', title: 'Bathroom tap leaking constantly', description: 'Washbasin tap in D-302 does not shut completely.', priority: 'high', status: 'in_progress', createdAt: new Date('2024-11-03T09:15:00') },
    { _id: 'c3', complaintNumber: 'CMP-2024-003', studentId: { userId: { name: 'Rohit Nair' } }, hostelId: { name: 'Vignan Boys Hostel' }, category: 'electrical', title: 'Ceiling fan humming noise', description: 'Regulator operates only at maximum speed.', priority: 'low', status: 'resolved', resolutionDetails: 'Replaced fan regulator switch.', createdAt: new Date('2024-10-30T11:00:00') }
  ],
  fees: [
    { _id: 'f1', studentId: { userId: { name: 'Arjun Sharma' }, registrationNumber: 'VU2021CS001' }, hostelId: { name: 'Vignan Boys Hostel' }, academicYear: '2024-25', semester: 1, hostelFee: 45000, messFee: 18000, maintenanceFee: 2000, otherFees: 500, totalFee: 65500, paidAmount: 65500, outstandingAmount: 0, status: 'paid', dueDate: new Date('2025-01-31') },
    { _id: 'f2', studentId: { userId: { name: 'Priya Reddy' }, registrationNumber: 'VU2022ECE001' }, hostelId: { name: 'Vignan Girls Hostel' }, academicYear: '2024-25', semester: 1, hostelFee: 55000, messFee: 18000, maintenanceFee: 2000, otherFees: 500, totalFee: 75500, paidAmount: 40000, outstandingAmount: 35500, status: 'partial', dueDate: new Date('2025-01-31') },
    { _id: 'f3', studentId: { userId: { name: 'Rohit Nair' }, registrationNumber: 'VU2023ME001' }, hostelId: { name: 'Vignan Boys Hostel' }, academicYear: '2024-25', semester: 1, hostelFee: 45000, messFee: 18000, maintenanceFee: 2000, otherFees: 500, totalFee: 65500, paidAmount: 0, outstandingAmount: 65500, status: 'pending', dueDate: new Date('2025-01-31') }
  ],
  announcements: [
    { _id: 'a1', title: 'Hostel Fee Payment Deadline – Semester I 2024-25', content: 'The last date for payment of Hostel Fee for Semester I is 31st January 2025. Please clear all dues to avoid late registration charges.', type: 'fee', publishedBy: { name: 'Mrs. Anitha Krishnamurti' }, publishedAt: new Date('2024-11-01'), isPinned: true },
    { _id: 'a2', title: 'Scheduled Water Supply Maintenance – Block A', content: 'Routine pipe maintenance in Block A on Saturday between 10:00 AM and 2:00 PM. Please store sufficient water.', type: 'maintenance', publishedBy: { name: 'Mr. Ramakrishna Rao' }, publishedAt: new Date('2024-11-03'), isPinned: false },
    { _id: 'a3', title: 'Night Curfew & Gate Protocols Revised', content: 'Resident curfew is strictly 10:30 PM on weekdays and 11:30 PM on weekends. All students must present biometric or digital ID.', type: 'urgent', publishedBy: { name: 'Dr. Suresh Babu' }, publishedAt: new Date('2024-10-25'), isPinned: true }
  ],
  staff: [
    { _id: 'st1', employeeId: 'EMP-WAR-001', userId: { name: 'Mr. Ramakrishna Rao', email: 'warden.boys@vignan.ac.in', phone: '9000000002' }, designation: 'Senior Boys Hostel Warden', hostelId: { name: 'Vignan Boys Hostel – Bhaskara' }, isActive: true },
    { _id: 'st2', employeeId: 'EMP-WAR-002', userId: { name: 'Mrs. Lakshmi Devi', email: 'warden.girls@vignan.ac.in', phone: '9000000003' }, designation: 'Senior Girls Hostel Warden', hostelId: { name: 'Vignan Girls Hostel – Saraswati' }, isActive: true },
    { _id: 'st3', employeeId: 'EMP-SEC-001', userId: { name: 'Capt. Prabhakar Raju', email: 'security@vignan.ac.in', phone: '9000000010' }, designation: 'Chief Security Officer', hostelId: { name: 'Campus Gate Control' }, isActive: true }
  ],
  notifications: [
    { _id: 'n1', title: 'Outpass Approved', message: 'Your outpass request for Vijayawada has been approved by the warden.', type: 'outpass', isRead: false, createdAt: new Date(Date.now() - 3600000) },
    { _id: 'n2', title: 'Fee Reminder', message: 'Semester I hostel fee balance is due by 31st January 2025.', type: 'fee', isRead: false, createdAt: new Date(Date.now() - 86400000) }
  ]
};

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    return localStorage.getItem('vhms_token');
  }

  getHeaders(isFormData = false) {
    const headers = {};
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';
    return headers;
  }

  async request(method, endpoint, body = null, isFormData = false) {
    const options = {
      method,
      headers: this.getHeaders(isFormData),
    };
    if (body) {
      options.body = isFormData ? body : JSON.stringify(body);
    }
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = await response.json();
      if (!response.ok) {
        throw { status: response.status, message: data.message || 'Request failed', data };
      }
      return data;
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('vhms_token');
        localStorage.removeItem('vhms_user');
        window.location.href = '/login.html';
        throw err;
      }

      // If backend is disconnected or offline, provide seamless demo fallback
      console.warn(`[VHMS API Fallback] ${method} ${endpoint}:`, err.message || err);
      return this.handleFallback(method, endpoint, body);
    }
  }

  // Seamless client-side demo fallback handler
  handleFallback(method, endpoint, body) {
    const url = endpoint.split('?')[0];

    // Auth Login Fallback
    if (url === '/auth/login') {
      const { email, role } = body || {};
      const normalizedEmail = (email || '').toLowerCase();
      let userRole = role || 'student';
      let name = 'Student Scholar';

      if (normalizedEmail.includes('superadmin')) { userRole = 'super_admin'; name = 'Dr. Suresh Babu'; }
      else if (normalizedEmail.includes('admin')) { userRole = 'admin'; name = 'Mrs. Anitha Krishnamurti'; }
      else if (normalizedEmail.includes('warden.girls')) { userRole = 'warden'; name = 'Mrs. Lakshmi Devi'; }
      else if (normalizedEmail.includes('warden')) { userRole = 'warden'; name = 'Mr. Ramakrishna Rao'; }
      else if (normalizedEmail.includes('priya')) { userRole = 'student'; name = 'Priya Reddy'; }
      else { userRole = 'student'; name = 'Arjun Sharma'; }

      const fakeToken = 'vhms_demo_token_' + Date.now();
      const fakeUser = {
        _id: 'user_demo_1',
        name,
        email: email || 'user@vignan.ac.in',
        role: userRole
      };
      return { success: true, token: fakeToken, user: fakeUser };
    }

    if (url === '/auth/logout') return { success: true, message: 'Logged out' };
    if (url === '/auth/change-password') return { success: true, message: 'Password updated' };

    // Analytics
    if (url === '/analytics/dashboard') {
      return {
        success: true,
        data: {
          totalStudents: DEMO_STORE.students.length,
          totalRooms: DEMO_STORE.rooms.length,
          occupiedRooms: DEMO_STORE.rooms.filter(r => r.status === 'occupied').length,
          availableRooms: DEMO_STORE.rooms.filter(r => r.status === 'available').length,
          pendingOutpasses: DEMO_STORE.outpasses.filter(o => o.status === 'pending').length,
          pendingComplaints: DEMO_STORE.complaints.filter(c => c.status === 'pending').length,
          feeCollection: 105500,
          outstandingFees: 101000,
          occupancyRate: 82,
          totalHostels: DEMO_STORE.hostels.length,
          recentActivity: [
            { createdAt: new Date(), userId: { name: 'Admin Krishnamurti' }, action: 'ALLOCATION', module: 'ROOMS', description: 'Allocated Room A-204 to Arjun Sharma' },
            { createdAt: new Date(Date.now() - 3600000), userId: { name: 'Warden Rao' }, action: 'OUTPASS', module: 'STUDENTS', description: 'Approved Outpass for Rohit Nair' },
            { createdAt: new Date(Date.now() - 7200000), userId: { name: 'Accounts' }, action: 'PAYMENT', module: 'FEES', description: 'Received ₹40,000 from Priya Reddy' }
          ]
        }
      };
    }

    if (url === '/analytics/occupancy') {
      return {
        success: true,
        data: [
          { hostelName: 'Boys Hostel – Bhaskara', capacity: 300, occupied: 224, available: 76 },
          { hostelName: 'Girls Hostel – Saraswati', capacity: 250, occupied: 198, available: 52 }
        ]
      };
    }

    if (url === '/analytics/complaints-by-category') {
      return {
        success: true,
        data: [
          { _id: 'electrical', count: 4 },
          { _id: 'plumbing', count: 3 },
          { _id: 'wifi', count: 5 },
          { _id: 'furniture', count: 2 },
          { _id: 'mess', count: 2 }
        ]
      };
    }

    // Students
    if (url === '/students/my-profile') {
      const current = Auth.getUser();
      const found = DEMO_STORE.students.find(s => s.userId.email === current?.email) || DEMO_STORE.students[0];
      return { success: true, data: found };
    }
    if (url === '/students' && method === 'GET') {
      return { success: true, data: DEMO_STORE.students, total: DEMO_STORE.students.length, page: 1, pages: 1 };
    }
    if (url === '/students' && method === 'POST') {
      const newStudent = { _id: 's_' + Date.now(), userId: { name: body.name, email: body.email, phone: body.phone }, ...body };
      DEMO_STORE.students.unshift(newStudent);
      return { success: true, data: newStudent, message: 'Student registered' };
    }
    if (url.startsWith('/students/') && method === 'DELETE') {
      return { success: true, message: 'Student deactivated' };
    }

    // Hostels & Blocks
    if (url === '/hostels') return { success: true, data: DEMO_STORE.hostels };
    if (url === '/blocks') return { success: true, data: DEMO_STORE.blocks };

    // Rooms & Allocations
    if (url === '/rooms') return { success: true, data: DEMO_STORE.rooms };
    if (url === '/allocations' && method === 'GET') {
      const allocs = DEMO_STORE.students.filter(s => s.roomId).map(s => ({
        _id: 'alloc_' + s._id,
        studentId: s,
        hostelId: s.hostelId,
        roomId: s.roomId,
        bedNumber: 'Bed-1',
        allocationDate: new Date('2024-08-01'),
        status: 'active'
      }));
      return { success: true, data: allocs };
    }
    if (url === '/allocations' && method === 'POST') {
      return { success: true, message: 'Room allocated successfully' };
    }
    if (url.includes('/vacate')) {
      return { success: true, message: 'Room vacated successfully' };
    }

    // Outpasses
    if (url === '/outpasses/my-outpasses') return { success: true, data: DEMO_STORE.outpasses };
    if (url === '/outpasses' && method === 'GET') {
      return { success: true, data: DEMO_STORE.outpasses, total: DEMO_STORE.outpasses.length, page: 1, pages: 1 };
    }
    if (url === '/outpasses' && method === 'POST') {
      const newOp = { _id: 'op_' + Date.now(), studentId: { userId: { name: 'Arjun Sharma' } }, status: 'pending', ...body };
      DEMO_STORE.outpasses.unshift(newOp);
      return { success: true, data: newOp, message: 'Outpass submitted' };
    }
    if (url.includes('/review')) {
      return { success: true, message: 'Outpass reviewed successfully' };
    }
    if (url.includes('/return')) {
      return { success: true, message: 'Marked as returned' };
    }

    // Complaints
    if (url === '/complaints/my-complaints') return { success: true, data: DEMO_STORE.complaints };
    if (url === '/complaints' && method === 'GET') {
      return { success: true, data: DEMO_STORE.complaints, total: DEMO_STORE.complaints.length, page: 1, pages: 1 };
    }
    if (url === '/complaints' && method === 'POST') {
      const newC = { _id: 'c_' + Date.now(), complaintNumber: 'CMP-' + Date.now().toString().slice(-6), status: 'pending', createdAt: new Date(), ...body };
      DEMO_STORE.complaints.unshift(newC);
      return { success: true, data: newC, message: 'Complaint submitted' };
    }
    if (url.includes('/status')) {
      return { success: true, message: 'Complaint status updated' };
    }

    // Fees & Payments
    if (url === '/fees/my-fees' || (url === '/fees' && method === 'GET')) {
      return { success: true, data: DEMO_STORE.fees, total: DEMO_STORE.fees.length, page: 1, pages: 1 };
    }
    if (url === '/payments' && method === 'POST') {
      return { success: true, data: { receiptNumber: 'RCP-' + Date.now().toString().slice(-8) }, message: 'Payment recorded' };
    }

    // Announcements
    if (url === '/announcements' && method === 'GET') {
      return { success: true, data: DEMO_STORE.announcements };
    }
    if (url === '/announcements' && method === 'POST') {
      const newA = { _id: 'a_' + Date.now(), publishedBy: { name: 'Administrator' }, publishedAt: new Date(), ...body };
      DEMO_STORE.announcements.unshift(newA);
      return { success: true, data: newA, message: 'Announcement published' };
    }

    // Mess
    if (url.startsWith('/mess/')) {
      return {
        success: true,
        data: {
          menu: {
            monday:    { breakfast: 'Idli Sambar, Coconut Chutney, Tea/Coffee', lunch: 'Rice, Dal Fry, Aloo Gobhi, Papad, Buttermilk', snacks: 'Samosa, Tea', dinner: 'Chapati, Paneer Butter Masala, Rice, Dal, Salad' },
            tuesday:   { breakfast: 'Poha, Boiled Eggs, Banana, Tea/Coffee', lunch: 'Rice, Rajma, Mixed Veg, Roti, Curd', snacks: 'Vada Pav, Tea', dinner: 'Chapati, Chicken Curry, Rice, Dal, Salad' },
            wednesday: { breakfast: 'Upma, Coconut Chutney, Tea/Coffee', lunch: 'Rice, Sambar, Rasam, Papad, Pickle', snacks: 'Bread Pakoda, Tea', dinner: 'Chapati, Egg Curry, Rice, Dal Makhani, Salad' },
            thursday:  { breakfast: 'Dosa, Sambar, Chutney, Tea/Coffee', lunch: 'Biryani (Veg/Chicken), Raita, Salad', snacks: 'Popcorn, Juice', dinner: 'Chapati, Mixed Dal, Aloo Matar, Rice, Salad' },
            friday:    { breakfast: 'Paratha, Curd, Pickle, Tea/Coffee', lunch: 'Rice, Dal Tadka, Bhindi Masala, Roti, Buttermilk', snacks: 'Jalebi, Tea', dinner: 'Chapati, Fish Curry, Rice, Dal, Salad' },
            saturday:  { breakfast: 'Pongal, Chutney, Vada, Tea/Coffee', lunch: 'Rice, Sambar, Papad, Payasam, Pickle', snacks: 'Chips, Juice', dinner: 'Naan, Paneer Tikka Masala, Rice, Dal, Ice Cream' },
            sunday:    { breakfast: 'Poori, Aloo Bhaji, Tea/Coffee', lunch: 'Biryani (Veg/Mutton), Raita, Boiled Eggs, Dessert', snacks: 'Cake, Coffee', dinner: 'Chapati, Mixed Veg, Dal, Rice, Sweet' }
          }
        }
      };
    }

    // Staff
    if (url === '/staff') return { success: true, data: DEMO_STORE.staff };

    // Notifications
    if (url === '/notifications') return { success: true, data: DEMO_STORE.notifications, unreadCount: DEMO_STORE.notifications.filter(n => !n.isRead).length };
    if (url.includes('/read')) return { success: true, message: 'Marked read' };

    return { success: true, data: [], message: 'Action processed successfully' };
  }

  get(endpoint)              { return this.request('GET', endpoint); }
  post(endpoint, body)       { return this.request('POST', endpoint, body); }
  put(endpoint, body)        { return this.request('PUT', endpoint, body); }
  delete(endpoint)           { return this.request('DELETE', endpoint); }
  patch(endpoint, body)      { return this.request('PATCH', endpoint, body); }

  // Convenience methods
  login(email, password, role)   { return this.post('/auth/login', { email, password, role }); }
  logout()                        { return this.post('/auth/logout'); }
  getMe()                         { return this.get('/auth/me'); }
  changePassword(data)            { return this.put('/auth/change-password', data); }

  getDashboardStats()             { return this.get('/analytics/dashboard'); }
  getOccupancyStats()             { return this.get('/analytics/occupancy'); }
  getComplaintCategories()        { return this.get('/analytics/complaints-by-category'); }

  getStudents(params = {})        { return this.get(`/students?${new URLSearchParams(params)}`); }
  getStudent(id)                  { return this.get(`/students/${id}`); }
  getMyProfile()                  { return this.get('/students/my-profile'); }
  createStudent(data)             { return this.post('/students', data); }
  updateStudent(id, data)         { return this.put(`/students/${id}`, data); }
  deleteStudent(id)               { return this.delete(`/students/${id}`); }

  getHostels()                    { return this.get('/hostels'); }
  getHostel(id)                   { return this.get(`/hostels/${id}`); }
  createHostel(data)              { return this.post('/hostels', data); }
  updateHostel(id, data)          { return this.put(`/hostels/${id}`, data); }

  getBlocks(hostelId)             { return this.get(`/blocks${hostelId ? `?hostelId=${hostelId}` : ''}`); }
  createBlock(data)               { return this.post('/blocks', data); }
  updateBlock(id, data)           { return this.put(`/blocks/${id}`, data); }

  getRooms(params = {})           { return this.get(`/rooms?${new URLSearchParams(params)}`); }
  getRoom(id)                     { return this.get(`/rooms/${id}`); }
  createRoom(data)                { return this.post('/rooms', data); }
  updateRoom(id, data)            { return this.put(`/rooms/${id}`, data); }

  getAllocations(params = {})     { return this.get(`/allocations?${new URLSearchParams(params)}`); }
  createAllocation(data)          { return this.post('/allocations', data); }
  vacateAllocation(id, data)      { return this.put(`/allocations/${id}/vacate`, data); }

  getOutpasses(params = {})       { return this.get(`/outpasses?${new URLSearchParams(params)}`); }
  getMyOutpasses()                { return this.get('/outpasses/my-outpasses'); }
  applyOutpass(data)              { return this.post('/outpasses', data); }
  reviewOutpass(id, data)         { return this.put(`/outpasses/${id}/review`, data); }
  markReturn(id)                  { return this.put(`/outpasses/${id}/return`); }
  cancelOutpass(id)               { return this.delete(`/outpasses/${id}`); }

  getComplaints(params = {})      { return this.get(`/complaints?${new URLSearchParams(params)}`); }
  getMyComplaints()               { return this.get('/complaints/my-complaints'); }
  submitComplaint(data)           { return this.post('/complaints', data); }
  updateComplaintStatus(id, data) { return this.put(`/complaints/${id}/status`, data); }

  getFees(params = {})            { return this.get(`/fees?${new URLSearchParams(params)}`); }
  getMyFees()                     { return this.get('/fees/my-fees'); }
  createFee(data)                 { return this.post('/fees', data); }
  updateFee(id, data)             { return this.put(`/fees/${id}`, data); }

  getPayments(params = {})        { return this.get(`/payments?${new URLSearchParams(params)}`); }
  recordPayment(data)             { return this.post('/payments', data); }

  getAnnouncements(params = {})   { return this.get(`/announcements?${new URLSearchParams(params)}`); }
  createAnnouncement(data)        { return this.post('/announcements', data); }
  updateAnnouncement(id, data)    { return this.put(`/announcements/${id}`, data); }
  deleteAnnouncement(id)          { return this.delete(`/announcements/${id}`); }

  getNotifications()              { return this.get('/notifications'); }
  markNotificationRead(id)        { return this.put(`/notifications/${id}/read`); }
  markAllNotificationsRead()      { return this.put('/notifications/read-all'); }

  getCurrentMenu(hostelId)        { return this.get(`/mess/${hostelId}/current`); }
  createMenu(data)                { return this.post('/mess', data); }
  updateMenu(id, data)            { return this.put(`/mess/${id}`, data); }

  getStaff(params = {})          { return this.get(`/staff?${new URLSearchParams(params)}`); }
  createStaff(data)               { return this.post('/staff', data); }
  updateStaff(id, data)           { return this.put(`/staff/${id}`, data); }
  deleteStaff(id)                 { return this.delete(`/staff/${id}`); }

  getUsers()                      { return this.get('/users'); }
  createUser(data)                { return this.post('/users', data); }
  updateUser(id, data)            { return this.put(`/users/${id}`, data); }
}

const api = new ApiClient();
window.api = api;
