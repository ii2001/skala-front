(() => {
  "use strict";

  const shareButton = document.getElementById("trip-share-button");
  const copyButton = document.getElementById("trip-copy-button");
  const status = document.getElementById("trip-share-status");

  if (!(shareButton instanceof HTMLButtonElement)
    || !(copyButton instanceof HTMLButtonElement)
    || status === null) {
    return;
  }

  const pageUrl = window.location.href.split("#")[0];
  const shareData = {
    title: "나의 여행지, 제주도",
    text: "제주도의 자연과 음식, 여행 일정을 담은 페이지를 확인해 보세요.",
    url: pageUrl
  };

  function updateStatus(message, state = "notice") {
    status.textContent = message;
    status.dataset.state = state;
  }

  async function copyPageUrl() {
    if (!window.isSecureContext || navigator.clipboard === undefined) {
      throw new Error("이 브라우저에서는 클립보드 복사를 사용할 수 없습니다.");
    }

    await navigator.clipboard.writeText(pageUrl);
    updateStatus("제주 여행 페이지 주소를 클립보드에 복사했습니다.", "success");
  }

  shareButton.addEventListener("click", async () => {
    if (typeof navigator.share !== "function") {
      try {
        await copyPageUrl();
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : "페이지 주소를 복사하지 못했습니다.";
        updateStatus(message, "error");
      }
      return;
    }

    try {
      await navigator.share(shareData);
      updateStatus("공유 메뉴로 제주 여행 페이지를 전달했습니다.", "success");
    } catch (error) {
      if (error?.name !== "AbortError") {
        updateStatus("페이지를 공유하지 못했습니다. 다시 시도해 주세요.", "error");
      }
    }
  });

  copyButton.addEventListener("click", async () => {
    try {
      await copyPageUrl();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "페이지 주소를 복사하지 못했습니다.";
      updateStatus(message, "error");
    }
  });

  if (!window.isSecureContext || navigator.clipboard === undefined) {
    copyButton.disabled = true;
    copyButton.title = "HTTPS 또는 localhost 환경에서 사용할 수 있습니다.";
  }
})();
