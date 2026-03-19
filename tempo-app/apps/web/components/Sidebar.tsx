"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  FolderGit2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FolderModal from "./FolderModal";
import ProjectModal from "./ProjectModal";

type Folder = {
  _id: Id<"folders">;
  name: string;
  icon?: string;
  sortOrder?: number;
};

type Project = {
  _id: Id<"projects">;
  name: string;
  color?: string;
  folderId?: Id<"folders">;
  sortOrder?: number;
};

function ContextMenu({
  onRename,
  onDelete,
  onClose,
}: {
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-6 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRename(); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted cursor-pointer"
      >
        <Pencil size={13} /> Rename
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); onClose(); }}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-muted cursor-pointer"
      >
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
}

function ProjectItem({
  project,
  onRename,
  onDelete,
}: {
  project: Project;
  onRename: (p: Project) => void;
  onDelete: (id: Id<"projects">) => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === `/projects/${project._id}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Link href={`/projects/${project._id}`}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
            isActive ? "bg-primary/15 text-primary" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <span
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color ?? "#6C63FF" }}
            />
          </span>
          <span className="flex-1 truncate">{project.name}</span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted cursor-pointer"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </Link>
      {menuOpen && (
        <ContextMenu
          onRename={() => onRename(project)}
          onDelete={() => onDelete(project._id)}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

function FolderSection({
  folder,
  onAddProject,
  onRenameFolder,
  onDeleteFolder,
  onRenameProject,
  onDeleteProject,
}: {
  folder: Folder;
  onAddProject: (folderId: Id<"folders">) => void;
  onRenameFolder: (f: Folder) => void;
  onDeleteFolder: (id: Id<"folders">) => void;
  onRenameProject: (p: Project) => void;
  onDeleteProject: (id: Id<"projects">) => void;
}) {
  const rawProjects = useQuery(api.projects.listByFolder, { folderId: folder._id });
  const reorderProjects = useMutation(api.projects.reorder);
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (rawProjects) setLocalProjects(rawProjects as Project[]);
  }, [rawProjects]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalProjects((prev) => {
      const oldIdx = prev.findIndex((p) => p._id === active.id);
      const newIdx = prev.findIndex((p) => p._id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx);
      reorderProjects({ projectIds: reordered.map((p) => p._id) });
      return reordered;
    });
  };

  return (
    <div className="relative group/folder">
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted/40 cursor-pointer group">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 flex-1 text-left min-w-0"
        >
          {expanded ? (
            <ChevronDown size={13} className="flex-shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight size={13} className="flex-shrink-0 text-muted-foreground" />
          )}
          <Link href={`/folders/${folder._id}`} onClick={(e) => e.stopPropagation()}>
            <span className="text-base leading-none">{folder.icon ?? "📁"}</span>
          </Link>
          <Link href={`/folders/${folder._id}`} className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-medium truncate text-foreground">{folder.name}</span>
          </Link>
        </button>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onAddProject(folder._id); }}
            className="p-1 rounded hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
            title="Add project"
          >
            <Plus size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-1 rounded hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal size={13} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <ContextMenu
          onRename={() => onRenameFolder(folder)}
          onDelete={() => onDeleteFolder(folder._id)}
          onClose={() => setMenuOpen(false)}
        />
      )}
      {expanded && (
        <div className="ml-4 mt-0.5 space-y-0.5">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localProjects.map((p) => p._id)} strategy={verticalListSortingStrategy}>
              {localProjects.map((project) => (
                <ProjectItem
                  key={project._id}
                  project={project}
                  onRename={onRenameProject}
                  onDelete={onDeleteProject}
                />
              ))}
            </SortableContext>
          </DndContext>
          {localProjects.length === 0 && (
            <p className="text-[11px] text-muted-foreground/50 px-3 py-1">No projects yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const rawFolders = useQuery(api.folders.list);
  const removeFolder = useMutation(api.folders.remove);
  const removeProject = useMutation(api.projects.remove);
  const reorderFolders = useMutation(api.folders.reorder);

  const [collapsed, setCollapsed] = useState(false);
  const [localFolders, setLocalFolders] = useState<Folder[]>([]);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editFolder, setEditFolder] = useState<Folder | undefined>(undefined);
  const [editProject, setEditProject] = useState<Project | undefined>(undefined);
  const [addProjectFolderId, setAddProjectFolderId] = useState<Id<"folders"> | undefined>(undefined);

  useEffect(() => {
    if (rawFolders) setLocalFolders(rawFolders as Folder[]);
  }, [rawFolders]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleFolderDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLocalFolders((prev) => {
      const oldIdx = prev.findIndex((f) => f._id === active.id);
      const newIdx = prev.findIndex((f) => f._id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx);
      reorderFolders({ folderIds: reordered.map((f) => f._id) });
      return reordered;
    });
  };

  const openAddProject = (folderId: Id<"folders">) => {
    setAddProjectFolderId(folderId);
    setEditProject(undefined);
    setProjectModalOpen(true);
  };

  const openRenameFolder = (f: Folder) => {
    setEditFolder(f);
    setFolderModalOpen(true);
  };

  const openRenameProject = (p: Project) => {
    setEditProject(p);
    setAddProjectFolderId(undefined);
    setProjectModalOpen(true);
  };

  if (collapsed) {
    return (
      <aside className="hidden md:flex flex-col w-12 border-r border-border bg-card/50 pt-4 items-center">
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      </aside>
    );
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 min-w-[250px] border-r border-border bg-card/50 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FolderGit2 size={16} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Projects</span>
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFolderDragEnd}>
            <SortableContext
              items={localFolders.map((f) => f._id)}
              strategy={verticalListSortingStrategy}
            >
              {localFolders.map((folder) => (
                <FolderSection
                  key={folder._id}
                  folder={folder}
                  onAddProject={openAddProject}
                  onRenameFolder={openRenameFolder}
                  onDeleteFolder={(id) => removeFolder({ id })}
                  onRenameProject={openRenameProject}
                  onDeleteProject={(id) => removeProject({ id })}
                />
              ))}
            </SortableContext>
          </DndContext>
          {localFolders.length === 0 && (
            <p className="text-xs text-muted-foreground/50 px-3 py-2">No folders yet</p>
          )}
        </div>

        <div className="border-t border-border/50 p-2">
          <button
            onClick={() => { setEditFolder(undefined); setFolderModalOpen(true); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <FolderPlus size={15} />
            Add Folder
          </button>
        </div>
      </aside>

      <FolderModal
        open={folderModalOpen}
        onClose={() => { setFolderModalOpen(false); setEditFolder(undefined); }}
        editFolder={editFolder}
      />

      <ProjectModal
        open={projectModalOpen}
        onClose={() => { setProjectModalOpen(false); setEditProject(undefined); setAddProjectFolderId(undefined); }}
        folderId={addProjectFolderId}
        editProject={editProject}
      />
    </>
  );
}
