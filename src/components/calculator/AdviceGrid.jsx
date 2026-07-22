import { AlertTriangle, CheckCircle, Info } from "lucide-react";

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const borderMap = {
  warning: 'border-l-[hsl(var(--warning))]',
  success: 'border-l-[hsl(var(--neon-green))]',
  info: 'border-l-primary',
};

const iconColorMap = {
  warning: 'text-[hsl(var(--warning))]',
  success: 'text-[hsl(var(--neon-green))]',
  info: 'text-primary',
};

export default function AdviceGrid({ advice }) {
  return (
    <section aria-labelledby="advice-heading" className="mt-10">
      <h2 id="advice-heading" className="text-lg font-bold text-foreground mb-6 tracking-tight">
        Personlig tilpassede råd
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advice.map((item, i) => {
          const Icon = iconMap[item.type] || Info;
          return (
            <article
              key={i}
              className={`bg-card rounded-xl p-6 border-l-4 ${borderMap[item.type] || 'border-l-primary'} border border-border/50 transition-all duration-300 hover:translate-x-1`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 flex-shrink-0 ${iconColorMap[item.type] || 'text-primary'}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-2">
                    {item.icon} {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
