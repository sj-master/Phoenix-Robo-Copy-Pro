import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function PathSelector({ 
  label, 
  value, 
  onChange, 
  placeholder,
  type = "source"
}) {
  // Simple validation (in real app, you'd check actual paths)
  const isValid = value && value.length > 3;
  const showValidation = value && value.length > 0;
  
  return (
    <div className="space-y-2">
      <Label className="text-white font-semibold flex items-center gap-2">
        <FolderOpen className={cn(
          "w-4 h-4",
          type === "source" ? "text-cyan-400" : "text-pink-400"
        )} />
        {label}
      </Label>
      
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "bg-slate-900/50 border-2 text-white pr-10 transition-all duration-200",
            "focus:bg-slate-900/70 focus:shadow-[0_0_20px_rgba(236,72,153,0.2)]",
            showValidation && (isValid 
              ? "border-green-500/50 focus:border-green-500" 
              : "border-red-500/50 focus:border-red-500"
            ),
            !showValidation && "border-slate-700 focus:border-pink-500"
          )}
        />
        
        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Badge variant="outline" className="border-slate-700 text-slate-400">
          Example: C:\Users\YourName\Documents
        </Badge>
      </div>
    </div>
  );
}