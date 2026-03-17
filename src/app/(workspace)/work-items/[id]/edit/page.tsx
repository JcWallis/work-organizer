import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WorkItemForm from "@/components/work-items/WorkItemForm";

export default async function EditWorkItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.workItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Work Item</h1>
      <WorkItemForm
        initial={{
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type as never,
          status: item.status as never,
          visibility: item.visibility as never,
          tags: item.tags,
          metadata: item.metadata as Record<string, unknown> | null,
        }}
      />
    </div>
  );
}
