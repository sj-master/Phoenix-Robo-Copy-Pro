import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  FolderOpen,
  Sparkles,
  Settings2,
  Filter,
  Info,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import PresetCard from '../components/robocopy/PresetCard';
import FlagControl from '../components/robocopy/FlagControl';
import CommandPreview from '../components/robocopy/CommandPreview';
import PathSelector from '../components/robocopy/PathSelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESETS = [
  {
    id: 'mirror',
    name: 'Mirror Mode',
    shortDesc: 'Exact replica sync',
    description: 'Creates an exact mirror of the source at the destination. This will delete files at the destination that don\'t exist in the source.',
    flags: '/MIR /COPY:DAT /R:3 /W:5',
    risk: 'high',
    warnings: 'This will DELETE files at the destination that don\'t exist in source. Use with extreme caution.',
    config: { mirror: true, copy_data: true, copy_attributes: true, copy_timestamps: true, retry_count: 3, wait_time: 5 }
  },
  {
    id: 'incremental',
    name: 'Incremental Backup',
    shortDesc: 'Copy new & changed',
    description: 'Copies only new and changed files from source to destination. Excludes older files. Perfect for regular backups.',
    flags: '/E /XO /COPY:DATS',
    risk: 'safe',
    config: { subdirs_empty: true, exclude_older: true, copy_data: true, copy_attributes: true, copy_timestamps: true, copy_security: true }
  },
  {
    id: 'move',
    name: 'Move Mode',
    shortDesc: 'Transfer & delete source',
    description: 'Moves files from source to destination, deleting them from the source after successful copy.',
    flags: '/MOVE /E',
    risk: 'high',
    warnings: 'This will DELETE files from the source after copying. Cannot be undone.',
    config: { move: true, subdirs_empty: true }
  },
  {
    id: 'highspeed',
    name: 'High-Speed Multi-threaded',
    shortDesc: 'Maximum performance',
    description: 'Uses multiple threads for faster copying. Great for large file operations on fast drives.',
    flags: '/E /MT:32 /R:1 /W:1',
    risk: 'low',
    config: { subdirs_empty: true, multithreaded: true, threads: 32, retry_count: 1, wait_time: 1 }
  },
  {
    id: 'safe',
    name: 'Safe Copy',
    shortDesc: 'No overwrites',
    description: 'Copies files safely without overwriting existing files. Skips newer, older, and changed files.',
    flags: '/E /XO /XN /XC',
    risk: 'safe',
    config: { subdirs_empty: true, exclude_older: true, exclude_newer: true, exclude_changed: true }
  }
];

