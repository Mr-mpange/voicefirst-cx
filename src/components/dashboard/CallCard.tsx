import type { ActiveCall } from "@/lib/mockData";
import StatusBadge from "./StatusBadge";
import { Phone, ArrowRightLeft, XCircle, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CallCardProps {
  call: ActiveCall;
  selected: boolean;
  onSelect: (id: string) => void;
}

const CallCard = ({ call, selected, onSelect }: CallCardProps) => {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all duration-200 hover:border-primary/50 ${
        selected ? "border-primary bg-primary/5" : "border-border/50"
      }`}
      onClick={() => onSelect(call.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-sm text-foreground">{call.callerName}</h4>
          <p className="text-xs text-muted-foreground">{call.topic}</p>
        </div>
        <StatusBadge status={call.status} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {call.duration}
          </span>
          {call.aiConfidence > 0 && (
            <span className={`font-medium ${call.aiConfidence > 70 ? "text-success" : "text-warning"}`}>
              {call.aiConfidence}% AI
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
            <Phone className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
            <ArrowRightLeft className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
            <XCircle className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
            <Tag className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CallCard;
