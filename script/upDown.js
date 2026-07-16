(() => {
  "use strict";

  const MIN_NUMBER = 1;
  const MAX_NUMBER = 50;

  function createAnswer() {
    return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
  }

  function getGuess() {
    const input = window.prompt(`${MIN_NUMBER}부터 ${MAX_NUMBER} 사이의 정수를 입력하세요.`);

    if (input === null) {
      return { canceled: true, valid: false };
    }

    if (input.trim() === "") {
      window.alert("빈 값은 입력할 수 없습니다. 숫자를 입력해 주세요.");
      return { canceled: false, valid: false };
    }

    const guess = Number(input);

    if (!Number.isFinite(guess) || !Number.isInteger(guess)) {
      window.alert("숫자만 입력해 주세요.");
      return { canceled: false, valid: false };
    }

    if (guess < MIN_NUMBER || guess > MAX_NUMBER) {
      window.alert(`${MIN_NUMBER}부터 ${MAX_NUMBER} 사이의 숫자를 입력해 주세요.`);
      return { canceled: false, valid: false };
    }

    return { canceled: false, valid: true, value: guess };
  }

  function updateStatus(statusElement, message, state) {
    statusElement.textContent = message;
    statusElement.dataset.state = state;
  }

  function playUpDownGame(statusElement) {
    const answer = createAnswer();
    let attempts = 0;

    while (true) {
      const guessResult = getGuess();

      if (guessResult.canceled) {
        const cancelMessage = "Up-Down 게임이 취소되었습니다.";
        window.alert(cancelMessage);
        updateStatus(statusElement, cancelMessage, "notice");
        return;
      }

      if (!guessResult.valid) {
        continue;
      }

      attempts += 1;

      if (guessResult.value > answer) {
        window.alert("Down!");
      } else if (guessResult.value < answer) {
        window.alert("Up!");
      } else {
        const successMessage = `축하합니다! ${attempts}번 만에 맞추셨습니다.`;
        window.alert(successMessage);
        updateStatus(statusElement, successMessage, "success");
        return;
      }
    }
  }

  const startButton = document.getElementById("up-down-start");
  const statusElement = document.getElementById("up-down-status");

  if (startButton !== null && statusElement !== null) {
    startButton.addEventListener("click", () => {
      updateStatus(statusElement, "새 Up-Down 게임을 시작합니다.", "notice");
      playUpDownGame(statusElement);
    });
  }
})();
