import bcrypt from 'bcryptjs';

const password = 'bfeastas123';
const hash = bcrypt.hashSync(password, 10);
console.log('Generated hash:', hash);
console.log('compareSync result:', bcrypt.compareSync(password, hash));