const FLAG_DEFINITIONS = {
  basic: [
    { id: 'mirror', name: 'Mirror Mode', flag: '/MIR', shortDesc: 'Mirror directory tree (equivalent to /E + /PURGE)', description: 'Mirrors a directory tree. This means it will copy all subdirectories including empty ones, and will purge (delete) files and directories at the destination that no longer exist in the source.', dangerous: true },
    { id: 'subdirs_empty', name: 'Copy Subdirectories', flag: '/E', shortDesc: 'Copy subdirectories, including empty ones', description: 'Copies subdirectories. Note this includes empty directories. Without this, only the root directory files are copied.' },
    { id: 'restartable', name: 'Restartable Mode', flag: '/Z', shortDesc: 'Copy files in restartable mode', description: 'Copies files in restartable mode. If the copy is interrupted, it can be resumed from where it left off. Slower but safer for unreliable networks.' },
    { id: 'backup_mode', name: 'Backup Mode', flag: '/B', shortDesc: 'Copy in backup mode', description: 'Copies files in Backup mode, which can override file security settings. Requires backup privileges.' },
  ],
  performance: [
    { id: 'multithreaded', name: 'Multi-threaded Copy', flag: '/MT', shortDesc: 'Create multi-threaded copies', description: 'Creates multi-threaded copies with n threads (default 8). Can significantly speed up copying of large numbers of files.', type: 'boolean' },
    { id: 'threads', name: 'Thread Count', flag: '/MT:n', shortDesc: 'Number of threads to use', description: 'Specifies the number of threads to use for multi-threaded copying. Higher values = faster but more CPU/disk usage. Range: 1-128.', type: 'slider', min: 1, max: 128, step: 1 },
    { id: 'retry_count', name: 'Retry Count', flag: '/R:n', shortDesc: 'Number of retries on failed copies', description: 'Number of Retries on failed copies. Default is 1 million. Lower this for faster failure on problematic files.', type: 'number', min: 0, max: 100 },
    { id: 'wait_time', name: 'Wait Time', flag: '/W:n', shortDesc: 'Wait time between retries', description: 'Wait time between retries in seconds. Default is 30 seconds. Lower this to retry faster.', type: 'number', min: 0, max: 60 },
  ],
  dangerous: [
    { id: 'purge', name: 'Purge', flag: '/PURGE', shortDesc: 'Delete files that no longer exist in source', description: 'Deletes destination files and directories that no longer exist in the source. Use with extreme caution.', dangerous: true },
    { id: 'mov', name: 'Move Files', flag: '/MOV', shortDesc: 'Move files (delete from source after copy)', description: 'Moves files (deletes from source after copying). Use carefully as this cannot be undone.', dangerous: true },
    { id: 'move', name: 'Move Files & Dirs', flag: '/MOVE', shortDesc: 'Move files and directories', description: 'Moves files AND directories (deletes from source after copying). More destructive than /MOV.', dangerous: true },
  ],
  copyOptions: [
    { id: 'copy_data', name: 'Data', flag: 'D', shortDesc: 'Copy file data', description: 'Copies the actual file data/contents.' },
    { id: 'copy_attributes', name: 'Attributes', flag: 'A', shortDesc: 'Copy file attributes', description: 'Copies file attributes like Read-only, Hidden, System, Archive.' },
    { id: 'copy_timestamps', name: 'Timestamps', flag: 'T', shortDesc: 'Copy file timestamps', description: 'Copies file timestamps (Created, Modified, Accessed).' },
    { id: 'copy_security', name: 'Security', flag: 'S', shortDesc: 'Copy NTFS ACLs', description: 'Copies NTFS file security (Access Control Lists).' },
    { id: 'copy_owner', name: 'Owner Info', flag: 'O', shortDesc: 'Copy owner information', description: 'Copies file ownership information.' },
    { id: 'copy_auditing', name: 'Auditing Info', flag: 'U', shortDesc: 'Copy auditing information', description: 'Copies file auditing information.' },
  ],
  selection: [
    { id: 'exclude_older', name: 'Exclude Older', flag: '/XO', shortDesc: 'Exclude older files', description: 'Excludes older files - if the destination file is newer than source, skip it.' },
    { id: 'exclude_newer', name: 'Exclude Newer', flag: '/XN', shortDesc: 'Exclude newer files', description: 'Excludes newer files - if the source file is newer, skip it.' },
    { id: 'exclude_changed', name: 'Exclude Changed', flag: '/XC', shortDesc: 'Exclude changed files', description: 'Excludes changed files (same timestamp but different size).' },
    { id: 'exclude_extra', name: 'Exclude Extra', flag: '/XX', shortDesc: 'Exclude extra files at destination', description: 'Excludes extra files and directories present at destination but not at source.' },
  ],
  logging: [
    { id: 'no_progress', name: 'No Progress', flag: '/NP', shortDesc: 'No progress indicator', description: 'Don\'t display the percentage progress for each file.' },
    { id: 'no_file_list', name: 'No File List', flag: '/NFL', shortDesc: 'No file list output', description: 'Don\'t log the list of files copied.' },
    { id: 'no_dir_list', name: 'No Directory List', flag: '/NDL', shortDesc: 'No directory list output', description: 'Don\'t log the list of directories processed.' },
    { id: 'tee', name: 'Output to Console & Log', flag: '/TEE', shortDesc: 'Output to both console and log file', description: 'Outputs to console window as well as the log file (if /LOG is specified).' },
    { id: 'list_only', name: 'List Only (Dry Run)', flag: '/L', shortDesc: 'List only - don\'t copy, delete, or timestamp any files', description: 'List only mode - simulates the operation without making any changes. Perfect for testing your command before running it for real.' },
  ]
};

