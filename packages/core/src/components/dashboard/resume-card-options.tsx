"use client"

import * as React from "react"
import { MoreVertical, Trash2, AlertTriangle, Loader2, Copy } from "lucide-react"
import { Button } from "@/components/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog"
import { deleteResume, duplicateResume } from "@/actions/resumes"
import { toast } from "sonner"

interface ResumeCardOptionsProps {
  resumeId: string
  resumeTitle: string
  onDeleteSuccess: () => void
  onDuplicateSuccess?: () => void
}

export function ResumeCardOptions({ resumeId, resumeTitle, onDeleteSuccess, onDuplicateSuccess }: ResumeCardOptionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isDuplicating, setIsDuplicating] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteResume(resumeId)
      if (result.success) {
        toast.success("Resume deleted successfully")
        setIsDeleteDialogOpen(false)
        onDeleteSuccess()
      } else {
        toast.error(result.error || "Failed to delete resume")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const result = await duplicateResume(resumeId)
      if (result.success) {
        toast.success("Resume duplicated successfully")
        if (onDuplicateSuccess) {
          onDuplicateSuccess()
        }
      } else {
        toast.error(result.error || "Failed to duplicate resume")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsDuplicating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem 
            className="cursor-pointer font-medium"
            onSelect={handleDuplicate}
            disabled={isDuplicating}
          >
            {isDuplicating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Copy className="mr-2 h-4 w-4 text-primary" />
            )}
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive cursor-pointer"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md border-none bg-background/80 backdrop-blur-xl shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="p-8">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-2xl font-bold tracking-tight">Delete Resume</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{resumeTitle}"</span>? This action cannot be undone and all data associated with this resume will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-8 flex-col sm:flex-row gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="w-full h-11 rounded-xl font-semibold hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full h-11 rounded-xl font-bold shadow-lg shadow-destructive/20"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Resume"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
