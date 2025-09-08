import GoalCard from "./GoalCard";

export default function GoalGrid({
  goals,
  onAddTx,
  onEdit,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {goals.map((g) => (
        <GoalCard
          key={g.id}
          goal={g}
          onAddTx={onAddTx}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
