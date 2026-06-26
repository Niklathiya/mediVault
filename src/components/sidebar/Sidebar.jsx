import { HeartPulse } from 'lucide-react';
import SidebarItem from './SidebarItem';
import { sidebarMenu, sidebarSections } from './sidebarData';

function Sidebar() {
  return (
    <aside
      className="
      w-full
      max-w-[300px]
      shrink-0
      bg-[#16253A]
      text-white
      h-screen
      overflow-y-auto
      border-r
      border-white/10
      "
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e0f2fe] text-slate-900">
            <HeartPulse size={24} className="text-slate-800" strokeWidth={2} />
          </div>

          <div>
            <h2 className="text-md font-bold text-white">MediVault</h2>

            <p className="text-[12px] text-slate-300">BAPS Pramukh Swami Hospital</p>
          </div>
        </div>

        <div className="my-8 border-b border-white/10" />

        <div className="space-y-2">
          {sidebarMenu.map((item) => (
            <SidebarItem key={item.path} {...item} />
          ))}
        </div>

        {sidebarSections.map((section) => (
          <div key={section.label} className="mt-4">
            <h4 className="mb-3 px-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {section.label}
            </h4>

            <div className="space-y-2">
              {section.items.map((item) => (
                <SidebarItem key={item.path} {...item} />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 font-bold text-[12px]">
                HO
              </div>

              <div>
                <p className="font-semibold text-sm">BAPS Pramukh Swami</p>

                <p className="text-[12px] text-slate-400">Arogyam Sarvada</p>
              </div>
            </div>

            <button>⚙️</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
