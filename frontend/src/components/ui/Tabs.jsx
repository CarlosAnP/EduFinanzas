import { useState } from 'react';

export function Tabs({ defaultValue, children, className = '' }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className={className} data-active-tab={active}>
      {typeof children === 'function' ? children({ active, setActive }) : 
        Array.isArray(children) ? children.map(child =>
          child?.type === TabsList || child?.type === TabsContent
            ? { ...child, props: { ...child.props, active, setActive } }
            : child
        ) : children}
    </div>
  );
}

export function TabsList({ children, active, setActive, className = '' }) {
  return (
    <div className={`flex gap-1 bg-slate-100 p-1 rounded-xl ${className}`}>
      {Array.isArray(children) ? children.map(child =>
        child?.type === TabsTrigger ? { ...child, props: { ...child.props, active, setActive } } : child
      ) : children}
    </div>
  );
}

export function TabsTrigger({ value, children, active, setActive, className = '' }) {
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive?.(value)}
      className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer
        ${isActive ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'} ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, active, className = '' }) {
  if (active !== value) return null;
  return <div className={`mt-4 animate-fade-in ${className}`}>{children}</div>;
}
