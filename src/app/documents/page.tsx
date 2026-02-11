'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  FolderOpen,
  Search,
  Plus,
  MoreHorizontal,
  Clock,
  User,
  ChevronRight,
  Book,
  Code,
  FileCode,
  ScrollText,
  X,
  Edit2,
  Trash2,
  Eye,
  ArrowLeft,
  Upload,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Document type
interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  metadata?: string;
}

const categories = [
  { id: 'all', label: 'All', icon: FolderOpen },
  { id: 'plan', label: 'Plans', icon: ScrollText },
  { id: 'spec', label: 'Specs', icon: FileCode },
  { id: 'api', label: 'API Docs', icon: Code },
  { id: 'guide', label: 'Guides', icon: Book },
];

const categoryColors: Record<string, string> = {
  plan: 'bg-blue-500/10 text-blue-500',
  spec: 'bg-violet-500/10 text-violet-500',
  api: 'bg-emerald-500/10 text-emerald-500',
  guide: 'bg-amber-500/10 text-amber-500',
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  plan: ScrollText,
  spec: FileCode,
  api: Code,
  guide: Book,
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('plan');

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateDocument = async () => {
    if (!newTitle.trim()) return;

    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: `# ${newTitle}\n\nStart writing here...`,
          category: newCategory,
        }),
      });
      setIsCreating(false);
      setNewTitle('');
      fetchDocuments();
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('category', 'other');

    try {
      await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      fetchDocuments();
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedDoc) return;

    try {
      await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDoc.id,
          title: editTitle,
          content: editContent,
        }),
      });
      setIsEditing(false);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      setSelectedDoc(null);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const openDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content || '');
    setIsEditing(false);
  };

  if (selectedDoc) {
    const Icon = categoryIcons[selectedDoc.category] || FileText;
    return (
      <>
        <Header
          title={isEditing ? 'Edit Document' : selectedDoc.title}
          subtitle={isEditing ? 'Making changes...' : 'Viewing document'}
          // Custom action slot
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDoc(null)}
                className="text-blue-500 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
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
                onClick={() => handleDeleteDocument(selectedDoc.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          }
        />

        <div className="p-6">
          {isEditing ? (
            <Card>
              <CardContent className="p-4 space-y-4">
                <Input
                  value={editTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                  placeholder="Document title"
                  className="text-lg font-semibold"
                />
                <Textarea
                  value={editContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                  placeholder="Write in Markdown..."
                  className="min-h-[400px] font-mono"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDocument}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 prose prose-sm max-w-none">
                <h1>{selectedDoc.title}</h1>
                <ReactMarkdown>{selectedDoc.content || '*No content*'}</ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Documents"
        subtitle={`${documents.length} documents`}
        // Custom action slot
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring w-64"
              />
            </div>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        }
      />

      {isCreating && (
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={newTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTitle(e.target.value)}
                placeholder="Document title"
              />
              <div className="flex gap-2">
                {categories.slice(1).map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.id}
                      variant={newCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewCategory(cat.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {cat.label}
                    </Button>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateDocument}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{cat.label}</span>
                        </div>
                        {cat.id !== 'all' && (
                          <span className="text-xs opacity-70">
                            {documents.filter((d) => d.category === cat.id).length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Document List */}
          <div className="flex-1">
            {/* Action Buttons */}
            <div className="mb-4 flex gap-2">
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
              <label className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
                <input
                  type="file"
                  accept=".txt,.md,.json,.csv,.yaml,.yml"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading documents...
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="grid gap-3">
                {filteredDocuments.map((doc) => {
                  const Icon = categoryIcons[doc.category] || FileText;
                  return (
                    <div
                      key={doc.id}
                      className="hover:shadow-md transition-shadow cursor-pointer rounded-lg border bg-card"
                      onClick={() => {
                        console.log('Clicked document:', doc.id);
                        openDocument(doc);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                categoryColors[doc.category] || 'bg-slate-500/10'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-medium">{doc.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {doc.created_by}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(doc.updated_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first document
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
