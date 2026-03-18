type ViewTransition = {
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (updateCallback: () => void | Promise<void>) => ViewTransition;
};

export async function runWithViewTransition(update: () => void | Promise<void>) {
  const doc = document as DocumentWithViewTransition;

  if (!doc.startViewTransition) {
    await update();
    return;
  }

  try {
    const transition = doc.startViewTransition(() => update());
    await transition.finished;
  } catch {
    await update();
  }
}

