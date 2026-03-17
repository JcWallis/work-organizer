import WorkItemForm from "@/components/work-items/WorkItemForm";

export default function NewWorkItemPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">New Work Item</h1>
      <WorkItemForm />
    </div>
  );
}
