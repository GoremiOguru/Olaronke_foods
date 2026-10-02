import bcrypt from 'bcryptjs';

const hash = "$2a$10$YjEOqpbqXhcHKQ/y1CxMe.nZVcrVy/itVNGyc.1v10meVamnvRF2q";

console.log('bfeastas123 matches:', bcrypt.compareSync('bfeastas123', hash));
console.log('admin123 matches:', bcrypt.compareSync('admin123', hash));
console.log('adminpassword123 matches:', bcrypt.compareSync('adminpassword123', hash));
console.log('olaronke123 matches:', bcrypt.compareSync('olaronke123', hash));
console.log('Generated hash for bfeastas123:', bcrypt.hashSync('bfeastas123', 10));
