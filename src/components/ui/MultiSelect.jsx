import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function MultiSelect({
  label,
  options = [],
  selectedValues = [],
  onChange,
  placeholder,
  style = {}
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value) => {
    let next;
    if (selectedValues.includes(value)) {
      next = selectedValues.filter((v) => v !== value);
    } else {
      next = [...selectedValues, value];
    }
    onChange(next);
    setOpen(false);
  };

  const buttonStyle = {
    padding: '9px 14px',
    border: '1px solid var(--border-ui)',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontSize: 13,
    background: 'var(--surface)',
    color: 'var(--fg-on-light)',
    cursor: 'pointer',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    userSelect: 'none',
    ...style
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(!open)} style={buttonStyle}>
        <span>
          {label}: {selectedValues.length === 0 ? (placeholder || 'All') : `${selectedValues.length} selected`}
        </span>
        <ChevronDown
          size={14}
          style={{
            transform: `rotate(${open ? '180deg' : '0deg'})`,
            transition: 'transform 180ms ease',
            color: 'var(--fg-on-light-muted)',
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            minWidth: 200,
            background: 'var(--surface)',
            border: '1px solid var(--border-card)',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '6px 0',
            maxHeight: 250,
            overflowY: 'auto',
          }}
        >
          {options.map((opt) => {
            const isString = typeof opt === 'string';
            const val = isString ? opt : opt.value;
            const text = isString ? opt : opt.label;
            const isSelected = selectedValues.includes(val);

            return (
              <div
                key={val}
                onClick={() => handleToggle(val)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: 13,
                  color: 'var(--fg-on-light)',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--surface-subtle)' : 'transparent',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--surface-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{text}</span>
                {isSelected && <Check size={14} style={{ color: 'var(--primary, #3b82f6)' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
