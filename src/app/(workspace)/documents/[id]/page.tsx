import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { workItem: { select: { id: true, title: true } } },
  });

  if (!doc) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/documents" className="hover:text-gray-300">Documents</Link>
        {doc.workItem && (
          <>
            <span>·</span>
            <Link href={`/work-items/${doc.workItem.id}`} className="hover:text-gray-300">
              {doc.workItem.title}
            </Link>
          </>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">{doc.title}</h1>
        {doc.description && <p className="text-gray-400">{doc.description}</p>}

        <div className="flex gap-4 text-sm text-gray-500">
          <span>{doc.fileType}</span>
          <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
        </div>

        {doc.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {doc.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Open File ↗
        </a>
      </div>
    </div>
  );
}
