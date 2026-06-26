import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

function SidebarItem({ icon: Icon, title, description, path, badge, arrow }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `group flex items-center justify-between rounded-2xl p-4 transition-all duration-200
        ${isActive ? 'bg-white/10 text-primary' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex gap-4 items-center min-w-0 flex-1 pr-4">
            <Icon size={18} className="shrink-0" />

            <div className="min-w-0">
              <h3
                className={`font-semibold transition-colors text-sm truncate ${
                  isActive ? 'text-primary' : 'text-white'
                }`}
              >
                {title}
              </h3>

              <p
                className={`text-[12px] line-clamp-2 transition-colors ${
                  isActive ? 'text-primary/70' : 'text-slate-400'
                }`}
              >
                {description}
              </p>
            </div>
          </div>

          {badge && (
            <span
              className={`flex h-6! w-6! shrink-0 items-center justify-center rounded-full text-[12px] transition-all duration-200 ${
                isActive ? 'bg-primary/20 text-primary' : 'bg-white/10 text-slate-300'
              }`}
            >
              {badge}
            </span>
          )}

          {arrow && (
            <ChevronRight
              size={18}
              className={`shrink-0 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'
              }`}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default SidebarItem;
