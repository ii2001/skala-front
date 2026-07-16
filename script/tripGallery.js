(() => {
  "use strict";

  const dialog = document.querySelector("#trip-lightbox");
  const openButtons = document.querySelectorAll(".trip-gallery-open");

  if (typeof HTMLDialogElement === "undefined"
    || !(dialog instanceof HTMLDialogElement)
    || typeof dialog.showModal !== "function"
    || openButtons.length === 0) {
    return;
  }

  const closeButton = dialog.querySelector(".trip-lightbox-close");
  const lightboxImage = dialog.querySelector("#trip-lightbox-image");
  const lightboxDescription = dialog.querySelector("#trip-lightbox-description");
  let lastTrigger = null;

  if (!(closeButton instanceof HTMLButtonElement)
    || !(lightboxImage instanceof HTMLImageElement)
    || !(lightboxDescription instanceof HTMLElement)) {
    return;
  }

  openButtons.forEach((button) => {
    button.hidden = false;
  });

  const closeDialog = () => {
    if (dialog.open) {
      dialog.close();
    }
  };

  const openDialog = (button) => {
    const figure = button.closest("figure");
    const sourceImage = figure?.querySelector("img");
    const caption = figure?.querySelector("figcaption");

    if (!(sourceImage instanceof HTMLImageElement)
      || !(caption instanceof HTMLElement)) {
      return;
    }

    lastTrigger = button;
    lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
    lightboxImage.alt = sourceImage.alt;
    lightboxImage.width = Number(sourceImage.getAttribute("width"));
    lightboxImage.height = Number(sourceImage.getAttribute("height"));
    lightboxDescription.textContent = caption.textContent.trim();
    dialog.showModal();
    closeButton.focus();
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openDialog(button);
    });
  });

  closeButton.addEventListener("click", closeDialog);

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });

  dialog.addEventListener("close", () => {
    if (lastTrigger instanceof HTMLButtonElement && document.contains(lastTrigger)) {
      lastTrigger.focus();
    }

    lastTrigger = null;
  });
})();
