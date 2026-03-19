import {
  DIMENSIONS,
  DIMENSION_HEX,
  type DimensionKey,
} from '@/lib/dimensions';

export function DimensionToggle({
  active,
  onChange,
}: {
  active: DimensionKey;
  onChange: (key: DimensionKey) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DIMENSIONS.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-civic-blue text-white'
                : 'bg-white/90 text-text-muted hover:bg-white hover:text-text'
            }`}
            style={
              isActive && key !== 'composite'
                ? { backgroundColor: DIMENSION_HEX[key] }
                : undefined
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
