require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Student = require('../models/Student');
const Hostel = require('../models/Hostel');
const Block = require('../models/Block');
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');
const Outpass = require('../models/Outpass');
const Complaint = require('../models/Complaint');
const Fee = require('../models/Fee');
const Announcement = require('../models/Announcement');
const MessMenu = require('../models/MessMenu');
const Staff = require('../models/Staff');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB. Seeding data...\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Student.deleteMany({}), Hostel.deleteMany({}),
      Block.deleteMany({}), Room.deleteMany({}), Allocation.deleteMany({}),
      Outpass.deleteMany({}), Complaint.deleteMany({}), Fee.deleteMany({}),
      Announcement.deleteMany({}), MessMenu.deleteMany({}), Staff.deleteMany({})
    ]);
    console.log('✓ Cleared existing data');

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Dr. Suresh Babu',
      email: 'superadmin@vignan.ac.in',
      password: 'Admin@123',
      role: 'super_admin',
      phone: '9000000001',
      isActive: true
    });
    console.log('✓ Super admin created');

    // Create Hostels
    const [boysHostel, girlsHostel] = await Hostel.insertMany([
      {
        name: 'Vignan Boys Hostel – Bhaskara Block',
        code: 'VBH-BB',
        type: 'boys',
        totalCapacity: 300,
        totalRooms: 100,
        totalBlocks: 3,
        address: 'Vignan University Campus, Guntur, AP 522213',
        contactPhone: '0863-2345671',
        contactEmail: 'boyshostel@vignan.ac.in',
        facilities: ['24/7 Security', 'High-Speed WiFi', 'Mess', 'Gym', 'Reading Room', 'Laundry', 'Medical Room'],
        description: 'Premier boys hostel facility at Vignan University',
        isActive: true
      },
      {
        name: 'Vignan Girls Hostel – Saraswati Block',
        code: 'VGH-SB',
        type: 'girls',
        totalCapacity: 250,
        totalRooms: 80,
        totalBlocks: 2,
        address: 'Vignan University Campus, Guntur, AP 522213',
        contactPhone: '0863-2345672',
        contactEmail: 'girlshostel@vignan.ac.in',
        facilities: ['24/7 Security', 'High-Speed WiFi', 'Mess', 'Beauty Parlour', 'Reading Room', 'Laundry'],
        description: 'Premier girls hostel facility at Vignan University',
        isActive: true
      }
    ]);
    console.log('✓ Hostels created');

    // Create Warden Users
    const [boyWarden, girlWarden] = await User.insertMany([
      { name: 'Mr. Ramakrishna Rao', email: 'warden.boys@vignan.ac.in', password: 'Warden@123', role: 'warden', phone: '9000000002', hostelId: boysHostel._id, isActive: true },
      { name: 'Mrs. Lakshmi Devi', email: 'warden.girls@vignan.ac.in', password: 'Warden@123', role: 'warden', phone: '9000000003', hostelId: girlsHostel._id, isActive: true }
    ]);
    await Hostel.findByIdAndUpdate(boysHostel._id, { wardenId: boyWarden._id });
    await Hostel.findByIdAndUpdate(girlsHostel._id, { wardenId: girlWarden._id });
    console.log('✓ Wardens created');

    // Create Admin
    const admin = await User.create({
      name: 'Mrs. Anitha Krishnamurti',
      email: 'admin@vignan.ac.in',
      password: 'Admin@123',
      role: 'admin',
      phone: '9000000004',
      isActive: true
    });
    console.log('✓ Admin created');

    // Create Blocks for Boys Hostel
    const [blockA, blockB, blockC] = await Block.insertMany([
      { hostelId: boysHostel._id, name: 'Block A – Bhaskara', code: 'BLK-A', floors: 4, totalRooms: 40, isActive: true },
      { hostelId: boysHostel._id, name: 'Block B – Aryabhata', code: 'BLK-B', floors: 4, totalRooms: 40, isActive: true },
      { hostelId: boysHostel._id, name: 'Block C – Chandragupta', code: 'BLK-C', floors: 3, totalRooms: 20, isActive: true }
    ]);
    const [blockD, blockE] = await Block.insertMany([
      { hostelId: girlsHostel._id, name: 'Block D – Saraswati', code: 'BLK-D', floors: 4, totalRooms: 40, isActive: true },
      { hostelId: girlsHostel._id, name: 'Block E – Lakshmi', code: 'BLK-E', floors: 3, totalRooms: 40, isActive: true }
    ]);
    console.log('✓ Blocks created');

    // Create Rooms for Block A (Boys)
    const roomsData = [];
    for (let floor = 1; floor <= 4; floor++) {
      for (let num = 1; num <= 10; num++) {
        const roomNum = `A-${floor}0${num}`;
        const occ = Math.floor(Math.random() * 3);
        const cap = 3;
        let status = occ === 0 ? 'available' : occ >= cap ? 'occupied' : 'partially_occupied';
        roomsData.push({
          hostelId: boysHostel._id, blockId: blockA._id,
          roomNumber: roomNum, floor, capacity: cap,
          currentOccupancy: occ, type: 'triple', status,
          amenities: ['Attached Bathroom', 'Study Table', 'Wardrobe', 'Fan', 'WiFi'],
          monthlyFee: 4500, isActive: true
        });
      }
    }
    // Block D rooms (Girls)
    for (let floor = 1; floor <= 4; floor++) {
      for (let num = 1; num <= 8; num++) {
        const roomNum = `D-${floor}0${num}`;
        const occ = Math.floor(Math.random() * 3);
        const cap = 2;
        let status = occ === 0 ? 'available' : occ >= cap ? 'occupied' : 'partially_occupied';
        roomsData.push({
          hostelId: girlsHostel._id, blockId: blockD._id,
          roomNumber: roomNum, floor, capacity: cap,
          currentOccupancy: occ, type: 'double', status,
          amenities: ['Attached Bathroom', 'Study Table', 'Wardrobe', 'AC', 'WiFi'],
          monthlyFee: 5500, isActive: true
        });
      }
    }
    const rooms = await Room.insertMany(roomsData);
    console.log(`✓ ${rooms.length} rooms created`);

    // Create Student Users & Profiles
    const studentData = [
      { name: 'Arjun Sharma', email: 'arjun.sharma@student.vignan.ac.in', regNo: 'VU2021CS001', dept: 'Computer Science & Engineering', year: 4, gender: 'male', hostelId: boysHostel._id },
      { name: 'Priya Reddy', email: 'priya.reddy@student.vignan.ac.in', regNo: 'VU2022ECE001', dept: 'Electronics & Communication Engg', year: 3, gender: 'female', hostelId: girlsHostel._id },
      { name: 'Rohit Nair', email: 'rohit.nair@student.vignan.ac.in', regNo: 'VU2023ME001', dept: 'Mechanical Engineering', year: 2, gender: 'male', hostelId: boysHostel._id },
      { name: 'Sneha Patel', email: 'sneha.patel@student.vignan.ac.in', regNo: 'VU2022CE001', dept: 'Civil Engineering', year: 3, gender: 'female', hostelId: girlsHostel._id },
      { name: 'Kiran Kumar', email: 'kiran.kumar@student.vignan.ac.in', regNo: 'VU2021IT001', dept: 'Information Technology', year: 4, gender: 'male', hostelId: boysHostel._id },
      { name: 'Anjali Singh', email: 'anjali.singh@student.vignan.ac.in', regNo: 'VU2023CS002', dept: 'Computer Science & Engineering', year: 2, gender: 'female', hostelId: girlsHostel._id },
      { name: 'Venkat Rao', email: 'venkat.rao@student.vignan.ac.in', regNo: 'VU2022EEE001', dept: 'Electrical & Electronics Engg', year: 3, gender: 'male', hostelId: boysHostel._id },
      { name: 'Meera Krishnan', email: 'meera.krishnan@student.vignan.ac.in', regNo: 'VU2021MBA001', dept: 'Master of Business Administration', year: 2, gender: 'female', hostelId: girlsHostel._id }
    ];

    const createdStudents = [];
    for (const s of studentData) {
      const user = await User.create({
        name: s.name, email: s.email, password: 'Student@123',
        role: 'student', phone: `90000${Math.floor(10000 + Math.random() * 90000)}`, isActive: true
      });
      const student = await Student.create({
        userId: user._id, registrationNumber: s.regNo,
        department: s.dept, year: s.year, gender: s.gender,
        hostelId: s.hostelId,
        parentName: 'Parent Name', parentPhone: '9000000000',
        academicYear: '2024-25',
        permanentAddress: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
        bloodGroup: ['A+', 'B+', 'O+', 'AB+'][Math.floor(Math.random() * 4)],
        isActive: true
      });
      createdStudents.push({ user, student });
    }
    console.log(`✓ ${createdStudents.length} students created`);

    // Allocate first 2 students to rooms
    const boysRooms = rooms.filter(r => r.hostelId.toString() === boysHostel._id.toString());
    const girlsRooms = rooms.filter(r => r.hostelId.toString() === girlsHostel._id.toString());

    const allocationPairs = [
      { student: createdStudents[0], room: boysRooms[0] },
      { student: createdStudents[1], room: girlsRooms[0] },
      { student: createdStudents[2], room: boysRooms[1] },
      { student: createdStudents[4], room: boysRooms[2] },
    ];

    for (const pair of allocationPairs) {
      const alloc = await Allocation.create({
        studentId: pair.student.student._id,
        hostelId: pair.student.student.hostelId,
        blockId: pair.room.blockId,
        roomId: pair.room._id,
        bedNumber: 'Bed-1',
        academicYear: '2024-25',
        allocatedBy: admin._id,
        status: 'active'
      });
      await Student.findByIdAndUpdate(pair.student.student._id, { roomId: pair.room._id, allocationId: alloc._id });
      await Room.findByIdAndUpdate(pair.room._id, { $inc: { currentOccupancy: 1 }, status: 'partially_occupied' });
    }
    console.log('✓ Room allocations created');

    // Create Outpasses
    const outpassStatuses = ['pending', 'approved', 'rejected', 'returned'];
    for (let i = 0; i < 8; i++) {
      const student = createdStudents[i % createdStudents.length];
      const deptDate = new Date(); deptDate.setDate(deptDate.getDate() + (i % 3));
      const retDate = new Date(deptDate); retDate.setDate(retDate.getDate() + 2);
      await Outpass.create({
        studentId: student.student._id,
        hostelId: student.student.hostelId,
        type: ['day', 'weekend', 'vacation'][i % 3],
        purpose: ['Family visit', 'Medical appointment', 'Festival celebration', 'College event', 'Personal work'][i % 5],
        destination: ['Hyderabad', 'Vijayawada', 'Guntur', 'Tirupati'][i % 4],
        departureDate: deptDate, expectedReturnDate: retDate,
        status: outpassStatuses[i % 4],
        reviewedBy: i > 0 ? boyWarden._id : undefined,
        reviewedAt: i > 0 ? new Date() : undefined
      });
    }
    console.log('✓ Outpasses created');

    // Create Complaints
    const categories = ['electrical', 'plumbing', 'furniture', 'cleaning', 'wifi', 'security', 'mess', 'other'];
    const complaintStatuses = ['pending', 'in_progress', 'resolved', 'pending', 'pending'];
    for (let i = 0; i < 10; i++) {
      const student = createdStudents[i % createdStudents.length];
      await Complaint.create({
        studentId: student.student._id,
        hostelId: student.student.hostelId,
        category: categories[i % categories.length],
        title: ['WiFi connectivity issue in room', 'Water leakage from bathroom tap', 'Fan not working', 'Broken study table', 'Room cleaning pending', 'Socket not working', 'Mess food quality issue', 'Main gate security concern'][i % 8],
        description: 'Detailed description of the issue that requires immediate attention from the maintenance team.',
        priority: ['low', 'medium', 'high', 'urgent'][i % 4],
        status: complaintStatuses[i % complaintStatuses.length]
      });
    }
    console.log('✓ Complaints created');

    // Create Fee Records
    for (const s of createdStudents) {
      const hostelFee = s.student.hostelId.toString() === boysHostel._id.toString() ? 45000 : 55000;
      await Fee.create({
        studentId: s.student._id,
        hostelId: s.student.hostelId,
        academicYear: '2024-25',
        semester: 1,
        hostelFee,
        messFee: 18000,
        maintenanceFee: 2000,
        otherFees: 500,
        totalFee: hostelFee + 20500,
        paidAmount: Math.random() > 0.5 ? hostelFee + 20500 : Math.floor((hostelFee + 20500) * 0.5),
        dueDate: new Date('2025-01-31')
      });
    }
    console.log('✓ Fee records created');

    // Create Announcements
    await Announcement.insertMany([
      {
        title: 'Hostel Fee Payment Deadline – Semester I 2024-25',
        content: 'All students are informed that the last date for payment of Hostel Fee for Semester I (2024-25) is 31st January 2025. Students who fail to pay by the deadline will incur a late fine of ₹500 per week. Please ensure timely payment through the online portal or at the accounts office.',
        type: 'fee',
        targetAudience: 'students',
        publishedBy: admin._id,
        isPinned: true,
        isActive: true
      },
      {
        title: 'Scheduled Water Supply Maintenance – Block A',
        content: 'There will be a scheduled maintenance of water supply lines in Block A from 10:00 AM to 2:00 PM on Saturday. Students are requested to store sufficient water beforehand. We apologize for the inconvenience.',
        type: 'maintenance',
        targetAudience: 'all',
        publishedBy: boyWarden._id,
        isActive: true
      },
      {
        title: 'Diwali Holiday – Hostel Schedule',
        content: 'The hostel mess will remain closed from 20th October to 25th October during the Diwali vacation. The hostel gates will close at 10:00 PM daily. Students staying during the vacation must register with the warden.',
        type: 'event',
        targetAudience: 'all',
        publishedBy: admin._id,
        isActive: true
      },
      {
        title: 'New Mess Menu Effective from November 2024',
        content: 'A revised and nutritionally balanced mess menu will be effective from 1st November 2024. The new menu has been prepared in consultation with a nutritionist and includes regional food items. Please check the Mess Menu section for the complete weekly schedule.',
        type: 'general',
        targetAudience: 'students',
        publishedBy: admin._id,
        isActive: true
      },
      {
        title: 'Enhanced Security Protocols – Night Curfew',
        content: 'Effective immediately, the hostel night curfew has been revised to 10:30 PM on weekdays and 11:30 PM on weekends. All students must carry their ID cards at all times. Any violations will be reported to the academic department.',
        type: 'urgent',
        targetAudience: 'students',
        publishedBy: superAdmin._id,
        isPinned: true,
        isActive: true
      }
    ]);
    console.log('✓ Announcements created');

    // Create Mess Menu
    await MessMenu.create({
      hostelId: boysHostel._id,
      weekStartDate: new Date('2024-11-04'),
      menu: {
        monday:    { breakfast: 'Idli Sambar, Coconut Chutney, Tea/Coffee', lunch: 'Rice, Dal Fry, Aloo Gobhi, Papad, Buttermilk', snacks: 'Samosa, Tea', dinner: 'Chapati, Paneer Butter Masala, Rice, Dal, Salad' },
        tuesday:   { breakfast: 'Poha, Boiled Eggs, Banana, Tea/Coffee', lunch: 'Rice, Rajma, Mixed Veg, Roti, Curd', snacks: 'Vada Pav, Tea', dinner: 'Chapati, Chicken Curry, Rice, Dal, Salad' },
        wednesday: { breakfast: 'Upma, Coconut Chutney, Tea/Coffee', lunch: 'Rice, Sambar, Rasam, Papad, Pickle', snacks: 'Bread Pakoda, Tea', dinner: 'Chapati, Egg Curry, Rice, Dal Makhani, Salad' },
        thursday:  { breakfast: 'Dosa, Sambar, Chutney, Tea/Coffee', lunch: 'Biryani (Veg/Chicken), Raita, Salad', snacks: 'Popcorn, Juice', dinner: 'Chapati, Mixed Dal, Aloo Matar, Rice, Salad' },
        friday:    { breakfast: 'Paratha, Curd, Pickle, Tea/Coffee', lunch: 'Rice, Dal Tadka, Bhindi Masala, Roti, Buttermilk', snacks: 'Jalebi, Tea', dinner: 'Chapati, Fish Curry, Rice, Dal, Salad' },
        saturday:  { breakfast: 'Pongal, Chutney, Vada, Tea/Coffee', lunch: 'Rice, Sambar, Papad, Payasam, Pickle', snacks: 'Chips, Juice', dinner: 'Naan, Paneer Tikka Masala, Rice, Dal, Ice Cream' },
        sunday:    { breakfast: 'Poori, Aloo Bhaji, Tea/Coffee', lunch: 'Biryani (Veg/Mutton), Raita, Boiled Eggs, Dessert', snacks: 'Cake, Coffee', dinner: 'Chapati, Mixed Veg, Dal, Rice, Sweet' }
      },
      createdBy: admin._id,
      isActive: true
    });
    console.log('✓ Mess menu created');

    console.log('\n✅ SEED COMPLETE!\n');
    console.log('=== LOGIN CREDENTIALS ===');
    console.log('Super Admin : superadmin@vignan.ac.in  / Admin@123');
    console.log('Admin       : admin@vignan.ac.in       / Admin@123');
    console.log('Warden(M)   : warden.boys@vignan.ac.in / Warden@123');
    console.log('Warden(F)   : warden.girls@vignan.ac.in/ Warden@123');
    console.log('Student 1   : arjun.sharma@student.vignan.ac.in / Student@123');
    console.log('Student 2   : priya.reddy@student.vignan.ac.in  / Student@123');
    console.log('=========================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
