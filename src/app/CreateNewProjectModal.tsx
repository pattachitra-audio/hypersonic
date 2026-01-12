"use client";

import type React from "react";

import { useState, useCallback, useEffect, Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, Upload, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface NewProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type OnOpenChangeFnType = (isOpen: boolean) => void;

// Dummy validator that fails with 50% probability
const validateFile = (): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(Math.random() > 0.5);
        }, 1500); // Simulate validation delay
    });
};

function FileUpload({
    file,
    setFile,
    validationStatus,
    setValidationStatus,
}: {
    file: File | null;
    setFile: Dispatch<SetStateAction<File | null>>;
    validationStatus: ValidationStatusType;
    setValidationStatus: SetValidationStatusFnType;
}) {
    const [dragActive, setDragActive] = useState(false);

    // Validate file when it changes
    useEffect(() => {
        if (file) {
            setValidationStatus("validating");
            validateFile().then((isValid) => {
                setValidationStatus(isValid ? "valid" : "invalid");
            });
        } else {
            setValidationStatus("idle");
        }
    }, [file, setValidationStatus]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
            }
        },
        [setFile],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
            }
        },
        [setFile],
    );

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setValidationStatus("idle");
    };
    return (
        <div className="space-y-2">
            <Label>Upload File</Label>
            <div
                className={`relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
                    dragActive
                        ? "border-primary bg-primary/5"
                        : validationStatus === "valid"
                          ? "border-green-500 bg-green-500/5"
                          : validationStatus === "invalid"
                            ? "border-destructive bg-destructive/5"
                            : validationStatus === "validating"
                              ? "border-primary/50 bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {!file && (
                    <input
                        type="file"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={handleFileChange}
                    />
                )}
                {file ? (
                    <div className="flex flex-col items-center gap-2 p-4">
                        {/* Validation status icon with animation */}
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300 ${
                                validationStatus === "validating"
                                    ? "bg-primary/10"
                                    : validationStatus === "valid"
                                      ? "bg-green-500/10"
                                      : validationStatus === "invalid"
                                        ? "bg-destructive/10"
                                        : "bg-primary/10"
                            }`}
                        >
                            {validationStatus === "validating" ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : validationStatus === "valid" ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500 animate-in zoom-in-50 duration-300" />
                            ) : validationStatus === "invalid" ? (
                                <XCircle className="h-6 w-6 text-destructive animate-in zoom-in-50 duration-300" />
                            ) : (
                                <File className="h-6 w-6 text-primary" />
                            )}
                        </div>

                        <span className="text-sm font-medium">{file.name}</span>

                        {/* Validation status text */}
                        <span
                            className={`text-xs font-medium transition-all duration-200 ${
                                validationStatus === "validating"
                                    ? "text-primary"
                                    : validationStatus === "valid"
                                      ? "text-green-500"
                                      : validationStatus === "invalid"
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                            }`}
                        >
                            {validationStatus === "validating" && "Validating file..."}
                            {validationStatus === "valid" && "File is valid ✓"}
                            {validationStatus === "invalid" && "File is invalid. Try another file."}
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            disabled={validationStatus === "validating"}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="mr-1 h-3 w-3" />
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-medium">Drop files here</span>
                            <p className="text-xs text-muted-foreground">or click to browse</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProjectName({
    projectName,
    setProjectName,
}: {
    projectName: string;
    setProjectName: Dispatch<SetStateAction<string>>;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
                id="project-name"
                placeholder="My awesome project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary/20"
            />
        </div>
    );
}

function CreateProjectButton({
    handleCreate,
    isCreateDisabled,
    isCreating,
}: {
    handleCreate: () => void;
    isCreateDisabled: boolean;
    isCreating: boolean;
}) {
    return (
        <Button onClick={handleCreate} disabled={isCreateDisabled || isCreating}>
            {isCreating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                </>
            ) : (
                "Create Project"
            )}
        </Button>
    );
}

function CancelButton({ onOpenChange, isCreating }: { onOpenChange: OnOpenChangeFnType; isCreating: boolean }) {
    return (
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
        </Button>
    );
}

function CreatingProject({ isCreating }: { isCreating: boolean }) {
    if (isCreating) {
        return (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <p className="text-sm font-medium">Creating project...</p>
            </div>
        );
    }

    return <></>;
}

type ValidationStatusType = "idle" | "validating" | "valid" | "invalid";
type SetValidationStatusFnType = Dispatch<SetStateAction<ValidationStatusType>>;

export function CreateNewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
    const [projectName, setProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [validationStatus, setValidationStatus] = useState<ValidationStatusType>("idle");

    const handleCreate = async () => {
        setIsCreating(true);
        // Simulate project creation delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("Creating project:", { projectName, file });
        setProjectName("");
        setFile(null);
        setValidationStatus("idle");
        setIsCreating(false);
        onOpenChange(false);
    };

    // Button is only enabled when project name exists AND file is valid
    const isCreateDisabled = !projectName.trim() || !file || validationStatus !== "valid";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md absolute backdrop-blur-2xl">
                <DialogHeader>
                    <CreatingProject isCreating={isCreating} />
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>Enter a name and upload a valid file to get started.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <ProjectName projectName={projectName} setProjectName={setProjectName} />
                    <FileUpload
                        validationStatus={validationStatus}
                        setValidationStatus={setValidationStatus}
                        file={file}
                        setFile={setFile}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <CancelButton onOpenChange={onOpenChange} isCreating={isCreating} />
                    <CreateProjectButton
                        handleCreate={handleCreate}
                        isCreateDisabled={isCreateDisabled}
                        isCreating={isCreating}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
