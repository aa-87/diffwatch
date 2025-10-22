import { PrismaClient } from '@prisma/client'
const prisma=new PrismaClient();
async function main(){await prisma.user.upsert({where:{email:'demo@diffwatch.io'},update:{},create:{email:'demo@diffwatch.io',plan:'FREE'}});console.log('Seeded demo user');}
main().finally(()=>prisma.$disconnect())
