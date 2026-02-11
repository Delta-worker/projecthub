'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Lightbulb,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Eye,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';

// Feature Request type
interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  acceptance_criteria: string[];
  linked_tasks: string[];
  project_id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

function getPriorityInfo(priority: string) {
  switch (priority) {
    case 'must':
      return {
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        badge: 'bg-red-500/10 text-red-500 border-red-500/20',
        label: 'Must Have',
      };
    case 'should':
      return {
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        label: 'Should Have',
      };
    case 'could':
      return {
        icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
        badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        label: 'Could Have',
      };
    default:
      return {
        icon: <Lightbulb className="h-4 w-4 text-slate-500" />,
        badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        label: "Won't Have",
      };
  }
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'actioned':
      return { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: '✅ Actioned' };
    case 'in-progress':
      return { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: '🔄 In Progress' };
    case 'approved':
      return { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: '📋 Approved' };
    case 'archived':
      return { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', label: '📦 Archived' };
    default:
      return { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', label: '📝 Draft' };
  }
}

export default function FeatureRequestsPage() {
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  // Section states
  const [newSectionOpen, setNewSectionOpen] = useState(true);
  const [actionedSectionOpen, setActionedSectionOpen] = useState(false);
  
  // Editing state
  const [selectedFeature, setSelectedFeature] = useState<FeatureRequest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('should');
  const [editStatus, setEditStatus] = useState('draft');
  const [editNotes, setEditNotes] = useState('');
  
  // Creating state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('should');

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/requirements');
      const data = await res.json();
      setFeatures(data);
    } catch (error) {
      console.error('Failed to fetch features:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const filteredFeatures = features.filter((feat) => {
    const matchesSearch = feat.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchived = showArchived || feat.status !== 'archived';
    return matchesSearch && matchesArchived;
  });

  const newFeatures = filteredFeatures.filter(f => 
    ['draft', 'approved', 'in-progress'].includes(f.status)
  );
  
  const actionedFeatures = filteredFeatures.filter(f => 
    f.status === 'actioned'
  );
  
  const archivedFeatures = filteredFeatures.filter(f => 
    f.status === 'archived'
  );

  const handleCreateFeature = async () => {
    if (!newTitle.trim()) return;

    try {
      await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          acceptance_criteria: [],
          linked_tasks: [],
        }),
      });
      setIsCreating(false);
      setNewTitle('');
      setNewDescription('');
      fetchFeatures();
    } catch (error) {
      console.error('Failed to create feature:', error);
    }
  };

  const handleSaveFeature = async () => {
    if (!selectedFeature) return;

    try {
      await fetch('/api/requirements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFeature.id,
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          status: editStatus,
          acceptance_criteria: editNotes.split('\n').filter(Boolean),
        }),
      });
      setIsEditing(false);
      fetchFeatures();
    } catch (error) {
      console.error('Failed to save feature:', error);
    }
  };

  const handleArchiveFeature = async (id: string, archive: boolean) => {
    try {
      await fetch('/api/requirements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: archive ? 'archived' : 'draft',
        }),
      });
      fetchFeatures();
    } catch (error) {
      console.error('Failed to archive feature:', error);
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Delete this feature request?')) return;

    try {
      await fetch(`/api/requirements?id=${id}`, { method: 'DELETE' });
      setSelectedFeature(null);
      fetchFeatures();
    } catch (error) {
      console.error('Failed to delete feature:', error);
    }
  };

  const openFeature = (feat: FeatureRequest) => {
    setSelectedFeature(feat);
    setEditTitle(feat.title);
    setEditDescription(feat.description);
    setEditPriority(feat.priority);
    setEditStatus(feat.status);
    setEditNotes(Array.isArray(feat.acceptance_criteria) ? feat.acceptance_criteria.join('\n') : '');
    setIsEditing(false);
  };

  // Handle drag and drop
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside or same position
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Determine new status based on drop target
    const newStatus = destination.droppableId === 'actioned' ? 'actioned' : 'draft';

    // Optimistic update
    setFeatures((prev) =>
      prev.map((feat) =>
        feat.id === draggableId ? { ...feat, status: newStatus } : feat
      )
    );

    // Update via API
    try {
      await fetch('/api/requirements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draggableId,
          status: newStatus,
        }),
      });
    } catch (error) {
      console.error('Failed to update feature status:', error);
      // Revert on error
      fetchFeatures();
    }
  }, [fetchFeatures]);

  if (selectedFeature) {
    const priorityInfo = getPriorityInfo(editPriority);
    const statusInfo = getStatusInfo(editStatus);
    const isArchived = editStatus === 'archived';

    return (
      <>
        <Header
          title={isEditing ? 'Edit Feature Request' : editTitle}
          subtitle={isEditing ? 'Making changes...' : 'Feature Request'}
          action={
            <div className="flex items-center gap-2">
              {isArchived ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleArchiveFeature(selectedFeature.id, false);
                    setEditStatus('draft');
                  }}
                >
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Restore
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleArchiveFeature(selectedFeature.id, true);
                    setEditStatus('archived');
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteFeature(selectedFeature.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFeature(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          }
        />

        <div className="p-6">
          {isEditing ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                    placeholder="Feature title"
                    className="mt-1"
                    disabled={isArchived}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                    placeholder="Describe this feature..."
                    className="mt-1"
                    disabled={isArchived}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full mt-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      disabled={isArchived}
                    >
                      <option value="must">Must Have</option>
                      <option value="should">Should Have</option>
                      <option value="could">Could Have</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full mt-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="draft">📝 Draft</option>
                      <option value="approved">📋 Approved</option>
                      <option value="in-progress">🔄 In Progress</option>
                      <option value="actioned">✅ Actioned</option>
                      <option value="archived">📦 Archived</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Implementation Notes (one per line)</label>
                  <Textarea
                    value={editNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditNotes(e.target.value)}
                    placeholder="Notes for Delta..."
                    className="mt-1 min-h-[150px]"
                    disabled={isArchived}
                  />
                </div>
                {!isArchived && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveFeature}>Save Changes</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={cn('border', priorityInfo.badge)}>
                    {priorityInfo.icon}
                    <span className="ml-1">{priorityInfo.label}</span>
                  </Badge>
                  <Badge className={cn('border', statusInfo.color)}>
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{editDescription || 'No description'}</p>
                {Array.isArray(selectedFeature.acceptance_criteria) && selectedFeature.acceptance_criteria.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Implementation Notes</h4>
                    <ul className="space-y-2">
                      {selectedFeature.acceptance_criteria.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Header
        title="Feature Requests"
        subtitle={`${newFeatures.length} active requests - Describe features for Delta to implement`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring w-40 lg:w-48"
              />
            </div>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>
        }
      />

      {isCreating && (
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>New Feature Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={newTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                placeholder="Feature title"
              />
              <Textarea
                value={newDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target.value)}
                placeholder="Describe this feature..."
              />
              <div>
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2 mt-1">
                  {(['must', 'should', 'could'] as const).map((p) => (
                    <Button
                      key={p}
                      variant={newPriority === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewPriority(p)}
                    >
                      {p === 'must' && <AlertTriangle className="h-4 w-4 mr-1" />}
                      {p === 'should' && <AlertTriangle className="h-4 w-4 mr-1" />}
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFeature}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* New Requests Section */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setNewSectionOpen(!newSectionOpen)}
            className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">New Requests</h3>
              <Badge variant="secondary">{newFeatures.length}</Badge>
            </div>
            {newSectionOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          
          {newSectionOpen && (
            <Droppable droppableId="new-requests">
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="divide-y"
                >
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : newFeatures.length > 0 ? (
                    newFeatures.map((feat, index) => {
                      const priorityInfo = getPriorityInfo(feat.priority);
                      const statusInfo = getStatusInfo(feat.status);
                      const notesCount = Array.isArray(feat.acceptance_criteria) ? feat.acceptance_criteria.length : 0;

                      return (
                        <Draggable key={feat.id} draggableId={feat.id} index={index}>
                          {(
                            provided: DraggableProvided,
                            snapshot: DraggableStateSnapshot
                          ) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                'p-4 hover:bg-accent/50 transition-colors',
                                snapshot.isDragging && 'bg-accent/80'
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                                      <h4 className="font-medium truncate">{feat.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge className={cn('border text-xs', priorityInfo.badge)}>
                                        {priorityInfo.label}
                                      </Badge>
                                      <Badge className={cn('border text-xs', statusInfo.color)}>
                                        {statusInfo.label}
                                      </Badge>
                                      {notesCount > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                          {notesCount} notes
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFeature(feat)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchiveFeature(feat.id, true)}
                                  title="Archive"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No new feature requests
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>

        {/* Actioned Requests Section */}
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setActionedSectionOpen(!actionedSectionOpen)}
            className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Actioned</h3>
              <Badge variant="secondary">{actionedFeatures.length}</Badge>
            </div>
            {actionedSectionOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          
          {actionedSectionOpen && (
            <Droppable droppableId="actioned">
              {(provided: DroppableProvided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="divide-y"
                >
                  {actionedFeatures.length > 0 ? (
                    actionedFeatures.map((feat, index) => {
                      const priorityInfo = getPriorityInfo(feat.priority);

                      return (
                        <Draggable key={feat.id} draggableId={feat.id} index={index}>
                          {(
                            provided: DraggableProvided,
                            snapshot: DraggableStateSnapshot
                          ) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                'p-4 hover:bg-accent/50 transition-colors opacity-75',
                                snapshot.isDragging && 'bg-accent/80'
                              )}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Lightbulb className="h-4 w-4 text-emerald-500 shrink-0" />
                                      <h4 className="font-medium truncate">{feat.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge className={cn('border text-xs', priorityInfo.badge)}>
                                        {priorityInfo.label}
                                      </Badge>
                                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                                        ✅ Actioned
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFeature(feat)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchiveFeature(feat.id, true)}
                                  title="Archive"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No actioned requests yet
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>

        {/* Archived Section Toggle */}
        {archivedFeatures.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setShowArchived(!showArchived)}
            className="w-full"
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? `Hide Archived (${archivedFeatures.length})` : `Show Archived (${archivedFeatures.length})`}
          </Button>
        )}

        {/* Archived Requests */}
        {showArchived && archivedFeatures.length > 0 && (
          <div className="border rounded-lg overflow-hidden opacity-60">
            <div className="p-4 bg-slate-500/10 border-b">
              <h3 className="font-semibold text-slate-500">Archived</h3>
            </div>
            <div className="divide-y">
              {archivedFeatures.map((feat) => (
                <div key={feat.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{feat.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveFeature(feat.id, false)}
                        title="Restore"
                      >
                        <ArchiveRestore className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openFeature(feat)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
