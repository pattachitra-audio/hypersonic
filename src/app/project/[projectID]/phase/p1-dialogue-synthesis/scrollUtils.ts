function scrollInContainer(id: string, offset: number) {
    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    const el = document.getElementById(id);
    if (!container || !el) return;

    const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - offset;
    container.scrollTo({ top, behavior: "smooth" });
}

function getGlobalConfigBarHeight(): number {
    return document.querySelector<HTMLElement>("[data-global-config-bar]")?.offsetHeight ?? 0;
}

export function scrollToEpisode(episodeIndex: number) {
    scrollInContainer(`episode-${episodeIndex}`, getGlobalConfigBarHeight());
}

export function scrollToScene(sceneIndex: number) {
    scrollInContainer(`scene-${sceneIndex}`, getGlobalConfigBarHeight());
}

export function scrollToDialogue(dialogueIndex: number) {
    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    const el = document.getElementById(`dialogue-${dialogueIndex}`);
    if (!container || !el) return;

    const sceneHeader = el.closest("section")?.querySelector<HTMLElement>("[data-scene-header]");
    const offset = getGlobalConfigBarHeight() + (sceneHeader?.offsetHeight ?? 0);

    const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - offset;
    container.scrollTo({ top, behavior: "smooth" });
}
