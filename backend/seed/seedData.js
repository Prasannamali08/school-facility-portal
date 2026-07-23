require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');
const RepairHistory = require('../models/RepairHistory');

const categories = [
  'Broken Furniture', 'Electrical', 'Water Supply', 'Toilet', 'Classroom',
  'Playground', 'Laboratory', 'Library', 'Boundary Wall', 'Sanitation',
  'Safety Hazard', 'Others',
];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const locations = [
  'Block A - Room 101', 'Block B - Room 205', 'Main Playground', 'Science Lab 1',
  'Library Ground Floor', 'Boys Toilet Block C', 'Girls Toilet Block A',
  'Main Gate', 'Cafeteria', 'Assembly Hall',
];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Issue.deleteMany({}),
      Notification.deleteMany({}),
      RepairHistory.deleteMany({}),
    ]);

    console.log('Creating sample users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@school.edu',
      password: 'Admin@123',
      role: 'admin',
      schoolId: 'SCH-001',
      phone: '9000000001',
    });

    const teacher = await User.create({
      name: 'Priya Sharma',
      email: 'teacher@school.edu',
      password: 'Teacher@123',
      role: 'teacher',
      schoolId: 'SCH-001',
      phone: '9000000002',
    });

    const parent = await User.create({
      name: 'Rahul Verma',
      email: 'parent@school.edu',
      password: 'Parent@123',
      role: 'parent',
      schoolId: 'SCH-001',
      phone: '9000000003',
    });

    const reporters = [teacher, parent];

    console.log('Creating 20 sample issues...');
    const issueTitles = [
      'Broken chair in classroom', 'Flickering lights in corridor', 'No water supply in toilet block',
      'Leaking tap in staff room', 'Cracked window pane', 'Damaged swing in playground',
      'Short circuit near lab entrance', 'Overflowing sanitation drain', 'Broken boundary wall section',
      'Loose ceiling fan in Room 12', 'Library shelf collapsed', 'Slippery stairs near main gate',
      'Non-functional projector', 'Termite damage in wooden desks', 'Water leakage in lab sink',
      'Broken door handle', 'Exposed electrical wiring', 'Blocked drainage near canteen',
      'Missing manhole cover', 'Damaged basketball hoop',
    ];

    const issues = [];
    for (let i = 0; i < 20; i++) {
      const status = randomFrom(statuses);
      const reporter = randomFrom(reporters);
      const createdDaysAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000);

      const timeline = [{ status: 'Pending', note: 'Issue reported', updatedBy: reporter._id, createdAt }];
      let assignedTo = null;
      let resolvedAt = null;

      if (['Assigned', 'In Progress', 'Resolved'].includes(status)) {
        assignedTo = admin._id;
        timeline.push({ status: 'Assigned', note: 'Assigned to maintenance staff', updatedBy: admin._id });
      }
      if (['In Progress', 'Resolved'].includes(status)) {
        timeline.push({ status: 'In Progress', note: 'Repair work started', updatedBy: admin._id });
      }
      if (status === 'Resolved') {
        timeline.push({ status: 'Resolved', note: 'Repair completed', updatedBy: admin._id });
        resolvedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000);
      }
      if (status === 'Rejected') {
        timeline.push({ status: 'Rejected', note: 'Not a valid maintenance request', updatedBy: admin._id });
      }

      const issue = await Issue.create({
        title: issueTitles[i],
        description: `${issueTitles[i]} - reported for immediate attention. This affects daily school operations and needs to be resolved promptly.`,
        category: randomFrom(categories),
        priority: randomFrom(priorities),
        location: randomFrom(locations),
        status,
        images: [],
        reportedBy: reporter._id,
        assignedTo,
        timeline,
        resolvedAt,
        createdAt,
      });
      issues.push(issue);
    }

    console.log('Creating sample notifications...');
    await Notification.create([
      { user: admin._id, message: 'New issue reported: "Broken chair in classroom" (High priority)', type: 'issue_created', issue: issues[0]._id, read: false },
      { user: admin._id, message: 'New issue reported: "Flickering lights in corridor" (Medium priority)', type: 'issue_created', issue: issues[1]._id, read: true },
      { user: teacher._id, message: 'Your issue "Loose ceiling fan in Room 12" has been assigned', type: 'issue_assigned', issue: issues[9]._id, read: false },
      { user: parent._id, message: 'Your issue has been marked as Resolved', type: 'issue_resolved', issue: issues[2]._id, read: false },
    ]);

    console.log('\n✅ Seed complete!\n');
    console.log('Sample accounts:');
    console.log('  Admin:   admin@school.edu   / Admin@123');
    console.log('  Teacher: teacher@school.edu / Teacher@123');
    console.log('  Parent:  parent@school.edu  / Parent@123');
    console.log(`\nCreated ${issues.length} sample issues.\n`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
