import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Home, Sun, Inbox, FileText, Calendar, Sparkles, FolderKanban,
  FolderOpen, Tag, StickyNote, LayoutTemplate, Puzzle, Settings, Settings2,
  Search, Plus, ChevronDown, ChevronRight, FolderPlus, MoreHorizontal,
  Pencil, Trash2, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import {
  useListFolders,
  useListProjects,
  useUpdateFolder,
  useDeleteFolder,
  useUpdateProject,
  useDeleteProject,
  getListFoldersQueryKey,
  getListProjectsQueryKey,
} from "@workspace/api-client-react";
import type { Folder, Project } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import FolderModal from "../FolderModal";
import ProjectModal from "../ProjectModal";

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Today", icon: Sun, path: "/today" },
  { label: "Inbox", icon: Inbox, path: "/inbox" },
  { label: "Notes", icon: FileText, path: "/notes" },
  { label: "Calendar", icon: Calendar, path: "/calendar" },
  { label: "Plan My Day", icon: Sparkles, path: "/plan" },
];

const SECONDARY_NAV = [
  { label: "Projects", icon: FolderKanban, path: "/projects" },
  { label: "Folders", icon: FolderOpen, path: "/folders" },
  { label: "Tags", icon: Tag, path: "/tags" },
  { label: "Period Notes", icon: StickyNote, path: "/period-notes" },
  { label: "Templates", icon: LayoutTemplate, path: "/templates" },
  { label: "AI Extract", icon: Sparkles, path: "/extract" },
  { label: "Preferences", icon: Settings2, path: "/preferences" },
  { label: "Plugins", icon: Puzzle, path: "/chat" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

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
        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted cursor-pointer"
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
  onDelete: (id: number) => void;
}) {
  const [location] = useLocation();
  const isActive = location === `/projects/${project.id}`;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative group">
      <Link href={`/projects/${project.id}`}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
            isActive ? "bg-primary/15 text-primary" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color ?? "#C96442" }}
          />
          <span className="flex-1 truncate text-xs">{project.name}</span>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted cursor-pointer flex-shrink-0"
          >
            <MoreHorizontal size={12} />
          </button>
        </div>
      </Link>
      {menuOpen && (
        <ContextMenu
          onRename={() => onRename(project)}
          onDelete={() => onDelete(project.id)}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

function FolderSection({
  folder,
  allProjects,
  onAddProject,
  onRenameFolder,
  onDeleteFolder,
  onRenameProject,
  onDeleteProject,
}: {
  folder: Folder;
  allProjects: Project[];
  onAddProject: (folderId: number) => void;
  onRenameFolder: (f: Folder) => void;
  onDeleteFolder: (id: number) => void;
  onRenameProject: (p: Project) => void;
  onDeleteProject: (id: number) => void;
}) {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = location === `/folders/${folder.id}`;

  const localProjects = allProjects
    .filter(p => p.folderId === folder.id)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="relative group/folder">
      <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg hover:bg-muted/40 cursor-pointer">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 flex-1 text-left min-w-0 py-1 px-1"
        >
          {expanded ? (
            <ChevronDown size={12} className="flex-shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight size={12} className="flex-shrink-0 text-muted-foreground" />
          )}
          <span className="text-sm leading-none">{folder.icon ?? "📁"}</span>
          <Link href={`/folders/${folder.id}`} className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <span className={`text-xs font-medium truncate block ${isActive ? "text-primary" : "text-foreground"}`}>
              {folder.name}
            </span>
          </Link>
        </button>
        <div className="flex items-center gap-0.5 opacity-0 group-hover/folder:opacity-100 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onAddProject(folder.id); }}
            className="p-1 rounded hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
            title="Add project"
          >
            <Plus size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-1 rounded hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal size={11} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <ContextMenu
          onRename={() => onRenameFolder(folder)}
          onDelete={() => onDeleteFolder(folder.id)}
          onClose={() => setMenuOpen(false)}
        />
      )}
      {expanded && (
        <div className="ml-3 mt-0.5 space-y-0.5">
          {localProjects.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              onRename={onRenameProject}
              onDelete={onDeleteProject}
            />
          ))}
          {localProjects.length === 0 && (
            <p className="text-[10px] text-muted-foreground/40 px-3 py-1">No projects</p>
          )}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  onOpenCommandBar: () => void;
  onOpenQuickCapture: () => void;
  isMobileOverlay?: boolean;
}

