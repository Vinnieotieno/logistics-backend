require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Staff } = require('../server/models');

async function createStaff() {
  const email = 'leonard.ojungu@globeflight.co.ke';
  const password = 'StaffPassword123!';
  const fullName = 'Leonard Ojungu';
  const role = 'staff';
  const isActive = true;

  // Check if staff already exists
  const existing = await Staff.findOne({ where: { email } });
  if (existing) {
    console.log('Staff already exists:', email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Staff.create({
    email,
    password: hashedPassword,
    fullName,
    role,
    isActive
  });
  console.log('Staff created:', email);
  process.exit(0);
}

createStaff(); 