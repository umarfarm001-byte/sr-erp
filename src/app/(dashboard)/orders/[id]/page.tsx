import { prisma } from '@/lib/prisma';
import JobCardClient from './JobCardClient';

export default async function JobCardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = await prisma.article.findUnique({
    where: { id: resolvedParams.id },
    include: {
      operations: {
        orderBy: { opId: 'asc' },
        include: { dailyProgresses: true }
      }
    }
  });

  if (!article) {
    return <div className="p-12 text-center text-slate-500 font-bold">Article not found!</div>;
  }

  let linkedOperations: any[] = [];
  if (article.linkedArticleId) {
    const linked = await prisma.article.findUnique({
      where: { id: article.linkedArticleId },
      include: { operations: true }
    });
    if (linked) {
      linkedOperations = linked.operations;
    }
  }

  return <JobCardClient order={article} linkedOperations={linkedOperations} />;
}
