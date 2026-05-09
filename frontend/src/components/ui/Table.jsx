import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80">
      <table className={cn('w-full text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return <thead className={cn('bg-slate-50/80', className)}>{children}</thead>;
}

export function TableBody({ children, className }) {
  return <tbody className={cn('divide-y divide-slate-100', className)}>{children}</tbody>;
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      className={cn('transition-colors hover:bg-slate-50/60', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return <td className={cn('px-4 py-3 text-slate-700', className)}>{children}</td>;
}
