'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Target,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Requirement type
interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  acceptanceCriteria: string[];
  linkedTasks: number;
}

const requirements: Requirement[] = [
  {
    id: 'req-1',
    title: 'CSV File Upload and Parsing',
    description:
      'Users must be able to upload CSV files containing drillhole data. The system should automatically parse and validate the data structure.',
    priority: 'must',
    status: 'completed',
    acceptanceCriteria: [
      'Accept drag-and-drop file upload',
      'Parse CSV with automatic column detection',
      'Validate drillhole data format (collar, survey, assay)',
      'Display parsing errors clearly',
    ],
    linkedTasks: 2,
  },
  {
    id: 'req-2',
    title: 'Interactive Data Visualizations',
    description:
      'The system should provide interactive charts and graphs for analyzing drillhole data including histograms, scatter plots, and cross-sections.',
    priority: 'must',
    status: 'in-progress',
    acceptanceCriteria: [
      'Generate histograms for numerical data',
      'Create scatter plots for grade vs depth',
      'Display cross-section views',
      'Allow chart customization (colors, filters)',
    ],
    linkedTasks: 3,
  },
  {
    id: 'req-3',
    title: 'AI-Powered Data Exploration',
    description:
      'Users should be able to ask questions about their data in natural language. The AI assistant should understand context and generate relevant insights.',
    priority: 'must',
    status: 'approved',
    acceptanceCriteria: [
      'Natural language chat interface',
      'Context-aware responses',
      'Generate charts from text requests',
      'Summarize data trends',
    ],
    linkedTasks: 1,
  },
  {
    id: 'req-4',
    title: 'Automated Report Generation',
    description:
      'The system should generate professional geological reports from the analyzed data.',
    priority: 'should',
    status: 'draft',
    acceptanceCriteria: [
      'Template-based report generation',
      'Include key statistics and visualizations',
      'Export to PDF and Word formats',
      'Customize report sections',
    ],
    linkedTasks: 0,
  },
  {
    id: 'req-5',
    title: 'Multi-File Comparison',
    description:
      'Users should be able to compare data from multiple drillholes or datasets.',
    priority: 'could',
    status: 'draft',
    acceptanceCriteria: [
      'Upload multiple files',
      'Compare statistics across files',
      'Overlay visualizations',
      'Highlight significant differences',
    ],
    linkedTasks: 0,
  },
];

function getPriorityInfo(priority: string) {
  switch (priority) {
    case 'must':
      return {
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        badge: 'bg-red-500/10 text-red-500',
        label: 'Must Have',
      };
    case 'should':
      return {
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        badge: 'bg-amber-500/10 text-amber-500',
        label: 'Should Have',
      };
    case 'could':
      return {
        icon: <Circle className="h-4 w-4 text-blue-500" />,
        badge: 'bg-blue-500/10 text-blue-500',
        label: 'Could Have',
      };
    default:
      return {
        icon: <Circle className="h-4 w-4 text-slate-500" />,
        badge: 'bg-slate-500/10 text-slate-500',
        label: "Won't Have",
      };
  }
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'completed':
      return { color: 'text-emerald-500', label: 'Completed' };
    case 'in-progress':
      return { color: 'text-amber-500', label: 'In Progress' };
    case 'approved':
      return { color: 'text-blue-500', label: 'Approved' };
    default:
      return { color: 'text-slate-500', label: 'Draft' };
  }
}

export default function RequirementsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'must' | 'should' | 'could'>('all');

  const filteredRequirements = requirements.filter(
    (r) => filter === 'all' || r.priority === filter
  );

  return (
    <>
      <Header
        title="Requirements"
        subtitle="Feature specifications and user stories"
        // @ts-expect-error - Custom action slot
        action={
          <div className="flex items-center gap-2">
            <div className="flex bg-secondary rounded-lg p-1">
              {(['all', 'must', 'should', 'could'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'px-3 py-1 rounded-md text-sm transition-colors',
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </div>
        }
      />

      <div className="p-6">
        <div className="space-y-4">
          {filteredRequirements.map((req) => {
            const priorityInfo = getPriorityInfo(req.priority);
            const statusInfo = getStatusInfo(req.status);
            const isExpanded = expandedId === req.id;

            return (
              <Card key={req.id} className="overflow-hidden">
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : req.id)
                  }
                  className="w-full text-left"
                >
                  <div className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">{req.title}</h3>
                      </div>
                      <Badge className={priorityInfo.badge}>
                        {priorityInfo.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {req.linkedTasks} linked tasks
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t bg-accent/20">
                    <div className="p-4 pl-12">
                      <p className="text-sm text-muted-foreground mb-4">
                        {req.description}
                      </p>

                      {/* Acceptance Criteria */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">
                          Acceptance Criteria
                        </h4>
                        <ul className="space-y-2">
                          {req.acceptanceCriteria.map((criteria, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{criteria}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit Requirement
                        </Button>
                        <Button variant="outline" size="sm">
                          View Linked Tasks
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filteredRequirements.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requirements found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
