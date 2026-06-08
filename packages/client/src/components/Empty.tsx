interface EmptyProps {
  icon?: string;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

function Empty({
  icon = '📭',
  title = '暂无数据',
  description,
  actionText,
  onAction,
  className = '',
}: EmptyProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-6xl mb-4 animate-bounce-slow">{icon}</div>
      <h3 className="text-lg font-medium text-slate-300 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm text-center max-w-xs mb-4">{description}</p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="game-btn-primary text-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default Empty;