export default function Sidebar({ onOpenCommandBar, onOpenQuickCapture, isMobileOverlay }: SidebarProps) {
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { data: rawFolders } = useListFolders();
  const { data: allProjects } = useListProjects();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [collapsed, setCollapsed] = useState(false);
  const [localFolders, setLocalFolders] = useState<Folder[]>([]);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editFolder, setEditFolder] = useState<Folder | undefined>(undefined);
  const [editProject, setEditProject] = useState<Project | undefined>(undefined);
  const [addProjectFolderId, setAddProjectFolderId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (rawFolders) {
      setLocalFolders([...rawFolders].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    }
  }, [rawFolders]);

  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location === path || location.startsWith(path + "/");
  };

  const openAddProject = (folderId: number) => {
    setAddProjectFolderId(folderId);
    setEditProject(undefined);
    setProjectModalOpen(true);
  };

  const handleRenameFolder = (f: Folder) => {
    setEditFolder(f);
    setFolderModalOpen(true);
  };

  const handleDeleteFolder = async (id: number) => {
    await deleteFolder.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListFoldersQueryKey() });
  };

  const handleRenameProject = (p: Project) => {
    setEditProject(p);
    setAddProjectFolderId(undefined);
    setProjectModalOpen(true);
  };

  const handleDeleteProject = async (id: number) => {
    await deleteProject.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
  };

  if (isMobileOverlay) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-3 pb-2 flex-shrink-0">
          <button
            onClick={onOpenCommandBar}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors min-h-[44px]"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search…</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <nav className="px-3 py-1 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors min-h-[44px] ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 pt-3 pb-1">
            <div className="border-t border-border/50 pt-3">
              {SECONDARY_NAV.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors min-h-[44px] ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-3 pb-4 pt-2 border-t border-border/50 flex-shrink-0">
          <button
            onClick={onOpenQuickCapture}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>
    );
  }

  if (collapsed) {
    return (
      <aside className="hidden md:flex flex-col w-12 h-screen bg-card border-r border-border fixed left-0 top-0 z-30 items-center pt-4">
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
      <aside className="hidden md:flex flex-col w-[220px] min-w-[220px] h-screen bg-card border-r border-border fixed left-0 top-0 z-30 overflow-hidden">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Tempo Flow</h1>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={15} />
          </button>
        </div>

        <div className="px-3 pb-2 flex-shrink-0">
          <button
            onClick={onOpenCommandBar}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors"
          >
            <Search size={14} />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <nav className="px-3 py-1 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {localFolders.length > 0 && (
            <div className="px-3 pt-3 pb-1">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Folders
                </span>
                <button
                  onClick={() => { setEditFolder(undefined); setFolderModalOpen(true); }}
                  className="p-0.5 rounded hover:bg-muted cursor-pointer text-muted-foreground/60 hover:text-muted-foreground"
                  title="Add folder"
                >
                  <FolderPlus size={12} />
                </button>
              </div>
              <div className="space-y-0.5">
                {localFolders.map((folder) => (
                  <FolderSection
                    key={folder.id}
                    folder={folder}
                    allProjects={allProjects || []}
                    onAddProject={openAddProject}
                    onRenameFolder={handleRenameFolder}
                    onDeleteFolder={handleDeleteFolder}
                    onRenameProject={handleRenameProject}
                    onDeleteProject={handleDeleteProject}
                  />
                ))}
              </div>
            </div>
          )}

          {localFolders.length === 0 && (
            <div className="px-4 py-2">
              <button
                onClick={() => { setEditFolder(undefined); setFolderModalOpen(true); }}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded-lg hover:bg-muted cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
              >
                <FolderPlus size={13} />
                Add folder
              </button>
            </div>
          )}

          <div className="px-3 pt-3 pb-1">
            <div className="border-t border-border/50 pt-3">
              {SECONDARY_NAV.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link key={item.path} href={item.path}>
                    <div
                      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon size={15} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-3 pb-4 pt-2 border-t border-border/50 flex-shrink-0">
          <button
            onClick={onOpenQuickCapture}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New
          </button>
          {localFolders.length > 0 && (
            <button
              onClick={() => { setEditFolder(undefined); setFolderModalOpen(true); }}
              className="mt-1 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <FolderPlus size={13} />
              Add Folder
            </button>
          )}
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
