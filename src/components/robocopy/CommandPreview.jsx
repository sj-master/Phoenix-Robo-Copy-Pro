import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Terminal, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function CommandPreview({ command, warnings = [] }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Card className="border-2 border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-cyan-500">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl text-white">Generated Command</CardTitle>
          </div>
          
          <Button
            onClick={handleCopy}
            size="sm"
            className={cn(
              "transition-all duration-300",
              copied
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-300 mb-1">
                    {warning.title}
                  </p>
                  <p className="text-sm text-red-200/80 leading-relaxed">
                    {warning.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="relative">
          {/* Terminal window decoration */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-slate-500 font-mono">command.bat</span>
          </div>
          
          {/* Command display */}
          <div className="relative group">
            <pre className="bg-slate-900 text-cyan-300 p-4 rounded-lg overflow-x-auto border-2 border-slate-800 font-mono text-sm leading-relaxed shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
              <code>{command || "robocopy [Configure options to generate command]"}</code>
            </pre>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 rounded-lg shadow-[0_0_30px_rgba(236,72,153,0.3)]" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Badge className="bg-slate-800 text-slate-300 border-slate-700">
            {command ? command.split(' ').length : 0} arguments
          </Badge>
          <Badge className="bg-slate-800 text-slate-300 border-slate-700">
            {command ? command.length : 0} characters
          </Badge>
          {warnings.length > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/40">
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}