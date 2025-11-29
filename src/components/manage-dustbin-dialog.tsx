import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Plus, Trash2, Edit } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface DustbinData {
  id: string;
  name: string;
  location: string;
  overallFillLevel: number;
  wetWasteFillLevel: number;
  dryWasteFillLevel: number;
  lastUpdated: string;
  criticalTimestamp?: number;
}

interface ManageDustbinDialogProps {
  mode: 'add' | 'remove' | 'edit' | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dustbins: DustbinData[];
  onAdd: (location: string) => void;
  onRemove: (dustbinIds: string[]) => void;
  onEdit: (dustbinId: string, newLocation: string) => void;
}

export default function ManageDustbinDialog({
  mode,
  open,
  onOpenChange,
  dustbins,
  onAdd,
  onRemove,
  onEdit
}: ManageDustbinDialogProps) {
  const [location, setLocation] = useState('');
  const [selectedDustbinId, setSelectedDustbinId] = useState('');
  const [selectedDustbinIds, setSelectedDustbinIds] = useState<string[]>([]);
  const [editLocation, setEditLocation] = useState('');

  // Reset selections when dialog is closed or mode changes
  useEffect(() => {
    if (!open) {
      setSelectedDustbinIds([]);
      setSelectedDustbinId('');
      setLocation('');
      setEditLocation('');
    }
  }, [open, mode]);

  const handleSubmit = () => {
    if (mode === 'add' && location.trim()) {
      onAdd(location.trim());
      setLocation('');
      onOpenChange(false);
    } else if (mode === 'remove' && selectedDustbinIds.length > 0) {
      onRemove(selectedDustbinIds);
      setSelectedDustbinIds([]);
      onOpenChange(false);
    } else if (mode === 'edit' && selectedDustbinId && editLocation.trim()) {
      onEdit(selectedDustbinId, editLocation.trim());
      setSelectedDustbinId('');
      setEditLocation('');
      onOpenChange(false);
    }
  };

  const toggleDustbinSelection = (dustbinId: string) => {
    setSelectedDustbinIds(prev => 
      prev.includes(dustbinId)
        ? prev.filter(id => id !== dustbinId)
        : [...prev, dustbinId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDustbinIds.length === dustbins.length) {
      setSelectedDustbinIds([]);
    } else {
      setSelectedDustbinIds(dustbins.map(d => d.id));
    }
  };

  const handleDustbinSelect = (dustbinId: string) => {
    setSelectedDustbinId(dustbinId);
    if (mode === 'edit') {
      const dustbin = dustbins.find(d => d.id === dustbinId);
      if (dustbin) {
        setEditLocation(dustbin.location);
      }
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Dustbin';
      case 'remove': return 'Remove Dustbin';
      case 'edit': return 'Edit Dustbin Location';
      default: return '';
    }
  };

  const getDialogDescription = () => {
    switch (mode) {
      case 'add': return 'Enter the location for the new dustbin. The dustbin ID will be automatically assigned.';
      case 'remove': return 'Select one or more dustbins to remove from the system. Remaining dustbins will be automatically renumbered. This action cannot be undone.';
      case 'edit': return 'Select a dustbin and update its location.';
      default: return '';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'add': return <Plus className="w-5 h-5" />;
      case 'remove': return <Trash2 className="w-5 h-5" />;
      case 'edit': return <Edit className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {mode === 'add' && (
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Central Park North"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}

          {mode === 'remove' && (
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Select Dustbins to Remove</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="h-7 text-xs"
                >
                  {selectedDustbinIds.length === dustbins.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <ScrollArea className="h-64 rounded-md border p-4">
                <div className="space-y-3">
                  {dustbins.map((dustbin) => (
                    <div key={dustbin.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={`dustbin-${dustbin.id}`}
                        checked={selectedDustbinIds.includes(dustbin.id)}
                        onCheckedChange={() => toggleDustbinSelection(dustbin.id)}
                      />
                      <label
                        htmlFor={`dustbin-${dustbin.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{dustbin.name}</span>
                          <span className="text-xs text-gray-500">{dustbin.location}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedDustbinIds.length > 0 && (
                <p className="text-sm text-gray-600">
                  {selectedDustbinIds.length} dustbin{selectedDustbinIds.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          )}

          {mode === 'edit' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="dustbin-edit-select">Select Dustbin</Label>
                <Select value={selectedDustbinId} onValueChange={handleDustbinSelect}>
                  <SelectTrigger id="dustbin-edit-select">
                    <SelectValue placeholder="Choose a dustbin to edit" />
                  </SelectTrigger>
                  <SelectContent>
                    {dustbins.map((dustbin) => (
                      <SelectItem key={dustbin.id} value={dustbin.id}>
                        {dustbin.name} - {dustbin.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDustbinId && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">New Location</Label>
                  <Input
                    id="edit-location"
                    placeholder="Enter new location"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              (mode === 'add' && !location.trim()) ||
              (mode === 'remove' && selectedDustbinIds.length === 0) ||
              (mode === 'edit' && (!selectedDustbinId || !editLocation.trim()))
            }
            className={
              mode === 'remove' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }
          >
            {mode === 'add' && 'Add Dustbin'}
            {mode === 'remove' && `Remove ${selectedDustbinIds.length > 0 ? `(${selectedDustbinIds.length})` : ''} Dustbin${selectedDustbinIds.length !== 1 ? 's' : ''}`}
            {mode === 'edit' && 'Update Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
