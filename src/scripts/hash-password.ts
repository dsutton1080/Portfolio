import bcrypt from 'bcrypt'

async function hashPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log('Hashed password:', hashedPassword)
}

hashPassword('') 