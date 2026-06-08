interface LoadingProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

function Loading({ fullScreen = false, size = 'md', text = '加载中...' }: LoadingProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-[400px]' : ''}`}>
      <div className="relative">
        <div className={`${sizeMap[size]} border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin`}></div>
        <div className={`absolute inset-0 ${sizeMap[size]} border-4 border-transparent border-t-purple-500 rounded-full animate-spin`} style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
      </div>
      {text && <p className="mt-3 text-slate-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

export function SkeletonCard() {
  return (
    <div className="game-card p-4 animate-pulse">
      <div className="aspect-square bg-slate-700 rounded-lg mb-3"></div>
      <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-3 bg-slate-700 rounded w-1/2 mx-auto"></div>
    </div>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default Loading;
