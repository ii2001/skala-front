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
  const passwordConfirmation = document.getElementById("userPasswordConfirm");
  const passwordToggle = form.querySelector(".password-toggle");
  const introduction = document.getElementById("introduction");
  const introductionCount = document.querySelector("#introduction-count output");
  const validationSummary = document.getElementById("form-validation-summary");
  const validationErrorList = document.getElementById("form-validation-errors");
  const formControls = Array.from(form.elements).filter((control) => (
    control instanceof HTMLInputElement
      || control instanceof HTMLSelectElement
      || control instanceof HTMLTextAreaElement
  ));
  let activeStep = null;
  let validationRenderFrame = null;

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
    if (passwordConfirmation !== null) {
      passwordConfirmation.type = showPassword ? "text" : "password";
    }

    passwordToggle.textContent = showPassword ? "비밀번호 숨기기" : "비밀번호 표시";
    passwordToggle.setAttribute("aria-pressed", String(showPassword));
  }

  function updatePasswordConfirmationValidity() {
    if (passwordInput === null || passwordConfirmation === null) {
      return;
    }

    const hasBothValues = passwordInput.value !== "" && passwordConfirmation.value !== "";
    const passwordsMatch = passwordInput.value === passwordConfirmation.value;
    const mismatchMessage = "비밀번호와 비밀번호 확인 값이 일치하지 않습니다.";

    passwordConfirmation.setCustomValidity(hasBothValues && !passwordsMatch ? mismatchMessage : "");
  }

  function getControlLabel(control) {
    const label = control.labels?.[0];
    const labelText = label?.textContent?.trim();

    return labelText === undefined || labelText === "" ? control.name : labelText;
  }

  function getValidationReason(control) {
    const label = getControlLabel(control);
    const { validity } = control;

    if (validity.valueMissing) {
      if (control instanceof HTMLInputElement && control.type === "checkbox") {
        return `${label} 항목에 동의해 주세요.`;
      }

      if (control instanceof HTMLSelectElement) {
        return `${label} 항목을 선택해 주세요.`;
      }

      return `${label} 항목을 입력해 주세요.`;
    }

    if (validity.tooShort && "minLength" in control) {
      return `${label} 항목은 ${control.minLength}자 이상 입력해 주세요.`;
    }

    if (validity.tooLong && "maxLength" in control) {
      return `${label} 항목은 ${control.maxLength}자 이하로 입력해 주세요.`;
    }

    if (validity.typeMismatch && control instanceof HTMLInputElement && control.type === "email") {
      return `${label} 항목을 example@email.com과 같은 이메일 형식으로 입력해 주세요.`;
    }

    if (validity.patternMismatch) {
      return control.title === "" ? `${label} 항목의 입력 형식을 확인해 주세요.` : control.title;
    }

    if (validity.customError) {
      return control.validationMessage;
    }

    if (validity.badInput) {
      return `${label} 항목에 올바른 값을 입력해 주세요.`;
    }

    return control.validationMessage || `${label} 항목을 확인해 주세요.`;
  }

  function clearValidationSummary() {
    if (validationSummary === null || validationErrorList === null) {
      return;
    }

    validationSummary.hidden = true;
    validationErrorList.replaceChildren();

    for (const control of formControls) {
      control.removeAttribute("aria-invalid");
    }
  }

  function renderValidationSummary(moveFocusToSummary = false) {
    if (validationSummary === null || validationErrorList === null) {
      return;
    }

    updatePasswordConfirmationValidity();

    const invalidControls = formControls.filter((control) => control.willValidate && !control.validity.valid);
    validationErrorList.replaceChildren();

    for (const control of formControls) {
      control.removeAttribute("aria-invalid");
    }

    if (invalidControls.length === 0) {
      clearValidationSummary();
      return;
    }

    for (const control of invalidControls) {
      const item = document.createElement("li");
      const link = document.createElement("a");

      control.setAttribute("aria-invalid", "true");
      link.href = `#${control.id}`;
      link.textContent = `${getControlLabel(control)}: ${getValidationReason(control)}`;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        control.focus();
      });
      item.append(link);
      validationErrorList.append(item);
    }

    validationSummary.hidden = false;

    if (moveFocusToSummary) {
      validationSummary.focus();
    }
  }

  function scheduleValidationSummary() {
    if (validationRenderFrame !== null) {
      return;
    }

    validationRenderFrame = window.requestAnimationFrame(() => {
      validationRenderFrame = null;
      renderValidationSummary(true);
    });
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

  if (passwordInput !== null && passwordConfirmation !== null) {
    passwordInput.addEventListener("input", updatePasswordConfirmationValidity);
    passwordConfirmation.addEventListener("input", updatePasswordConfirmationValidity);
    updatePasswordConfirmationValidity();
  }

  form.addEventListener("click", (event) => {
    if (event.target instanceof HTMLButtonElement && event.target.type === "submit") {
      updatePasswordConfirmationValidity();
    }
  });

  form.addEventListener("invalid", scheduleValidationSummary, true);

  form.addEventListener("input", () => {
    if (validationSummary !== null && !validationSummary.hidden) {
      renderValidationSummary();
    }
  });

  form.addEventListener("change", () => {
    if (validationSummary !== null && !validationSummary.hidden) {
      renderValidationSummary();
    }
  });

  form.addEventListener("submit", clearValidationSummary);

  if (introduction !== null && introductionCount !== null) {
    introduction.addEventListener("input", updateIntroductionCount);
    updateIntroductionCount();
  }

  form.addEventListener("reset", () => {
    if (validationRenderFrame !== null) {
      window.cancelAnimationFrame(validationRenderFrame);
      validationRenderFrame = null;
    }

    window.requestAnimationFrame(() => {
      updateStep(1);
      updatePasswordToggle(false);
      updatePasswordConfirmationValidity();
      updateIntroductionCount();
      clearValidationSummary();
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
