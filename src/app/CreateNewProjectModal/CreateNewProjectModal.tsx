"use client";

import type React from "react";

import { useState, useCallback, useEffect, Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, Upload, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AudioBook, AudioBookSchema } from "@/schemas/AudioBook";
import NoThrow from "@/utils/NoThrow";
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
    setProjectName,
    validation,
    setValidation,
}: {
    file: File | null;
    setFile: Dispatch<SetStateAction<File | null>>;
    setProjectName: Dispatch<SetStateAction<string>>;
    validation: FileValidationStatusType;
    setValidation: SetFileValidationStatusFnType;
}) {
    const [dragActive, setDragActive] = useState(false);

    // Validate file when it changes
    useEffect(() => {
        if (file) {
            (async function () {
                setValidation({ type: "validating" });
                const result = await validateFile(file);

                if (result.isErr()) {
                    console.error(result.error);
                    setValidation({ type: "invalid" });
                } else {
                    setValidation({ type: "valid", audioBook: result.value });
                    setProjectName(result.value.name);
                }
            })();
        } else {
            setValidation({ type: "idle" });
        }
    }, [file, setValidation, setProjectName]);

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
        setValidation({ type: "idle" });
    };

    const validationStatusType = validation.type;

    return (
        <div className="space-y-2">
            <Label>Upload File</Label>
            <div
                className={`relative flex min-h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 ${
                    dragActive
                        ? "border-primary bg-primary/5"
                        : validationStatusType === "valid"
                          ? "border-green-500 bg-green-500/5"
                          : validationStatusType === "invalid"
                            ? "border-destructive bg-destructive/5"
                            : validationStatusType === "validating"
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
                                validationStatusType === "validating"
                                    ? "bg-primary/10"
                                    : validationStatusType === "valid"
                                      ? "bg-green-500/10"
                                      : validationStatusType === "invalid"
                                        ? "bg-destructive/10"
                                        : "bg-primary/10"
                            }`}
                        >
                            {validationStatusType === "validating" ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : validationStatusType === "valid" ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500 animate-in zoom-in-50 duration-300" />
                            ) : validationStatusType === "invalid" ? (
                                <XCircle className="h-6 w-6 text-destructive animate-in zoom-in-50 duration-300" />
                            ) : (
                                <File className="h-6 w-6 text-primary" />
                            )}
                        </div>

                        <span className="text-sm font-medium">{file.name}</span>

                        {/* Validation status text */}
                        <span
                            className={`text-xs font-medium transition-all duration-200 ${
                                validationStatusType === "validating"
                                    ? "text-primary"
                                    : validationStatusType === "valid"
                                      ? "text-green-500"
                                      : validationStatusType === "invalid"
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                            }`}
                        >
                            {validationStatusType === "validating" && "Validating file..."}
                            {validationStatusType === "valid" && "File is valid ✓"}
                            {validationStatusType === "invalid" && "File is invalid. Try another file."}
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            disabled={validationStatusType === "validating"}
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

type FileValidationStatusType =
    | { type: "idle" }
    | { type: "validating" }
    | { type: "valid"; audioBook: AudioBook }
    | { type: "invalid" };

type SetFileValidationStatusFnType = Dispatch<SetStateAction<FileValidationStatusType>>;

type OnOpenChangeFnType = (isOpen: boolean) => void;

export default function CreateNewProjectModal({
    isOpen,
    onOpenChange,
}: {
    isOpen: boolean;
    onOpenChange: OnOpenChangeFnType;
}) {
    const [projectName, setProjectName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [validation, setValidation] = useState<FileValidationStatusType>({ type: "idle" });

    const router = useRouter();
    const { toast } = useToast();

    function resetState() {
        setFile(null);
        setProjectName("");
        setValidation({ type: "idle" });
        setIsCreating(false);
        onOpenChange(false);
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

    const handleCreate = async () => {
        if (validation.type !== "valid") {
            return;
        }

        await createAudioBook.mutateAsync(validation.audioBook);
    };

    // Button is only enabled when project name exists AND file is valid
    const isCreateDisabled = !projectName.trim() || !file || validation.type !== "valid";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md absolute backdrop-blur-2xl">
                <DialogHeader>
                    <CreatingProject isCreating={isCreating} />
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>Enter a name and upload a valid file to get started</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <ProjectName {...{ projectName, setProjectName }} />
                    <FileUpload {...{ validation, setValidation, setProjectName, file, setFile }} />
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

/*
Argument of type '{ characters: { name: string; gender: "male" | "female"; ageGroup: [number, number]; description: string; voiceDescription: string; voice?: { provider: "ELEVENLABS"; name: string | null; ... 4 more ...; verifiedLanguages: { ...; }[] | undefined; } | undefined; }[]; episodes: { ...; }[]; scenes: { ...; }[]; dialogues...' is not assignable to parameter of type '{ characters: { name: string; gender: "male" | "female"; ageGroup: [number, number]; description: string; voiceDescription: string; voice?: { provider: "ELEVENLABS"; voice_id: string; name: string | null; gender: "male" | "female"; category: "generated" | ... 4 more ... | "high_quality"; description: string | null; ...'.
  Types of property 'characters' are incompatible.
    Type '{ name: string; gender: "male" | "female"; ageGroup: [number, number]; description: string; voiceDescription: string; voice?: { provider: "ELEVENLABS"; name: string | null; gender: "male" | "female"; category: "generated" | ... 4 more ... | "high_quality"; description: string | null; voiceID: string; verifiedLanguag...' is not assignable to type '{ name: string; gender: "male" | "female"; ageGroup: [number, number]; description: string; voiceDescription: string; voice?: { provider: "ELEVENLABS"; voice_id: string; name: string | null; gender: "male" | "female"; category: "generated" | ... 4 more ... | "high_quality"; description: string | null; verified_langu...'.
      Type '{ name: string; gender: "male" | "female"; ageGroup: [number, number]; description: string; voiceDescription: string; voice?: { provider: "ELEVENLABS"; name: string | null; gender: "male" | "female"; category: "generated" | ... 4 more ... | "high_quality"; description: string | null; voiceID: string; verifiedLanguag...' is not assignable to type '{ name: string; gender: "male" | "female"; ageGroup: [number, number]; description: string; voiceDescription: string; voice?: { provider: "ELEVENLABS"; voice_id: string; name: string | null; gender: "male" | "female"; category: "generated" | ... 4 more ... | "high_quality"; description: string | null; verified_langu...'.
        Types of property 'voice' are incompatible.
          Type '{ provider: "ELEVENLABS"; name: string | null; gender: "male" | "female"; category: "generated" | "cloned" | "premade" | "professional" | "famous" | "high_quality"; description: string | null; voiceID: string; verifiedLanguages: { ...; }[] | undefined; } | undefined' is not assignable to type '{ provider: "ELEVENLABS"; voice_id: string; name: string | null; gender: "male" | "female"; category: "generated" | "cloned" | "premade" | "professional" | "famous" | "high_quality"; description: string | null; verified_languages: { ...; }[] | null; } | undefined'.
            Type '{ provider: "ELEVENLABS"; name: string | null; gender: "male" | "female"; category: "generated" | "cloned" | "premade" | "professional" | "famous" | "high_quality"; description: string | null; voiceID: string; verifiedLanguages: { ...; }[] | undefined; }' is missing the following properties from type '{ provider: "ELEVENLABS"; voice_id: string; name: string | null; gender: "male" | "female"; category: "generated" | "cloned" | "premade" | "professional" | "famous" | "high_quality"; description: string | null; verified_languages: { ...; }[] | null; }': voice_id, verified_languages
*/
