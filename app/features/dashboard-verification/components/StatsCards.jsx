import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DASHBOARD_STATS } from "../constants";

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {DASHBOARD_STATS.map((stat) => (
        <Card key={stat.label} className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <Badge variant="secondary" className={`${stat.bg} ${stat.color} border-none font-bold text-[10px]`}>
                {stat.badge}
              </Badge>
            </div>
            <p className="text-4xl font-extrabold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
