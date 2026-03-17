import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import Link from "next/link";
import WorkItemBoard from "@/components/work-items/WorkItemBoard";

export default async function WorkItemsPage() {
  const workItems = await prisma.workItem.findMany({
    include: { _count: { select: { tasks: true, notes: true, documents: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Work Items</h1>
        <Link
          href="/work-items/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Item
        </Link>
      </div>
      <WorkItemBoard initialItems={workItems} />
    </div>
  );
}
