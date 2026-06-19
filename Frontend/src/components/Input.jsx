const Input = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
        {label}
      </label>
    )}
    <div className="relative group">
      {icon && (
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
          {icon}
        </span>
      )}
      <input
        className={`w-full bg-surface-container-highest border-none border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-3.5 text-on-surface placeholder:text-outline outline-none transition-all ${icon ? 'pl-12 pr-4' : 'px-4'}`}
        {...props}
      />
    </div>
  </div>
);

export default Input;
