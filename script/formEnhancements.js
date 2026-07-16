(() => {
  "use strict";

  const form = document.querySelector(".sign-up-form");

  if (form === null) {
    return;
  }

  const stepFields = Array.from(form.querySelectorAll("[data-form-step]"));
  const stepLinks = Array.from(form.querySelectorAll("[data-form-step-link]"));
  const progressMeter = document.getElementById("form-progress-meter");
  const progressStatus = document.getElementById("form-progress-status");
  const passwordInput = document.getElementById("userPassword");
  const passwordToggle = form.querySelector(".password-toggle");
  const introduction = document.getElementById("introduction");
  const introductionCount = document.querySelector("#introduction-count output");
  let activeStep = null;

  function getStepNumber(element, attributeName) {
    const step = Number(element.dataset[attributeName]);
    return Number.isInteger(step) && step > 0 ? step : null;
  }

  function updateStep(step) {
    const activeField = stepFields.find((field) => getStepNumber(field, "formStep") === step);

    if (activeField === undefined || progressMeter === null || progressStatus === null) {
      return;
    }

    if (activeStep === step) {
      return;
    }

    const stepName = activeField.dataset.formStepName ?? `${step}단계`;
    const totalSteps = stepFields.length;

    activeStep = step;
    progressMeter.value = step;
    progressMeter.textContent = `${step} / ${totalSteps}`;
    progressStatus.textContent = `${step} / ${totalSteps} 단계: ${stepName}`;

    for (const link of stepLinks) {
      const isCurrent = getStepNumber(link, "formStepLink") === step;

      if (isCurrent) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  function updatePasswordToggle(showPassword) {
    if (passwordInput === null || passwordToggle === null) {
      return;
    }

    passwordInput.type = showPassword ? "text" : "password";
    passwordToggle.textContent = showPassword ? "비밀번호 숨기기" : "비밀번호 표시";
  }

  function updateIntroductionCount() {
    if (introduction === null || introductionCount === null) {
      return;
    }

    const maximumLength = introduction.maxLength;
    introductionCount.textContent = `현재 ${introduction.value.length}자 / 최대 ${maximumLength}자`;
  }

  for (const link of stepLinks) {
    link.addEventListener("click", () => {
      const step = getStepNumber(link, "formStepLink");

      if (step !== null) {
        updateStep(step);
      }
    });
  }

  form.addEventListener("focusin", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const activeField = event.target.closest("[data-form-step]");

    if (activeField === null) {
      return;
    }

    const step = getStepNumber(activeField, "formStep");

    if (step !== null) {
      updateStep(step);
    }
  });

  if (passwordToggle !== null && passwordInput !== null) {
    passwordToggle.addEventListener("click", () => {
      updatePasswordToggle(passwordInput.type === "password");
    });
  }

  if (introduction !== null && introductionCount !== null) {
    introduction.addEventListener("input", updateIntroductionCount);
    updateIntroductionCount();
  }

  form.addEventListener("reset", () => {
    window.requestAnimationFrame(() => {
      updateStep(1);
      updatePasswordToggle(false);
      updateIntroductionCount();
    });
  });

  const initialField = stepFields.find((field) => `#${field.id}` === window.location.hash);
  const initialStep = initialField === undefined ? 1 : getStepNumber(initialField, "formStep");
  updateStep(initialStep ?? 1);

  window.addEventListener("hashchange", () => {
    const hashField = stepFields.find((field) => `#${field.id}` === window.location.hash);
    const hashStep = hashField === undefined ? null : getStepNumber(hashField, "formStep");

    if (hashStep !== null) {
      updateStep(hashStep);
    }
  });
})();
