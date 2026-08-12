import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Zap, Shield, Move, Copy } from 'lucide-react';
import { cn } from "@/lib/utils";

const riskConfig = {
  safe: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: Shield },
  low: { color: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: Info },
  medium: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: AlertTriangle },
  high: { color: "bg-red-500/10 text-red-400 border-red-500/30", icon: AlertTriangle }
};

const presetIcons = {
  mirror: Copy,
  incremental: Zap,
  move: Move,
  highspeed: Zap,
  safe: Shield
};

export default function PresetCard({ preset, isSelected, onClick }) {
  const RiskIcon = riskConfig[preset.risk].icon;
  const PresetIcon = presetIcons[preset.id] || Copy;
  
  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 border-2",
        "hover:scale-[1.02] hover:shadow-2xl group",
        isSelected
          ? "bg-gradient-to-br from-pink-600/20 to-cyan-600/20 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
          : "bg-slate-900/50 border-slate-800 hover:border-pink-500/50"
      )}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "bg-gradient-to-br from-pink-500/10 to-cyan-500/10"
      )} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300",
              isSelected 
                ? "bg-gradient-to-br from-pink-500 to-pink-600 shadow-[0_0_20px_rgba(236,72,153,0.5)]" 
                : "bg-slate-800 group-hover:bg-pink-600/20"
            )}>
              <PresetIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{preset.name}</h3>
              <p className="text-sm text-slate-400">{preset.shortDesc}</p>
            </div>
          </div>
          
          <Badge className={cn("border", riskConfig[preset.risk].color)}>
            <RiskIcon className="w-3 h-3 mr-1" />
            {preset.risk}
          </Badge>
        </div>
        
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {preset.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide min-w-[80px]">
              Flags:
            </span>
            <code className="text-xs text-pink-400 font-mono bg-slate-950/50 px-2 py-1 rounded">
              {preset.flags}
            </code>
          </div>
          
          {preset.warnings && (
            <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-300 leading-relaxed">
                <span className="font-semibold">Warning:</span> {preset.warnings}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-r-[60px] border-t-pink-500 border-r-transparent">
          <div className="absolute -top-[55px] -right-[55px] w-8 h-8 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
      )}
    </Card>
  );
}