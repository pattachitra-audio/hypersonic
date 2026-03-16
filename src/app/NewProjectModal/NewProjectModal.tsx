"use client";

import type React from "react";

import { useState, useCallback, useEffect, Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, Upload, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AudioBook, AudioBookSchema } from "@/schemas/AudioBook";
import { NoThrow } from "@/utils/NoThrow";
import { tRPC } from "@/utils/tRPC";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

async function validateFile(file: File) {
    let bytes: Uint8Array<ArrayBuffer>;
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    const loadFileToBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onerror = () => {
            reject();
        };

        reader.onloadend = () => {
            resolve(reader.result as ArrayBuffer);
        };
    });

    try {
        bytes = new Uint8Array(await loadFileToBufferPromise);
    } catch (err) {
        return NoThrow.err(err as Error);
    }

    const textDecoder = new TextDecoder("utf-8");

    let string: string;
    try {
        string = textDecoder.decode(bytes);
    } catch (err) {
        return NoThrow.err(err as Error);
    }

    let object: unknown;

    try {
        object = JSON.parse(string);
    } catch (err) {
        return NoThrow.err(err as SyntaxError);
    }

    const audioBookResult = await AudioBookSchema.safeParseAsync(object);

    if (!audioBookResult.success) {
        return NoThrow.err(audioBookResult.error);
    }

    return NoThrow.ok(audioBookResult.data);
}

function FileUpload({
    file,
    setFile,
    // setProjectName,
    updateProjectName,
    validation,
    updateValidationStatus,
}: {
    file: File | null;
    setFile: Dispatch<SetStateAction<File | null>>;
    updateProjectName: (projectName: string) => void;
    validation: FileValidationStatusType;
    updateValidationStatus: (fileValidationStatus: FileValidationStatusType) => void;
}) {
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (!file) {
            updateValidationStatus({ status: "IDLE" });
            return;
        }

        (async function () {
            updateValidationStatus({ status: "VALIDATING" });
            const result = await validateFile(file);

            if (result.isErr()) {
                console.error(result.error);
                updateValidationStatus({ status: "INVALID" });
                return;
            }

            updateValidationStatus({ status: "VALID", audioBook: result.value });
            updateProjectName(result.value.name);
        })();
    }, [file, updateValidationStatus, updateProjectName]);

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
        updateValidationStatus({ status: "IDLE" });
    };

    const validationStatus = validation.status;

    return (
        <div className="space-y-2">
            <Label>Upload File</Label>
            <div
                className={`relative flex min-h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
                    dragActive
                        ? "border-primary bg-primary/5"
                        : validationStatus === "VALID"
                          ? "border-green-500 bg-green-500/5"
                          : validationStatus === "INVALID"
                            ? "border-destructive bg-destructive/5"
                            : validationStatus === "VALIDATING"
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
                                validationStatus === "VALIDATING"
                                    ? "bg-primary/10"
                                    : validationStatus === "VALID"
                                      ? "bg-green-500/10"
                                      : validationStatus === "INVALID"
                                        ? "bg-destructive/10"
                                        : "bg-primary/10"
                            }`}
                        >
                            {validationStatus === "VALIDATING" ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : validationStatus === "VALID" ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500 animate-in zoom-in-50 duration-300" />
                            ) : validationStatus === "INVALID" ? (
                                <XCircle className="h-6 w-6 text-destructive animate-in zoom-in-50 duration-300" />
                            ) : (
                                <File className="h-6 w-6 text-primary" />
                            )}
                        </div>

                        <span className="text-sm font-medium">{file.name}</span>

                        {/* Validation status text */}
                        <span
                            className={`text-xs font-medium transition-all duration-200 ${
                                validationStatus === "VALIDATING"
                                    ? "text-primary"
                                    : validationStatus === "VALID"
                                      ? "text-green-500"
                                      : validationStatus === "INVALID"
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                            }`}
                        >
                            {validationStatus === "VALIDATING" && "Validating file..."}
                            {validationStatus === "VALID" && "File is valid ✓"}
                            {validationStatus === "INVALID" && "File is invalid ✗"}
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            disabled={validationStatus === "VALIDATING"}
                            className="text-muted-foreground border-red-400 hover:text-destructive"
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
                            <span className="text-sm font-medium">Drop files here...</span>
                            <p className="text-xs text-muted-foreground">or Click to browse...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProjectName({ name, updateName }: { name: string; updateName: (name: string) => void }) {
    return (
        <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
                id="project-name"
                placeholder="My awesome project"
                value={name}
                onChange={(e) => updateName(e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary/20"
            />
        </div>
    );
}

function CreateProjectButton({
    onCreate,
    disabled,
    creating,
}: {
    onCreate: () => void;
    disabled: boolean;
    creating: boolean;
}) {
    return (
        <Button onClick={onCreate} disabled={disabled || creating}>
            {creating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                </>
            ) : (
                "Create project"
            )}
        </Button>
    );
}

function CancelButton({ updateOpen, creating }: { updateOpen: (open: boolean) => void; creating: boolean }) {
    return (
        <Button variant="outline" onClick={() => updateOpen(false)} disabled={creating}>
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

type FileValidationStatusType =
    | { status: "IDLE" }
    | { status: "VALIDATING" }
    | { status: "VALID"; audioBook: AudioBook }
    | { status: "INVALID" };

// type SetFileValidationStatusFnType = Dispatch<SetStateAction<FileValidationStatusType>>;

export default function NewProjectModal({ open, updateOpen }: { open: boolean; updateOpen: (open: boolean) => void }) {
    const [name, setName] = useState("");
    const [creating, setCreating] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [validation, setValidation] = useState<FileValidationStatusType>({ status: "IDLE" });

    const router = useRouter();
    const { toast } = useToast();

    function resetState() {
        setFile(null);
        setName("");
        setValidation({ status: "IDLE" });
        // setIsCreating(false);
        setCreating(false);
        updateOpen(false);
    }

    const createAudioBook = tRPC.project.create.useMutation({
        onError: (err) => {
            resetState();
            console.error(err);
            toast({ variant: "destructive", title: "Error creating project!", description: err.message });
        },
        onSuccess: (data) => {
            resetState();

            toast({
                variant: "default",
                title: "Project created successfully!",
                description: "Redirecting to project...",
            });

            setTimeout(() => {
                router.push(`/project/${data}`);
            }, 2000);
        },
    });

    const onCreate = async () => {
        if (validation.status !== "VALID") {
            return;
        }

        await createAudioBook.mutateAsync(validation.audioBook);
    };

    // Button is only enabled when project name exists AND file is valid
    const createDisabled = !name.trim() || !file || validation.status !== "VALID";

    return (
        <Dialog open={open} onOpenChange={updateOpen}>
            <DialogContent className="sm:max-w-md absolute backdrop-blur-2xl">
                <DialogHeader>
                    <CreatingProject isCreating={creating} />
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>Enter a name and upload a valid file to get started</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <ProjectName {...{ name }} updateName={setName} />
                    <FileUpload
                        {...{ validation, file, setFile }}
                        updateProjectName={setName}
                        updateValidationStatus={setValidation}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <CancelButton {...{ creating, updateOpen }} />
                    <CreateProjectButton disabled={createDisabled} {...{ creating, onCreate }} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
