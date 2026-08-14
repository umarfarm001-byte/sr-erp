import { prisma } from '@/lib/prisma';
import DepartmentsClient from './DepartmentsClient';

export default async function DepartmentsPage() {
  const operations = await prisma.operation.findMany({
    where: { 
      status: { not: 'done' }
    },
    include: {
      article: true
    }
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      department: true
    }
  });

  return <DepartmentsClient operations={operations} users={users} />;
}
