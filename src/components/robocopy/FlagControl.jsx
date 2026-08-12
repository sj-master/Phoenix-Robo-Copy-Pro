import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FlagControl({ flag, value, onChange, type = "boolean" }) {
  return (
    <div className={cn(
      "group p-4 rounded-xl border-2 transition-all duration-200",
      "bg-slate-900/30 border-slate-800 hover:border-pink-500/40 hover:bg-slate-900/50",
      flag.dangerous && "border-red-500/30 bg-red-500/5"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Label className="text-white font-semibold text-base cursor-pointer">
              {flag.name}
            </Label>
            
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-slate-500 hover:text-cyan-400 transition-colors cursor-help" />
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className="max-w-sm bg-slate-950 border-slate-700 text-slate-200"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-cyan-400">{flag.flag}</p>
                    <p className="text-sm leading-relaxed">{flag.description}</p>
                    {flag.example && (
                      <code className="block text-xs bg-slate-900 p-2 rounded mt-2 text-pink-400">
                        {flag.example}
                      </code>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <code className="text-xs font-mono text-pink-400 bg-slate-950/70 px-2 py-0.5 rounded">
              {flag.flag}
            </code>
            
            {flag.dangerous && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Destructive
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-slate-400 leading-relaxed">
            {flag.shortDesc}
          </p>
        </div>
        
        <div className="flex-shrink-0">
          {type === "boolean" && (
            <Switch
              checked={value}
              onCheckedChange={onChange}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-cyan-500"
            />
          )}
          
          {type === "number" && (
            <Input
              type="number"
              value={value}
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              className="w-24 bg-slate-950/50 border-slate-700 text-white"
              min={flag.min}
              max={flag.max}
            />
          )}
        </div>
      </div>
      
      {type === "slider" && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Value: </span>
            <span className="text-sm font-bold text-cyan-400">{value}</span>
          </div>
          <Slider
            value={[value]}
            onValueChange={(vals) => onChange(vals[0])}
            min={flag.min}
            max={flag.max}
            step={flag.step || 1}
            className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-pink-500 [&_[role=slider]]:to-cyan-500 [&_[role=slider]]:border-0"
          />
        </div>
      )}
    </div>
  );
}