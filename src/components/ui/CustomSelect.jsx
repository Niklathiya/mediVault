import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, onChange, style = {}, children, required }) {
  const [open, setOpen] = useState(false);
  const { width, ...selectStyle } = style;
  const isBlock = !!width;

  return (
    <div
      style={{
        position: 'relative',
        display: isBlock ? 'block' : 'inline-block',
        width: width || 'auto',
      }}
    >
      <select
        value={value}
        required={required}
        onMouseDown={() => setOpen((o) => !o)}
        onChange={(e) => {
          onChange?.(e);
          setOpen(false);
        }}
        onBlur={() => setOpen(false)}
        style={{
          ...selectStyle,
          width: isBlock ? '100%' : 'auto',
          boxSizing: 'border-box',
          appearance: 'none',
          paddingRight: 36,
        }}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: `translateY(-50%) rotate(${open ? '180deg' : '0deg'})`,
          transition: 'transform 180ms ease',
          pointerEvents: 'none',
          color: 'var(--fg-on-light-muted)',
        }}
      />
    </div>
  );
}
