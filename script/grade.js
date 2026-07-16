(() => {
  "use strict";

  const subjects = ["HTML", "CSS", "JavaScript"];

  function getScore(subject) {
    while (true) {
      const input = window.prompt(`${subject} 점수를 0부터 100 사이로 입력하세요.`);

      if (input === null) {
        return null;
      }

      if (input.trim() === "") {
        window.alert(`${subject} 점수를 입력해 주세요.`);
        continue;
      }

      const score = Number(input);

      if (!Number.isFinite(score)) {
        window.alert(`${subject} 점수는 숫자로 입력해 주세요.`);
        continue;
      }

      if (score < 0 || score > 100) {
        window.alert(`${subject} 점수는 0부터 100 사이만 입력할 수 있습니다.`);
        continue;
      }

      return score;
    }
  }

  function getGrade(average) {
    if (average >= 90) {
      return "A";
    }

    if (average >= 80) {
      return "B";
    }

    if (average >= 70) {
      return "C";
    }

    if (average >= 60) {
      return "D";
    }

    return "F";
  }

  function formatTotal(total) {
    return Number.isInteger(total) ? String(total) : total.toFixed(1);
  }

  function updateResult(resultElement, message, state) {
    resultElement.textContent = message;
    resultElement.dataset.state = state;
  }

  function calculateGrades(resultElement) {
    let total = 0;

    for (let index = 0; index < subjects.length; index += 1) {
      const score = getScore(subjects[index]);

      if (score === null) {
        const cancelMessage = "성적 계산을 중단했습니다.";
        window.alert(cancelMessage);
        updateResult(resultElement, cancelMessage, "notice");
        return;
      }

      total += score;
    }

    const average = total / subjects.length;
    const grade = getGrade(average);
    const passed = average >= 60;
    const resultMessage = [
      `총점: ${formatTotal(total)}점`,
      `평균: ${average.toFixed(1)}점`,
      `등급: ${grade}`,
      `결과: ${passed ? "합격입니다." : "불합격입니다."}`
    ].join("\n");

    window.alert(resultMessage);
    updateResult(resultElement, resultMessage, passed ? "success" : "warning");
  }

  const startButton = document.getElementById("grade-start");
  const resultElement = document.getElementById("grade-result");

  if (startButton !== null && resultElement !== null) {
    startButton.addEventListener("click", () => {
      updateResult(resultElement, "성적 계산을 시작합니다.", "notice");
      calculateGrades(resultElement);
    });
  }
})();
