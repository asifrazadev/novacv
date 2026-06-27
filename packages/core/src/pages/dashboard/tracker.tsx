"use client"

import * as React from "react"
import {
  Briefcase, Plus, Trash2, Edit2, MapPin, DollarSign, ExternalLink, Calendar, AlertCircle, ChevronRight, ChevronLeft, Sparkles
} from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/ui/card"
import { Input } from "@/components/shared/ui/input"
import { Label } from "@/components/shared/ui/label"
import { Textarea } from "@/components/shared/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/shared/ui/dialog"
import {
  getApplications, createApplication, updateApplicationStatus, updateApplication, deleteApplication
} from "@/actions/applications"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { WelcomeGuide } from "@/components/shared/ui/welcome-guide"
import { LayoutDashboard, Database, Link as LinkIcon, Download, FileDown } from "lucide-react"

const TRACKER_FEATURES = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: "Kanban Board",
    description: "Drag and drop your applications between columns: Wishlist, Applied, Interviewing, and Offers."
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Notes & Details",
    description: "Store essential metadata like salary ranges, recruiter names, and external job posting links."
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Browser Extension",
    description: "Download our Chrome extension to save jobs directly to your board from any website."
  },
  {
    icon: <Trash2 className="w-5 h-5" />,
    title: "Auto-Cleanup",
    description: "To keep your board fresh, applications with no updates for over 1 month are automatically deleted."
  }
]

const TRACKER_STEPS = [
  {
    title: "Welcome to Tracker 💼",
    description: "Keep track of your job search progress, interview stages, and offers all in one visual Kanban board."
  },
  {
    title: "Board Columns 📊",
    description: "Your applications are organized into columns representing recruitment stages, from Wishlist to Offer or Rejection.",
    selector: "#tour-kanban-board"
  },
  {
    title: "Wishlist Column 🎯",
    description: "Add prospective roles here to begin tracking your target opportunities.",
    selector: "#tour-wishlist-column"
  },
  {
    title: "Add Application ➕",
    description: "Click here to add a new job application card.",
    selector: "#tour-add-application"
  },
  {
    title: "Browser Extension 🧩",
    description: "Install our Chrome Extension to auto-fill these cards from any job board!",
    selector: "#tour-download-extension"
  }
]

const STATUS_COLUMNS = [
  { id: "wishlist", label: "Wishlist", color: "bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400" },
  { id: "applied", label: "Applied", color: "bg-primary/10 border-primary/20 text-primary dark:text-primary/90" },
  { id: "oa", label: "OA / Test", color: "bg-warning/10 border-warning/20 text-warning" },
  { id: "interview", label: "Interview", color: "bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400" },
  { id: "offer", label: "Offer", color: "bg-success/10 border-success/20 text-success" },
  { id: "rejected", label: "Rejected", color: "bg-destructive/10 border-destructive/20 text-destructive" }
]

