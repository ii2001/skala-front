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
  const userIdInput = document.getElementById("userId");
  const userIdCheckButton = document.getElementById("user-id-check");
  const userIdAvailability = document.getElementById("user-id-availability");
  const passwordInput = document.getElementById("userPassword");
  const passwordConfirmation = document.getElementById("userPasswordConfirm");
  const passwordToggle = form.querySelector(".password-toggle");
  const passwordStrengthMeter = document.getElementById("password-strength-meter");
  const passwordStrengthStatus = document.getElementById("password-strength-status");
  const termsDialog = document.getElementById("terms-dialog");
  const termsDialogOpen = document.querySelector(".terms-dialog-open");
  const termsDialogClose = document.querySelector(".terms-dialog-close");
  const introduction = document.getElementById("introduction");
  const introductionCount = document.querySelector("#introduction-count output");
  const feedbackStatus = document.getElementById("form-feedback-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const formControls = Array.from(form.elements).filter((control) => (
    control instanceof HTMLInputElement
      || control instanceof HTMLSelectElement
      || control instanceof HTMLTextAreaElement
  ));
  const feedbackDefinitions = [
    { id: "userId", validMessage: "아이디 중복 확인이 완료되었습니다." },
    { id: "userPassword", validMessage: "비밀번호 입력 조건에 맞습니다." },
    { id: "userPasswordConfirm", validMessage: "비밀번호가 일치합니다." },
    { id: "userEmail", validMessage: "이메일 입력 형식에 맞습니다." },
    { id: "userName", validMessage: "이름이 입력되었습니다." },
    { id: "birthDate", validMessage: "생년월일이 선택되었습니다." },
    { id: "phone", validMessage: "전화번호 입력 형식에 맞습니다." },
    { id: "learningTrack", validMessage: "학습 분야가 선택되었습니다." },
    { id: "termsAgreement", validMessage: "필수 약관에 동의했습니다." }
  ];
  const feedbackByControl = new Map();
  const touchedControls = new Set();
  const unavailableUserIds = new Set(["admin", "administrator", "skala", "test", "user"]);
  let activeStep = null;
  let confirmedUserId = "";
  let validationFocusFrame = null;

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

    const hasConfirmation = passwordConfirmation.value !== "";
    const passwordsMatch = passwordInput.value === passwordConfirmation.value;
    const mismatchMessage = "비밀번호와 비밀번호 확인 값이 일치하지 않습니다.";

    passwordConfirmation.setCustomValidity(hasConfirmation && !passwordsMatch ? mismatchMessage : "");
  }

  function setAvailabilityStatus(message, state = "neutral") {
    if (userIdAvailability === null) {
      return;
    }

    userIdAvailability.textContent = message;
    userIdAvailability.dataset.state = state;
  }

  function updateUserIdAvailabilityValidity() {
    if (!(userIdInput instanceof HTMLInputElement)) {
      return;
    }

    const value = userIdInput.value.trim();
    userIdInput.setCustomValidity("");

    if (value === "") {
      confirmedUserId = "";
      setAvailabilityStatus("서버가 없는 정적 데모이므로 예시 목록을 기준으로 중복을 확인합니다.");
      return;
    }

    if (!userIdInput.validity.valid) {
      confirmedUserId = "";
      setAvailabilityStatus("먼저 아이디 입력 형식을 확인해 주세요.");
      return;
    }

    if (confirmedUserId !== value) {
      userIdInput.setCustomValidity("아이디 사용 가능 여부를 확인해 주세요.");
      setAvailabilityStatus("입력 형식에 맞습니다. 중복 확인 버튼을 눌러 주세요.");
    }
  }

  function checkUserIdAvailability() {
    if (!(userIdInput instanceof HTMLInputElement)) {
      return;
    }

    const value = userIdInput.value.trim();
    userIdInput.setCustomValidity("");
    touchedControls.add(userIdInput);

    if (!userIdInput.validity.valid) {
      confirmedUserId = "";
      setAvailabilityStatus("아이디 형식을 수정한 뒤 다시 확인해 주세요.", "invalid");
      renderControlFeedback(userIdInput, true);
      userIdInput.focus();
      return;
    }

    if (unavailableUserIds.has(value.toLocaleLowerCase("en-US"))) {
      confirmedUserId = "";
      userIdInput.setCustomValidity("데모 목록에서 이미 사용 중인 아이디입니다.");
      setAvailabilityStatus("이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.", "invalid");
      renderControlFeedback(userIdInput, true);
      announceControlFeedback(userIdInput);
      userIdInput.focus();
      return;
    }

    confirmedUserId = value;
    setAvailabilityStatus("데모 기준으로 사용할 수 있는 아이디입니다.", "valid");
    renderControlFeedback(userIdInput, true);
    announceControlFeedback(userIdInput);
  }

  function updatePasswordStrength() {
    if (!(passwordInput instanceof HTMLInputElement)
      || typeof HTMLMeterElement === "undefined"
      || !(passwordStrengthMeter instanceof HTMLMeterElement)
      || passwordStrengthStatus === null) {
      return;
    }

    const value = passwordInput.value;
    let score = 0;

    if (value.length >= 8) {
      score += 1;
    }

    if (value.length >= 12) {
      score += 1;
    }

    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
      score += 1;
    }

    if (/\d/.test(value)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
      score += 1;
    }

    const labels = ["입력 전", "매우 약함", "약함", "보통", "강함", "매우 강함"];
    passwordStrengthMeter.value = score;
    passwordStrengthMeter.textContent = `${score} / 5`;
    passwordStrengthMeter.dataset.strength = String(score);
    passwordStrengthStatus.textContent = value === ""
      ? "비밀번호를 입력하면 강도를 확인할 수 있습니다."
      : `비밀번호 강도: ${labels[score]} (${score} / 5)`;
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
        return "필수 항목을 선택해 주세요.";
      }

      return "필수 입력 항목입니다.";
    }

    if (validity.tooShort && "minLength" in control) {
      return `최소 ${control.minLength}자 이상 입력해 주세요.`;
    }

    if (validity.tooLong && "maxLength" in control) {
      return `최대 ${control.maxLength}자 이하로 입력해 주세요.`;
    }

    if (validity.typeMismatch && control instanceof HTMLInputElement && control.type === "email") {
      return "이메일 형식에 맞지 않습니다. example@email.com과 같이 입력해 주세요.";
    }

    if (validity.patternMismatch) {
      if (control.id === "userId") {
        return "아이디 형식에 맞지 않습니다. 4~15자의 영문 또는 숫자를 입력해 주세요.";
      }

      if (control.id === "phone") {
        return "전화번호 형식에 맞지 않습니다. 010-1234-5678 형식으로 입력해 주세요.";
      }

      return "입력 형식에 맞지 않습니다.";
    }

    if (validity.customError) {
      return control.validationMessage;
    }

    if (validity.badInput) {
      return "올바른 값을 입력해 주세요.";
    }

    return control.validationMessage || "입력 내용을 확인해 주세요.";
  }

  function addFeedbackDescription(control, feedbackId) {
    const describedBy = new Set(
      (control.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter((value) => value !== "")
    );

    describedBy.add(feedbackId);
    control.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
  }

  function initializeValidationFeedback() {
    for (const definition of feedbackDefinitions) {
      const control = document.getElementById(definition.id);
      const container = control?.closest("p");

      if (!formControls.includes(control) || container === null || container === undefined) {
        continue;
      }

      const feedback = document.createElement("small");

      feedback.id = `${control.id}-feedback`;
      feedback.className = "form-feedback";
      feedback.hidden = true;
      addFeedbackDescription(control, feedback.id);
      container.append(feedback);
      feedbackByControl.set(control, {
        element: feedback,
        validMessage: definition.validMessage
      });
    }
  }

  function isEmptyOptionalControl(control) {
    if (control.required) {
      return false;
    }

    if (control instanceof HTMLInputElement
      && (control.type === "checkbox" || control.type === "radio")) {
      return !control.checked;
    }

    return control.value.trim() === "";
  }

  function clearControlFeedback(control) {
    const feedbackConfig = feedbackByControl.get(control);

    if (feedbackConfig === undefined) {
      return;
    }

    feedbackConfig.element.hidden = true;
    feedbackConfig.element.textContent = "";
    delete feedbackConfig.element.dataset.state;
    delete control.dataset.validationState;
    control.removeAttribute("aria-invalid");
  }

  function renderControlFeedback(control, force = false) {
    const feedbackConfig = feedbackByControl.get(control);

    if (feedbackConfig === undefined) {
      return false;
    }

    if (!force && !touchedControls.has(control)) {
      clearControlFeedback(control);
      return false;
    }

    if (isEmptyOptionalControl(control)) {
      clearControlFeedback(control);
      return false;
    }

    const isValid = control.validity.valid;
    const state = isValid ? "valid" : "invalid";
    const message = isValid ? feedbackConfig.validMessage : getValidationReason(control);
    const hasChanged = feedbackConfig.element.hidden
      || feedbackConfig.element.dataset.state !== state
      || feedbackConfig.element.textContent !== message;

    if (hasChanged) {
      feedbackConfig.element.textContent = message;
      feedbackConfig.element.dataset.state = state;
      feedbackConfig.element.hidden = false;
    }

    control.dataset.validationState = state;

    if (isValid) {
      control.removeAttribute("aria-invalid");
    } else {
      control.setAttribute("aria-invalid", "true");
    }

    return hasChanged;
  }

  function announceControlFeedback(control) {
    const feedbackConfig = feedbackByControl.get(control);

    if (feedbackStatus === null
      || feedbackConfig === undefined
      || feedbackConfig.element.hidden) {
      return;
    }

    feedbackStatus.textContent = `${getControlLabel(control)}: ${feedbackConfig.element.textContent}`;
  }

  function renderAllControlFeedback(force = false) {
    updateUserIdAvailabilityValidity();
    updatePasswordConfirmationValidity();

    for (const control of feedbackByControl.keys()) {
      renderControlFeedback(control, force);
    }
  }

  function getInvalidControls() {
    updateUserIdAvailabilityValidity();
    updatePasswordConfirmationValidity();
    return formControls.filter((control) => control.willValidate && !control.validity.valid);
  }

  function moveToControl(control) {
    if (validationFocusFrame !== null) {
      window.cancelAnimationFrame(validationFocusFrame);
    }

    validationFocusFrame = window.requestAnimationFrame(() => {
      const behavior = reducedMotion.matches ? "auto" : "smooth";

      validationFocusFrame = null;
      control.focus({ preventScroll: true });
      control.scrollIntoView({ behavior, block: "center" });
    });
  }

  function scheduleInvalidSubmitFeedback() {
    if (validationFocusFrame !== null) {
      return;
    }

    validationFocusFrame = window.requestAnimationFrame(() => {
      const invalidControls = getInvalidControls();

      validationFocusFrame = null;
      renderAllControlFeedback(true);

      if (
        invalidControls.length > 0
        && document.activeElement !== invalidControls[0]
      ) {
        moveToControl(invalidControls[0]);
      }
    });
  }

  function handleInvalidControl(event) {
    const control = event.target;

    if (!formControls.includes(control)) {
      return;
    }

    touchedControls.add(control);
    renderControlFeedback(control, true);
    scheduleInvalidSubmitFeedback();
  }

  function handleControlInteraction(event) {
    const control = event.target;

    if (!feedbackByControl.has(control)) {
      return;
    }

    touchedControls.add(control);
    updatePasswordConfirmationValidity();
    const controlFeedbackChanged = renderControlFeedback(control, true);

    if (controlFeedbackChanged) {
      announceControlFeedback(control);
    }

    if (control === passwordInput
      && passwordConfirmation !== null
      && (touchedControls.has(passwordConfirmation) || passwordConfirmation.value !== "")) {
      const confirmationFeedbackChanged = renderControlFeedback(passwordConfirmation, true);

      if (confirmationFeedbackChanged) {
        announceControlFeedback(passwordConfirmation);
      }
    }
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

  if (userIdInput instanceof HTMLInputElement
    && userIdCheckButton instanceof HTMLButtonElement) {
    userIdInput.addEventListener("input", () => {
      confirmedUserId = "";
      updateUserIdAvailabilityValidity();
    });
    userIdCheckButton.addEventListener("click", checkUserIdAvailability);
  }

  if (passwordInput instanceof HTMLInputElement) {
    passwordInput.addEventListener("input", updatePasswordStrength);
    updatePasswordStrength();
  }

  if (typeof HTMLDialogElement !== "undefined"
    && termsDialog instanceof HTMLDialogElement
    && termsDialogOpen instanceof HTMLButtonElement
    && termsDialogClose instanceof HTMLButtonElement
    && typeof termsDialog.showModal === "function") {
    termsDialogOpen.addEventListener("click", () => {
      termsDialog.showModal();
      termsDialogClose.focus();
    });
    termsDialogClose.addEventListener("click", () => {
      termsDialog.close();
    });
    termsDialog.addEventListener("click", (event) => {
      if (event.target === termsDialog) {
        termsDialog.close();
      }
    });
  } else if (termsDialogOpen instanceof HTMLButtonElement) {
    termsDialogOpen.hidden = true;
  }

  initializeValidationFeedback();
  updateUserIdAvailabilityValidity();
  updatePasswordConfirmationValidity();
  form.addEventListener("input", handleControlInteraction);
  form.addEventListener("change", handleControlInteraction);
  form.addEventListener("focusout", handleControlInteraction);
  form.addEventListener("invalid", handleInvalidControl, true);

  form.addEventListener("click", (event) => {
    if (event.target instanceof HTMLButtonElement && event.target.type === "submit") {
      updateUserIdAvailabilityValidity();
      updatePasswordConfirmationValidity();
    }
  });

  form.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      updateUserIdAvailabilityValidity();
      updatePasswordConfirmationValidity();
    }
  });

  form.addEventListener("submit", (event) => {
    const invalidControls = getInvalidControls();

    renderAllControlFeedback(true);

    if (invalidControls.length > 0) {
      event.preventDefault();
      moveToControl(invalidControls[0]);
    }
  });

  if (introduction !== null && introductionCount !== null) {
    introduction.addEventListener("input", updateIntroductionCount);
    updateIntroductionCount();
  }

  form.addEventListener("reset", () => {
    if (validationFocusFrame !== null) {
      window.cancelAnimationFrame(validationFocusFrame);
      validationFocusFrame = null;
    }

    window.requestAnimationFrame(() => {
      touchedControls.clear();

      for (const control of feedbackByControl.keys()) {
        clearControlFeedback(control);
      }

      updateStep(1);
      updatePasswordToggle(false);
      confirmedUserId = "";
      updateUserIdAvailabilityValidity();
      updatePasswordConfirmationValidity();
      updatePasswordStrength();
      updateIntroductionCount();

      if (feedbackStatus !== null) {
        feedbackStatus.textContent = "";
      }
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
