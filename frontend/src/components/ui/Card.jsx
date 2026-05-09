import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/80 shadow-sm',
        hover && 'hover:shadow-md hover:border-slate-300 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, title, subtitle, action, className }) {
  return (
    <div className={cn('px-5 pt-5 pb-3 flex items-start justify-between', className)}>
      <div>
        {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl', className)}>
      {children}
    </div>
  );
}