export default function TrackerPage() {
  const [applications, setApplications] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [localMode, setLocalMode] = React.useState(false)
  const [tourOpen, setTourOpen] = React.useState(false)
  const [selectedDetailApp, setSelectedDetailApp] = React.useState<any>(null)
  const [showAllColumnId, setShowAllColumnId] = React.useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null)

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [selectedApp, setSelectedApp] = React.useState<any>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null)

  // Form states
  const [company, setCompany] = React.useState("")
  const [position, setPosition] = React.useState("")
  const [status, setStatus] = React.useState("wishlist")
  const [url, setUrl] = React.useState("")
  const [salary, setSalary] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [appliedAt, setAppliedAt] = React.useState("")

  // Fetch applications on mount
  const loadData = React.useCallback(async (background = false) => {
    if (!background) setLoading(true)
    const res = await getApplications()

    if (res.error === "database_error" || res.error === "server_error") {
      // Fallback to localStorage
      console.warn("Falling back to local storage due to DB error:", res.message)
      setLocalMode(true)
      const cached = localStorage.getItem("nova_job_applications")
      setApplications(cached ? JSON.parse(cached) : [])
    } else if (res.data) {
      setApplications(res.data)
      setLocalMode(false)
    }
    if (!background) setLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])


  // Save to local storage when local mode is active and state changes
  React.useEffect(() => {
    if (localMode) {
      localStorage.setItem("nova_job_applications", JSON.stringify(applications))
    }
  }, [applications, localMode])

  const handleOpenCreate = () => {
    setCompany("")
    setPosition("")
    setStatus("wishlist")
    setUrl("")
    setSalary("")
    setLocation("")
    setNotes("")
    setAppliedAt(new Date().toISOString().substring(0, 10))
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (app: any) => {
    setSelectedApp(app)
    setCompany(app.company ?? "")
    setPosition(app.position ?? "")
    setStatus(app.status ?? "wishlist")
    setUrl(app.url ?? "")
    setSalary(app.salary ?? "")
    setLocation(app.location ?? "")
    setNotes(app.notes ?? "")
    setAppliedAt(app.applied_at ? app.applied_at.substring(0, 10) : "")
    setIsEditOpen(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !position.trim()) {
      toast.error("Company and Position are required fields.")
      return
    }

    setIsSubmitting(true)
    const payload = {
      company: company.trim(),
      position: position.trim(),
      status,
      url: url.trim(),
      salary: salary.trim(),
      location: location.trim(),
      notes: notes.trim(),
      applied_at: appliedAt ? new Date(appliedAt).toISOString() : new Date().toISOString()
    }

    if (localMode) {
      const newApp = {
        ...payload,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setApplications(prev => [newApp, ...prev])
      toast.success("Job application added locally.")
    } else {
      const res = await createApplication(payload)
      if (res.error) {
        toast.error(`Error adding: ${res.message}`)
      } else {
        toast.success("Job application tracker entry added.")
        loadData(true)
      }
    }
    setIsSubmitting(false)
    setIsCreateOpen(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return
    if (!company.trim() || !position.trim()) {
      toast.error("Company and Position are required fields.")
      return
    }

    setIsSubmitting(true)
    const payload = {
      company: company.trim(),
      position: position.trim(),
      status,
      url: url.trim(),
      salary: salary.trim(),
      location: location.trim(),
      notes: notes.trim(),
      applied_at: appliedAt ? new Date(appliedAt).toISOString() : new Date().toISOString()
    }

    if (localMode) {
      setApplications(prev => prev.map(app =>
        app.id === selectedApp.id
          ? { ...app, ...payload, updated_at: new Date().toISOString() }
          : app
      ))
      toast.success("Job application updated locally.")
    } else {
      const res = await updateApplication(selectedApp.id, payload)
      if (res.error) {
        toast.error(`Error updating: ${res.message}`)
      } else {
        toast.success("Job application updated.")
        loadData(true)
      }
    }
    setIsSubmitting(false)
    setIsEditOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (localMode) {
      setApplications(prev => prev.filter(app => app.id !== id))
      toast.success("Job application deleted locally.")
    } else {
      const res = await deleteApplication(id)
      if (res.error) {
        toast.error(`Error deleting: ${res.message}`)
      } else {
        toast.success("Job application deleted.")
        loadData(true)
      }
    }
  }

  const exportCSV = () => {
    const headers = ["Company", "Position", "Status", "Date Applied", "Salary", "Location", "URL", "Notes"]
    const rows = applications.map(app => [
      app.company,
      app.position,
      STATUS_COLUMNS.find(c => c.id === app.status)?.label ?? app.status,
      app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "",
      app.salary ?? "",
      app.location ?? "",
      app.url ?? "",
      (app.notes ?? "").replace(/\n/g, " "),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))

    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `novacv-applications-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleMoveStatus = async (id: string, newStatus: string) => {
    // Optimistically update the UI to prevent any flashing/lag
    setApplications(prev => prev.map(app =>
      app.id === id
        ? { ...app, status: newStatus, updated_at: new Date().toISOString() }
        : app
    ))

    if (localMode) {
      toast.success("Moved application.")
    } else {
      const res = await updateApplicationStatus(id, newStatus)
      if (res.error) {
        toast.error("Error shifting card status.")
        loadData(true) // Revert on error
      }
    }
  }

  return (
    <div className="space-y-6">
      <WelcomeGuide
        storageKey="nova_guide_tracker"
        title="Job Application Tracker"
        description="Organize your job hunt and never lose track of an application again."
        features={TRACKER_FEATURES}
        open={tourOpen}
        onOpenChange={setTourOpen}
        steps={TRACKER_STEPS}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Application Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Track status, notes, dates, and details for all your job applications.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <a 
            id="tour-download-extension"
            href="/api/extension/download" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-bold ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 h-8 px-3 py-2 gap-1.5 flex-1 sm:flex-none"
          >
            <Download className="w-3.5 h-3.5" />
            Download Extension
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTourOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/40 font-medium cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Replay Tour
          </Button>
          {applications.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 text-xs gap-1.5 rounded-md border-border/40 font-medium cursor-pointer">
              <FileDown className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          )}
          <Button id="tour-add-application" onClick={handleOpenCreate} size="sm" className="gap-1.5 self-start sm:self-center cursor-pointer">
            <Plus className="w-4 h-4" /> Add Application
          </Button>
        </div>
      </div>

      {localMode && (
        <div className="flex items-center gap-2 px-4 py-3 border border-warning/20 bg-warning/5 text-warning rounded-lg text-xs leading-normal">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Local Sandbox Mode:</strong> The Supabase <code>job_applications</code> database table doesn't exist yet. All additions, updates, and reorderings are safely stored in your local browser sandbox.
          </span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-lg border bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div id="tour-kanban-board" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {STATUS_COLUMNS.map((col) => {
            const list = applications.filter((app) => app.status === col.id)
            const displayedList = list.slice(0, 4)
            const hasMore = list.length > 4
            return (
              <div key={col.id} id={col.id === "wishlist" ? "tour-wishlist-column" : undefined} className="flex flex-col gap-3 h-full min-h-[300px]">
                <div className={`flex items-center justify-between px-3 py-1.5 border rounded-md font-bold text-xs uppercase tracking-wider ${col.color}`}>
                  <span>{col.label}</span>
                  <span className="font-semibold px-2 py-0.5 rounded-full bg-foreground/10 text-[10px]">{list.length}</span>
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (dragOverColumn !== col.id) {
                      setDragOverColumn(col.id)
                    }
                  }}
                  onDragLeave={() => {
                    setDragOverColumn(null)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOverColumn(null)
                    const id = e.dataTransfer.getData("text")
                    if (id) {
                      handleMoveStatus(id, col.id)
                    }
                  }}
                  className={`flex flex-col gap-3 flex-1 p-2 rounded-lg border-2 border-dashed transition-all duration-200 ${dragOverColumn === col.id
                    ? "border-primary bg-primary/5 shadow-inner scale-[1.01]"
                    : "border-muted/60 bg-muted/10"
                    }`}
                >
                  {displayedList.map((app) => (
                    <Card
                      key={app.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text", app.id)
                        e.dataTransfer.effectAllowed = "move"
                      }}
                      onClick={() => setSelectedDetailApp(app)}
                      className="relative group/card cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/40 transition-all shadow-xs border bg-card p-3 space-y-1.5 select-none text-left"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div className="font-extrabold text-xs text-foreground/90 truncate max-w-[70%]">
                          {app.company}
                        </div>
                        {app.applied_at && (
                          <span className="text-[9px] text-muted-foreground/60 font-medium shrink-0">
                            {new Date(app.applied_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-semibold truncate">
                        {app.position}
                      </div>
                    </Card>
                  ))}

                  {hasMore && (
                    <button
                      onClick={() => setShowAllColumnId(col.id)}
                      className="w-full text-center text-[10px] font-bold text-primary hover:text-primary-dark py-1.5 hover:bg-primary/5 rounded-md transition-colors cursor-pointer border border-dashed border-primary/20 bg-primary/2"
                    >
                      + Show {list.length - 4} More
                    </button>
                  )}

                  {list.length === 0 && (
                    <div className="text-[10px] text-center text-muted-foreground/30 italic py-10 select-none">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Creation Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Job Application</DialogTitle>
            <DialogDescription>Create a tracking card to follow this application.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="position">Position *</Label>
                <Input id="position" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Software Engineer" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {STATUS_COLUMNS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="applied_at">Date Applied</Label>
                <Input id="applied_at" type="date" value={appliedAt} onChange={e => setAppliedAt(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="salary">Salary / Range</Label>
                <Input id="salary" value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. $120k - $140k" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote / NYC" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="url">Job Posting URL</Label>
              <Input id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://careers.google.com/jobs/..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. recruiter name, referrals, tech stack..." className="min-h-[80px]" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Job Application</DialogTitle>
            <DialogDescription>Modify application metadata or move status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-company">Company *</Label>
                <Input id="edit-company" value={company} onChange={e => setCompany(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-position">Position *</Label>
                <Input id="edit-position" value={position} onChange={e => setPosition(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {STATUS_COLUMNS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-applied_at">Date Applied</Label>
                <Input id="edit-applied_at" type="date" value={appliedAt} onChange={e => setAppliedAt(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-salary">Salary / Range</Label>
                <Input id="edit-salary" value={salary} onChange={e => setSalary(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-location">Location</Label>
                <Input id="edit-location" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-url">Job Posting URL</Label>
              <Input id="edit-url" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" value={notes} onChange={e => setNotes(e.target.value)} className="min-h-[80px]" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detailed Card View Dialog */}
      <Dialog open={!!selectedDetailApp} onOpenChange={(open) => !open && setSelectedDetailApp(null)}>
        <DialogContent className="sm:max-w-[460px] p-6 space-y-6">
          {selectedDetailApp && (() => {
            const col = STATUS_COLUMNS.find(c => c.id === selectedDetailApp.status)
            return (
              <>
                <DialogHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${col?.color}`}>
                      {col?.label}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-extrabold text-foreground leading-tight">
                      {selectedDetailApp.company}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-semibold text-muted-foreground">
                      {selectedDetailApp.position}
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="space-y-4 text-xs leading-normal text-left">
                  <div className="grid grid-cols-2 gap-4 border-y border-border/40 py-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Date Applied</span>
                      <p className="font-semibold text-foreground">
                        {selectedDetailApp.applied_at
                          ? new Date(selectedDetailApp.applied_at).toLocaleDateString(undefined, { dateStyle: "long" })
                          : "Not specified"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Salary Range</span>
                      <p className="font-semibold text-foreground">{selectedDetailApp.salary || "Not specified"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Location</span>
                      <p className="font-semibold text-foreground">{selectedDetailApp.location || "Not specified"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Job Posting</span>
                      <div>
                        {selectedDetailApp.url ? (
                          <a
                            href={selectedDetailApp.url.startsWith("http") ? selectedDetailApp.url : `https://${selectedDetailApp.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                          >
                            Job Details <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/60 italic font-medium">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Notes & Reminders</span>
                    <div className="bg-muted/20 border border-border/40 rounded-xl p-3.5 min-h-[80px] max-h-[160px] overflow-y-auto">
                      {selectedDetailApp.notes ? (
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">{selectedDetailApp.notes}</p>
                      ) : (
                        <p className="text-muted-foreground/50 italic leading-relaxed">No notes or logs added to this application yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between items-center pt-2 border-t border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 h-9 font-medium cursor-pointer"
                    onClick={() => {
                      const id = selectedDetailApp.id
                      setSelectedDetailApp(null)
                      setDeleteTargetId(id)
                    }}
                  >
                    Delete Card
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 font-semibold cursor-pointer"
                      onClick={() => {
                        const app = selectedDetailApp
                        setSelectedDetailApp(null)
                        handleOpenEdit(app)
                      }}
                    >
                      Edit Card
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 font-bold cursor-pointer"
                      onClick={() => setSelectedDetailApp(null)}
                    >
                      Close
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              if (deleteTargetId) handleDelete(deleteTargetId)
              setDeleteTargetId(null)
            }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show All Cards in Column Dialog */}
      <Dialog open={!!showAllColumnId} onOpenChange={(open) => !open && setShowAllColumnId(null)}>
        <DialogContent className="sm:max-w-[420px] max-h-[80vh] flex flex-col p-6">
          {showAllColumnId && (() => {
            const col = STATUS_COLUMNS.find(c => c.id === showAllColumnId)
            const list = applications.filter((app) => app.status === showAllColumnId)
            return (
              <>
                <DialogHeader className="pb-4 border-b border-border/40">
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {col?.label} Applications
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Viewing all {list.length} opportunities in this column.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-thin">
                  {list.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        setShowAllColumnId(null)
                        setSelectedDetailApp(app)
                      }}
                      className="group/item flex justify-between items-center p-3 rounded-xl border border-border/40 bg-card hover:border-primary/40 hover:shadow-xs transition-all cursor-pointer text-left"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1 pr-3">
                        <h4 className="text-xs font-extrabold text-foreground truncate">{app.company}</h4>
                        <p className="text-[10px] font-semibold text-muted-foreground truncate">{app.position}</p>
                      </div>
                      {app.applied_at && (
                        <span className="text-[9px] text-muted-foreground/60 font-semibold shrink-0">
                          {new Date(app.applied_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <DialogFooter className="pt-4 border-t border-border/40">
                  <Button
                    size="sm"
                    className="w-full font-bold h-9 cursor-pointer"
                    onClick={() => setShowAllColumnId(null)}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
