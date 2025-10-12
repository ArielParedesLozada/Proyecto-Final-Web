import EmptyState from './EmptyState';

export default function Empty({ 
  title="Sin datos", 
  subtitle="Aún no hay información para mostrar.", 
  description, 
  icon, 
  variant="default",
  actions,
  size = "default"
}) {
  return (
    <EmptyState
      title={title}
      subtitle={subtitle || description}
      description={description}
      icon={icon}
      variant={variant}
      actions={actions}
      size={size}
    />
  );
}