export default function RobocopyBuilder() {
  const queryClient = useQueryClient();
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [sourcePath, setSourcePath] = useState('');
  const [destPath, setDestPath] = useState('');
  const [flags, setFlags] = useState({});
  const [includeFiles, setIncludeFiles] = useState('');
  const [excludeFiles, setExcludeFiles] = useState('');
  const [excludeDirs, setExcludeDirs] = useState('');
  const [logPath, setLogPath] = useState('');
  const [profileName, setProfileName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);

  const { data: savedProfiles = [] } = useQuery({
    queryKey: ['robocopyProfiles'],
    queryFn: () => base44.entities.RobocopyProfile.list('-updated_date'),
  });

  const saveProfileMutation = useMutation({
    mutationFn: (profile) => base44.entities.RobocopyProfile.create(profile),
    onSuccess: () => {
      queryClient.invalidateQueries(['robocopyProfiles']);
      setSaveDialogOpen(false);
      setProfileName('');
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id) => base44.entities.RobocopyProfile.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['robocopyProfiles']),
  });

  const generateCommand = () => {
    let cmd = 'robocopy';
    
    if (!sourcePath || !destPath) return cmd + ' [SOURCE] [DESTINATION]';
    
    cmd += ` "${sourcePath}" "${destPath}"`;
    
    // Add flags
    if (flags.mirror) cmd += ' /MIR';
    if (flags.subdirs_empty && !flags.mirror) cmd += ' /E';
    if (flags.restartable) cmd += ' /Z';
    if (flags.backup_mode) cmd += ' /ZB';
    if (flags.purge && !flags.mirror) cmd += ' /PURGE';
    if (flags.mov) cmd += ' /MOV';
    if (flags.move) cmd += ' /MOVE';
    
    // Copy options
    const copyFlags = [];
    if (flags.copy_data) copyFlags.push('D');
    if (flags.copy_attributes) copyFlags.push('A');
    if (flags.copy_timestamps) copyFlags.push('T');
    if (flags.copy_security) copyFlags.push('S');
    if (flags.copy_owner) copyFlags.push('O');
    if (flags.copy_auditing) copyFlags.push('U');
    if (copyFlags.length > 0) cmd += ` /COPY:${copyFlags.join('')}`;
    
    // Selection flags
    if (flags.exclude_older) cmd += ' /XO';
    if (flags.exclude_newer) cmd += ' /XN';
    if (flags.exclude_changed) cmd += ' /XC';
    if (flags.exclude_extra) cmd += ' /XX';
    
    // Performance
    if (flags.multithreaded) cmd += ` /MT:${flags.threads || 8}`;
    if (flags.retry_count !== undefined) cmd += ` /R:${flags.retry_count}`;
    if (flags.wait_time !== undefined) cmd += ` /W:${flags.wait_time}`;
    
    // Filters
    if (includeFiles) {
      includeFiles.split(' ').filter(f => f).forEach(pattern => {
        cmd += ` "${pattern}"`;
      });
    }
    if (excludeFiles) {
      excludeFiles.split(' ').filter(f => f).forEach(pattern => {
        cmd += ` /XF "${pattern}"`;
      });
    }
    if (excludeDirs) {
      excludeDirs.split(' ').filter(f => f).forEach(pattern => {
        cmd += ` /XD "${pattern}"`;
      });
    }
    
    // Logging
    if (flags.list_only) cmd += ' /L';
    if (flags.no_progress) cmd += ' /NP';
    if (flags.no_file_list) cmd += ' /NFL';
    if (flags.no_dir_list) cmd += ' /NDL';
    if (flags.tee) cmd += ' /TEE';
    if (logPath) cmd += ` /LOG:"${logPath}"`;
    
    return cmd;
  };

  const getWarnings = () => {
    const warnings = [];
    
    if (flags.mirror) {
      warnings.push({
        title: 'Mirror Mode Active',
        message: 'This will DELETE files at the destination that don\'t exist in the source. Make absolutely sure this is what you want before running this command.'
      });
    }
    
    if (flags.purge) {
      warnings.push({
        title: 'Purge Mode Active',
        message: 'Files and folders at the destination that don\'t exist in source will be DELETED.'
      });
    }
    
    if (flags.move || flags.mov) {
      warnings.push({
        title: 'Move Mode Active',
        message: 'Files will be DELETED from the source after copying. This operation cannot be undone.'
      });
    }
    
    if (!sourcePath || !destPath) {
      warnings.push({
        title: 'Missing Paths',
        message: 'Please specify both source and destination paths to generate a valid command.'
      });
    }
    
    return warnings;
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setFlags(preset.config || {});
  };

  const handleFlagChange = (flagId, value) => {
    setFlags(prev => ({ ...prev, [flagId]: value }));
    if (selectedPreset !== 'custom') setSelectedPreset('custom');
  };

  const handleSaveProfile = () => {
    if (!profileName) return;
    
    saveProfileMutation.mutate({
      profile_name: profileName,
      source_path: sourcePath,
      destination_path: destPath,
      preset_mode: selectedPreset,
      flags: flags,
      include_files: includeFiles,
      exclude_files: excludeFiles,
      exclude_dirs: excludeDirs,
      log_path: logPath,
    });
  };

  const handleLoadProfile = (profile) => {
    setSourcePath(profile.source_path || '');
    setDestPath(profile.destination_path || '');
    setSelectedPreset(profile.preset_mode || 'custom');
    setFlags(profile.flags || {});
    setIncludeFiles(profile.include_files || '');
    setExcludeFiles(profile.exclude_files || '');
    setExcludeDirs(profile.exclude_dirs || '');
    setLogPath(profile.log_path || '');
    setLoadDialogOpen(false);
  };

  const command = generateCommand();
  const warnings = getWarnings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-2xl blur-xl opacity-50" />
                  <div className="relative bg-gradient-to-br from-pink-600 to-cyan-600 p-3 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-cyan-400 bg-clip-text text-transparent">
                    Phoenix RoboCopy Pro
                  </h1>
                  <p className="text-slate-400 mt-1">Professional Command Builder • Web Edition</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Load Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Load Saved Profile</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Select a profile to restore your settings
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {savedProfiles.length === 0 ? (
                      <p className="text-center text-slate-400 py-8">No saved profiles yet</p>
                    ) : (
                      savedProfiles.map(profile => (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between p-4 rounded-lg border-2 border-slate-800 hover:border-pink-500/50 bg-slate-950/50 transition-all"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{profile.profile_name}</h4>
                            <p className="text-sm text-slate-400 mt-1">
                              {profile.source_path} → {profile.destination_path}
                            </p>
                            <Badge className="mt-2 bg-slate-800 text-slate-300">
                              {profile.preset_mode}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleLoadProfile(profile)}
                              className="bg-gradient-to-r from-pink-600 to-cyan-600"
                            >
                              Load
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteProfileMutation.mutate(profile.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500">
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Save Current Configuration</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Save your current settings as a reusable profile
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Profile Name</Label>
                      <Input
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="My Backup Configuration"
                        className="bg-slate-950 border-slate-700 text-white mt-2"
                      />
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={!profileName}
                      className="w-full bg-gradient-to-r from-pink-600 to-cyan-600"
                    >
                      Save Profile
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Command Preview - Always Visible */}
        <CommandPreview command={command} warnings={warnings} />

        {/* Main Content */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-slate-900/50 border-2 border-slate-800 p-1">
            <TabsTrigger value="basic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-cyan-600">
              <FolderOpen className="w-4 h-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-cyan-600">
              <Settings2 className="w-4 h-4 mr-2" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="filters" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-cyan-600">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-cyan-600">
              <Info className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-6">
            {/* Paths */}
            <div className="grid md:grid-cols-2 gap-6">
              <PathSelector
                label="Source Path"
                value={sourcePath}
                onChange={setSourcePath}
                placeholder="C:\Source\Folder"
                type="source"
              />
              <PathSelector
                label="Destination Path"
                value={destPath}
                onChange={setDestPath}
                placeholder="D:\Backup\Folder"
                type="destination"
              />
            </div>

            {/* Presets */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-cyan-500 rounded-full" />
                Choose a Preset Mode
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRESETS.map(preset => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isSelected={selectedPreset === preset.id}
                    onClick={() => handlePresetSelect(preset)}
                  />
                ))}
              </div>
            </div>

            {/* Basic Flags */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-cyan-500 rounded-full" />
                Basic Options
              </h2>
              <div className="grid gap-4">
                {FLAG_DEFINITIONS.basic.map(flag => (
                  <FlagControl
                    key={flag.id}
                    flag={flag}
                    value={flags[flag.id] || false}
                    onChange={(val) => handleFlagChange(flag.id, val)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-8">
            {/* Performance */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-cyan-500 rounded-full" />
                Performance Options
              </h2>
              <div className="grid gap-4">
                {FLAG_DEFINITIONS.performance.map(flag => (
                  <FlagControl
                    key={flag.id}
                    flag={flag}
                    value={flags[flag.id] !== undefined ? flags[flag.id] : (flag.type === 'slider' ? 8 : flag.type === 'number' ? 3 : false)}
                    onChange={(val) => handleFlagChange(flag.id, val)}
                    type={flag.type || 'boolean'}
                  />
                ))}
              </div>
            </div>

            {/* Copy Options */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-cyan-500 rounded-full" />
                What to Copy (COPY Flags)
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {FLAG_DEFINITIONS.copyOptions.map(flag => (
                  <FlagControl
                    key={flag.id}
                    flag={flag}
                    value={flags[flag.id] || false}
                    onChange={(val) => handleFlagChange(flag.id, val)}
                  />
                ))}
              </div>
            </div>

            {/* Selection Options */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-cyan-500 rounded-full" />
                File Selection
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {FLAG_DEFINITIONS.selection.map(flag => (
                  <FlagControl
                    key={flag.id}
                    flag={flag}
                    value={flags[flag.id] || false}
                    onChange={(val) => handleFlagChange(flag.id, val)}
                  />
                ))}
              </div>
            </div>

            {/* Dangerous Operations */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-orange-500 rounded-full" />
                ⚠️ Destructive Operations
              </h2>
              <div className="grid gap-4">
                {FLAG_DEFINITIONS.dangerous.map(flag => (
                  <FlagControl
                    key={flag.id}
                    flag={flag}
                    value={flags[flag.id] || false}
                    onChange={(val) => handleFlagChange(flag.id, val)}
                  />
                ))}
              </div>
            </div>

            {/* Logging */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-cyan-500 rounded-full" />
                Logging & Output
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-semibold mb-2 block">Log File Path (Optional)</Label>
                  <Input
                    value={logPath}
                    onChange={(e) => setLogPath(e.target.value)}
                    placeholder="C:\Logs\robocopy.log"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {FLAG_DEFINITIONS.logging.map(flag => (
                    <FlagControl
                      key={flag.id}
                      flag={flag}
                      value={flags[flag.id] || false}
                      onChange={(val) => handleFlagChange(flag.id, val)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters" className="space-y-6">
            <div className="space-y-6">
              <div>
                <Label className="text-white font-semibold text-lg mb-2 block">Include Files</Label>
                <p className="text-sm text-slate-400 mb-3">
                  Specify file patterns to include (space-separated). Leave empty to include all files.
                </p>
                <Input
                  value={includeFiles}
                  onChange={(e) => setIncludeFiles(e.target.value)}
                  placeholder="*.txt *.pdf *.docx"
                  className="bg-slate-900/50 border-slate-700 text-white font-mono"
                />
                <Badge className="mt-2 bg-slate-800 text-slate-400 border-slate-700">
                  Example: *.txt *.pdf *.docx
                </Badge>
              </div>

              <div>
                <Label className="text-white font-semibold text-lg mb-2 block">Exclude Files</Label>
                <p className="text-sm text-slate-400 mb-3">
                  Specify file patterns to exclude (space-separated). Uses /XF flag.
                </p>
                <Input
                  value={excludeFiles}
                  onChange={(e) => setExcludeFiles(e.target.value)}
                  placeholder="*.tmp *.bak ~*"
                  className="bg-slate-900/50 border-slate-700 text-white font-mono"
                />
                <Badge className="mt-2 bg-slate-800 text-slate-400 border-slate-700">
                  Example: *.tmp *.bak ~* *.log
                </Badge>
              </div>

              <div>
                <Label className="text-white font-semibold text-lg mb-2 block">Exclude Directories</Label>
                <p className="text-sm text-slate-400 mb-3">
                  Specify directory patterns to exclude (space-separated). Uses /XD flag.
                </p>
                <Input
                  value={excludeDirs}
                  onChange={(e) => setExcludeDirs(e.target.value)}
                  placeholder="node_modules .git temp"
                  className="bg-slate-900/50 border-slate-700 text-white font-mono"
                />
                <Badge className="mt-2 bg-slate-800 text-slate-400 border-slate-700">
                  Example: node_modules .git temp cache
                </Badge>
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center">
                <div className="inline-block relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-3xl blur-2xl opacity-50" />
                  <div className="relative bg-gradient-to-br from-pink-600 to-cyan-600 p-6 rounded-3xl">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Phoenix RoboCopy Pro
                </h2>
                <p className="text-xl text-slate-300">Web Command Builder • v1.0.0</p>
              </div>

              <div className="bg-slate-900/50 border-2 border-slate-800 rounded-2xl p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">What is this?</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Phoenix RoboCopy Pro is a professional web-based command builder for Windows Robocopy.
                    It helps you create complex Robocopy commands with an intuitive interface, complete with
                    helpful descriptions and safety warnings for every option.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">How to Use</h3>
                  <ol className="text-slate-300 leading-relaxed space-y-2 list-decimal list-inside">
                    <li>Enter your source and destination paths</li>
                    <li>Choose a preset mode or configure custom options</li>
                    <li>Review the generated command at the top</li>
                    <li>Copy the command to your clipboard</li>
                    <li>Run it in Windows Command Prompt or PowerShell</li>
                    <li>Save your configuration as a profile for reuse</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Safety Tips</h3>
                  <ul className="text-slate-300 leading-relaxed space-y-2 list-disc list-inside">
                    <li>Always use /L (List Only) flag first to preview what will happen</li>
                    <li>Be extremely careful with /MIR, /PURGE, and /MOVE flags - they delete files</li>
                    <li>Test your command on a small set of files first</li>
                    <li>Keep backups before running destructive operations</li>
                    <li>Review all warnings shown in the command preview</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">About Robocopy</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Robocopy (Robust File Copy) is a command-line utility built into Windows for advanced
                    file and directory replication. It's more powerful than standard copy commands and
                    includes features like retry logic, bandwidth throttling, and the ability to mirror
                    directory trees.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}