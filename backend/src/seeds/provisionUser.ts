import { connectDB, disconnectDB } from '../config/db.js';
import { authService } from '../services/AuthService.js';
import { UserRole } from '../config/constants.js';

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name: string) => {
    const found = args.find((a) => a.startsWith(`--${name}=`));
    return found ? found.split('=')[1] : null;
  };

  const email = getArg('email') || process.env.USER_EMAIL;
  const password = getArg('password') || process.env.USER_PASSWORD || 'Password123!';
  const fullName = getArg('name') || process.env.USER_NAME || 'Campus Scholar';
  const roleStr = (getArg('role') || 'STUDENT').toUpperCase();
  const role = roleStr === 'FACULTY' ? UserRole.FACULTY : roleStr === 'ADMIN' ? UserRole.ADMIN : UserRole.STUDENT;

  if (!email) {
    console.error('Usage: npm run provision:user -- --email=user@university.edu --password=Password123! --name="Alex Rivera" --role=STUDENT');
    process.exit(1);
  }

  console.log(`[Provision] Connecting to database...`);
  await connectDB();

  try {
    const res = await authService.provisionDevUser({
      email,
      password,
      fullName,
      role,
    });
    console.log(`[Provision Success] ${res.message}`);
    console.log(`  Email: ${res.user.email}`);
    console.log(`  Role:  ${res.user.role}`);
  } catch (err) {
    console.error('[Provision Failed]:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

main();
