import { redirect } from "next/navigation";

export default async function Project({ params }: { params: Promise<{ projectID: string }> }) {
    const projectID = (await params).projectID;
    redirect(`${projectID}/phase/p0-voice-casting`);
}
