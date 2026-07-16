import { classSchedule, classScheduleMeta } from "./classScheduleData.js";

const scheduleWeekScroller = document.getElementById("schedule-week-scroller");
const scheduleWeekList = document.getElementById("schedule-week-list");
const scheduleStatus = document.getElementById("schedule-status");
const scheduleCaption = document.getElementById("schedule-caption");
const scheduleBody = document.getElementById("schedule-body");
const scheduleWeekPosition = document.getElementById("schedule-week-position");
const scheduleWeekTotal = document.getElementById("schedule-week-total");
const scheduleNextTitle = document.getElementById("schedule-next-title");
const scheduleNextDetail = document.getElementById("schedule-next-detail");
const scheduleTodayButton = document.getElementById("schedule-today-button");
const scheduleSearch = document.getElementById("schedule-search");
const scheduleSearchStatus = document.getElementById("schedule-search-status");
const scheduleSearchResults = document.getElementById("schedule-search-results");
const scheduleDownloadButton = document.getElementById("schedule-download-button");
const scheduleToolStatus = document.getElementById("schedule-tool-status");

const scheduleKindLabels = {
  course: "수업",
  evaluation: "평가",
  holiday: "휴일",
  project: "프로젝트",
  special: "특강"
};
const currentDate = getLocalDateString(new Date());

function createTextElement(tagName, text, className = "") {
  const element = document.createElement(tagName);
  element.textContent = text;

  if (className !== "") {
    element.className = className;
  }

  return element;
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitialWeek() {
  const currentSchedule = classSchedule.find((schedule) => schedule.date === currentDate);

  if (currentSchedule !== undefined) {
    return currentSchedule.week;
  }

  const nextSchedule = classSchedule.find((schedule) => schedule.date > currentDate);

  if (nextSchedule !== undefined) {
    return nextSchedule.week;
  }

  return classSchedule.at(-1)?.week ?? 1;
}

function groupSchedulesByWeek(schedules) {
  const groups = [];

  for (const schedule of schedules) {
    const latestGroup = groups.at(-1);

    if (latestGroup === undefined || latestGroup.week !== schedule.week) {
      groups.push({ week: schedule.week, schedules: [schedule] });
    } else {
      latestGroup.schedules.push(schedule);
    }
  }

  return groups;
}

function getMonthDay(date) {
  const [, month, day] = date.split("-");
  return `${month}.${day}`;
}

function formatScheduleDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(new Date(`${date}T00:00:00`));
}

function getNextDate(date) {
  const nextDate = new Date(`${date}T00:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  return getLocalDateString(nextDate);
}

function escapeCalendarText(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldCalendarLine(line) {
  const encoder = new TextEncoder();
  const segments = [];
  let segment = "";

  for (const character of line) {
    if (segment !== "" && encoder.encode(`${segment}${character}`).length > 75) {
      segments.push(segment);
      segment = ` ${character}`;
    } else {
      segment += character;
    }
  }

  segments.push(segment);
  return segments.join("\r\n");
}

function createCalendarContent() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SKALA Front//Class 4 Schedule//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:SKALA 4기 4반 교육 일정"
  ];

  for (const schedule of classSchedule) {
    const description = `${scheduleKindLabels[schedule.kind] ?? "일정"} · 담당 ${getInstructorText(schedule)}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:skala-class4-${schedule.date}@skala-front.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${schedule.date.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${getNextDate(schedule.date).replaceAll("-", "")}`,
      `SUMMARY:${escapeCalendarText(schedule.course)}`,
      `DESCRIPTION:${escapeCalendarText(description)}`,
      `LOCATION:${escapeCalendarText(classScheduleMeta.room)}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.map(foldCalendarLine).join("\r\n")}\r\n`;
}

function downloadScheduleCalendar() {
  const calendar = new Blob([createCalendarContent()], { type: "text/calendar;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(calendar);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "skala-class4-schedule.ics";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 0);
}

function createWeekDay(schedule) {
  const item = document.createElement("span");
  const date = document.createElement("time");
  const day = createTextElement("span", schedule.day);
  const monthDay = createTextElement("strong", getMonthDay(schedule.date));

  item.className = "schedule-week-day";
  date.dateTime = schedule.date;
  date.append(day, monthDay);

  if (schedule.date === currentDate) {
    const today = createTextElement("small", "오늘");
    item.classList.add("is-today");
    date.setAttribute("aria-current", "date");
    date.append(today);
  }

  item.append(date);
  return item;
}

function createWeekCard(group) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  const title = createTextElement("strong", `${group.week}주차`, "schedule-week-card-title");
  const range = document.createElement("span");
  const startDate = createTextElement("time", getMonthDay(group.schedules[0].date));
  const endDate = createTextElement("time", getMonthDay(group.schedules.at(-1).date));
  const days = document.createElement("span");

  item.className = "schedule-week-slide";
  button.id = `schedule-week-${group.week}`;
  button.className = "schedule-week-card";
  button.type = "button";
  button.tabIndex = -1;
  button.dataset.week = String(group.week);
  button.setAttribute("aria-label", `${group.week}주차 ${getMonthDay(group.schedules[0].date)}부터 ${getMonthDay(group.schedules.at(-1).date)}까지 일정 보기`);
  startDate.dateTime = group.schedules[0].date;
  endDate.dateTime = group.schedules.at(-1).date;
  range.className = "schedule-week-range";
  range.append(startDate, " ~ ", endDate);
  days.className = "schedule-week-days";

  for (const schedule of group.schedules) {
    days.append(createWeekDay(schedule));
  }

  if (group.schedules.some((schedule) => schedule.date === currentDate)) {
    button.classList.add("has-today");
  }

  button.append(title, range, days);
  item.append(button);
  return item;
}

function createCourseCell(schedule) {
  const courseCell = document.createElement("td");
  const courseContent = document.createElement("p");
  const kind = scheduleKindLabels[schedule.kind] === undefined ? "course" : schedule.kind;
  const badge = createTextElement("span", scheduleKindLabels[kind], "schedule-badge");
  const courseName = createTextElement("span", schedule.course);

  courseCell.className = "schedule-course";
  badge.dataset.kind = kind;
  courseContent.append(badge, courseName);
  courseCell.append(courseContent);
  return courseCell;
}

function getInstructorText(schedule) {
  if (schedule.kind === "holiday") {
    return "—";
  }

  return schedule.instructor === "" ? "원본 미기재" : schedule.instructor;
}

function getRelevantSchedule() {
  const todaySchedule = classSchedule.find((schedule) => schedule.date === currentDate);

  if (todaySchedule !== undefined) {
    return { schedule: todaySchedule, isToday: true };
  }

  const nextSchedule = classSchedule.find((schedule) => schedule.date > currentDate);
  return nextSchedule === undefined ? null : { schedule: nextSchedule, isToday: false };
}

function renderRelevantSchedule(relevantSchedule) {
  if (scheduleNextTitle === null || scheduleNextDetail === null) {
    return;
  }

  if (relevantSchedule === null) {
    scheduleNextTitle.textContent = "전체 교육 과정이 종료되었습니다";
    scheduleNextDetail.replaceChildren(
      createTextElement("p", "22주 동안의 SKALA 4기 교육 일정을 모두 마쳤습니다.")
    );
    return;
  }

  const { schedule, isToday } = relevantSchedule;
  const badge = createTextElement("span", scheduleKindLabels[schedule.kind] ?? "일정", "schedule-badge");
  const date = createTextElement("time", formatScheduleDate(schedule.date));
  const course = createTextElement("strong", schedule.course);
  const meta = createTextElement(
    "p",
    `${schedule.week}주차 · ${classScheduleMeta.room} · 담당 ${getInstructorText(schedule)}`
  );

  scheduleNextTitle.textContent = isToday ? "오늘의 교육 일정" : "다음 교육 일정";
  badge.dataset.kind = scheduleKindLabels[schedule.kind] === undefined ? "course" : schedule.kind;
  date.dateTime = schedule.date;
  scheduleNextDetail.replaceChildren(badge, date, course, meta);
}

function createScheduleRow(schedule, weekRowspan = 0) {
  const row = document.createElement("tr");
  const isToday = schedule.date === currentDate;

  if (isToday) {
    row.classList.add("schedule-today");
  }

  if (weekRowspan > 0) {
    const weekHeader = createTextElement("th", `${schedule.week}주차`);
    weekHeader.scope = "rowgroup";
    weekHeader.rowSpan = weekRowspan;
    row.append(weekHeader);
  }

  const dateCell = document.createElement("th");
  const date = createTextElement("time", schedule.date);
  dateCell.scope = "row";
  date.dateTime = schedule.date;
  dateCell.append(date);

  if (isToday) {
    date.setAttribute("aria-current", "date");
  }

  const dayCell = createTextElement("td", `${schedule.day}요일`);
  const roomCell = createTextElement("td", classScheduleMeta.room);
  const instructorCell = createTextElement("td", getInstructorText(schedule));

  row.append(dateCell, dayCell, createCourseCell(schedule), roomCell, instructorCell);
  return row;
}

function renderEmptySchedule() {
  const row = document.createElement("tr");
  const messageCell = createTextElement("td", "선택한 주차에 등록된 일정이 없습니다.", "schedule-empty");
  messageCell.colSpan = 6;
  row.append(messageCell);
  scheduleBody.replaceChildren(row);
}

function renderSchedule(selectedWeek) {
  const selectedSchedules = classSchedule.filter((schedule) => schedule.week === selectedWeek);
  const selectedLabel = `${selectedWeek}주차`;

  scheduleCaption.textContent = `SKALA ${classScheduleMeta.className} 교육 일정 - ${selectedLabel}`;

  if (selectedSchedules.length === 0) {
    renderEmptySchedule();
    scheduleStatus.textContent = `${selectedLabel}에는 등록된 일정이 없습니다.`;
    scheduleBody.classList.remove("schedule-content-enter");
    return;
  }

  const rows = document.createDocumentFragment();
  const weekGroups = groupSchedulesByWeek(selectedSchedules);

  for (const group of weekGroups) {
    group.schedules.forEach((schedule, index) => {
      rows.append(createScheduleRow(schedule, index === 0 ? group.schedules.length : 0));
    });
  }

  scheduleBody.replaceChildren(rows);
  scheduleBody.classList.remove("schedule-content-enter");
  void scheduleBody.offsetWidth;
  scheduleBody.classList.add("schedule-content-enter");
  const todayNotice = selectedSchedules.some((schedule) => schedule.date === currentDate)
    ? " 오늘 날짜는 주차별 날짜 카드에서 강조했습니다."
    : "";
  scheduleStatus.textContent = `${classScheduleMeta.className} · ${classScheduleMeta.room} · ${selectedLabel} ${selectedSchedules.length}개 일정을 표시하고 있습니다.${todayNotice}`;
}

function initializeClassSchedule() {
  if (
    scheduleWeekScroller === null
    || scheduleWeekList === null
    || scheduleStatus === null
    || scheduleCaption === null
    || scheduleBody === null
    || scheduleWeekPosition === null
    || scheduleWeekTotal === null
    || !(scheduleTodayButton instanceof HTMLButtonElement)
    || !(scheduleSearch instanceof HTMLInputElement)
    || scheduleSearchStatus === null
    || scheduleSearchResults === null
    || !(scheduleDownloadButton instanceof HTMLButtonElement)
    || scheduleToolStatus === null
  ) {
    return;
  }

  const weekGroups = groupSchedulesByWeek(classSchedule);
  const initialWeek = getInitialWeek();
  const relevantSchedule = getRelevantSchedule();
  let activeWeek = null;
  let renderedWeek = null;
  let scrollFrame = 0;
  let scrollTimer = 0;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let isDragging = false;
  let suppressNextPointerClick = false;
  let clickSuppressionTimer = 0;
  const dragThreshold = 6;

  scheduleWeekList.replaceChildren(...weekGroups.map(createWeekCard));
  scheduleWeekTotal.textContent = String(classScheduleMeta.totalWeeks);
  renderRelevantSchedule(relevantSchedule);

  function getWeekCard(week) {
    return scheduleWeekList.querySelector(`[data-week="${week}"]`);
  }

  function getWeekCards() {
    return scheduleWeekList.querySelectorAll(".schedule-week-card");
  }

  function scrollToWeekCard(card, behavior = "auto") {
    const scrollerBounds = scheduleWeekScroller.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    const targetLeft = scheduleWeekScroller.scrollLeft + cardBounds.left - scrollerBounds.left;
    scheduleWeekScroller.scrollTo({ left: targetLeft, behavior });
  }

  function updateActiveWeek(week) {
    const targetCard = getWeekCard(week);

    if (targetCard === null) {
      return false;
    }

    for (const card of getWeekCards()) {
      const isActive = card === targetCard;
      card.classList.toggle("is-active", isActive);
      card.tabIndex = isActive ? 0 : -1;

      if (isActive) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
    }

    activeWeek = week;
    const activeIndex = weekGroups.findIndex((group) => group.week === week);
    scheduleWeekPosition.textContent = String(activeIndex + 1);
    return true;
  }

  function commitWeek(week, options = {}) {
    const { shouldScroll = false, shouldFocus = false } = options;

    if (!updateActiveWeek(week)) {
      return;
    }

    const targetCard = getWeekCard(week);

    if (renderedWeek !== week) {
      renderedWeek = week;
      renderSchedule(week);
    }

    if (shouldScroll && targetCard !== null) {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      scrollToWeekCard(targetCard, behavior);
    }

    if (shouldFocus && targetCard !== null) {
      targetCard.focus({ preventScroll: true });
    }
  }

  function renderSearchResults() {
    const query = scheduleSearch.value.trim().normalize("NFKC").toLocaleLowerCase("ko-KR");

    if (query === "") {
      scheduleSearchResults.hidden = true;
      scheduleSearchResults.replaceChildren();
      scheduleSearchStatus.textContent = "검색어를 입력하면 22주 전체 일정에서 찾아드립니다.";
      return;
    }

    const matchedSchedules = classSchedule.filter((schedule) => {
      const searchableText = [
        schedule.course,
        schedule.instructor,
        schedule.date,
        `${schedule.week}주차`,
        `${schedule.day}요일`,
        scheduleKindLabels[schedule.kind] ?? ""
      ].join(" ").normalize("NFKC").toLocaleLowerCase("ko-KR");
      return searchableText.includes(query);
    });
    const visibleSchedules = matchedSchedules.slice(0, 10);
    const results = document.createDocumentFragment();

    for (const schedule of visibleSchedules) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      const date = createTextElement("span", `${schedule.week}주차 · ${formatScheduleDate(schedule.date)}`);
      const course = createTextElement("strong", schedule.course);
      const instructor = createTextElement("small", `담당 ${getInstructorText(schedule)}`);

      button.type = "button";
      button.className = "schedule-search-result";
      button.dataset.week = String(schedule.week);
      button.append(date, course, instructor);
      item.append(button);
      results.append(item);
    }

    scheduleSearchResults.replaceChildren(results);
    scheduleSearchResults.hidden = visibleSchedules.length === 0;
    scheduleSearchStatus.textContent = matchedSchedules.length === 0
      ? `“${scheduleSearch.value.trim()}”에 해당하는 일정이 없습니다.`
      : `${matchedSchedules.length}개 일정을 찾았습니다.${matchedSchedules.length > visibleSchedules.length ? " 상위 10개를 표시합니다." : ""}`;
  }

  scheduleTodayButton.addEventListener("click", () => {
    if (relevantSchedule === null) {
      scheduleToolStatus.textContent = "현재 날짜 이후의 교육 일정이 없습니다.";
      return;
    }

    commitWeek(relevantSchedule.schedule.week, { shouldScroll: true, shouldFocus: true });
    scheduleToolStatus.textContent = `${relevantSchedule.schedule.week}주차 ${relevantSchedule.schedule.date} 일정으로 이동했습니다.`;
  });

  scheduleDownloadButton.addEventListener("click", () => {
    downloadScheduleCalendar();
    scheduleToolStatus.textContent = "22주 전체 일정을 skala-class4-schedule.ics 파일로 저장했습니다.";
  });

  scheduleSearch.addEventListener("input", renderSearchResults);

  scheduleSearchResults.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const resultButton = target.closest(".schedule-search-result");

    if (!(resultButton instanceof HTMLButtonElement)) {
      return;
    }

    const week = Number(resultButton.dataset.week);
    commitWeek(week, { shouldScroll: true, shouldFocus: true });
    scheduleToolStatus.textContent = `검색 결과의 ${week}주차 일정으로 이동했습니다.`;
  });

  function getClosestWeek() {
    const scrollerBounds = scheduleWeekScroller.getBoundingClientRect();
    let closestWeek = activeWeek;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const card of getWeekCards()) {
      const cardBounds = card.getBoundingClientRect();
      const distance = Math.abs(scrollerBounds.left - cardBounds.left);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestWeek = Number(card.dataset.week);
      }
    }

    return closestWeek;
  }

  function isDragPointer(event) {
    return event.isPrimary
      && event.button === 0
      && (event.pointerType === "mouse" || event.pointerType === "pen");
  }

  function finishPointerDrag(pointerId) {
    if (dragPointerId !== pointerId) {
      return;
    }

    const completedDrag = isDragging;
    dragPointerId = null;
    isDragging = false;
    scheduleWeekScroller.classList.remove("is-dragging");

    if (scheduleWeekScroller.hasPointerCapture(pointerId)) {
      scheduleWeekScroller.releasePointerCapture(pointerId);
    }

    if (completedDrag) {
      suppressNextPointerClick = true;
      window.clearTimeout(clickSuppressionTimer);
      clickSuppressionTimer = window.setTimeout(() => {
        suppressNextPointerClick = false;
        clickSuppressionTimer = 0;
      }, 0);
      commitWeek(getClosestWeek());
    }
  }

  scheduleWeekScroller.addEventListener("pointerdown", (event) => {
    if (!isDragPointer(event)) {
      return;
    }

    suppressNextPointerClick = false;
    window.clearTimeout(clickSuppressionTimer);
    clickSuppressionTimer = 0;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScrollLeft = scheduleWeekScroller.scrollLeft;
    isDragging = false;
  });

  scheduleWeekScroller.addEventListener("pointermove", (event) => {
    if (event.pointerId !== dragPointerId) {
      return;
    }

    const dragDistance = event.clientX - dragStartX;

    if (!isDragging) {
      if (Math.abs(dragDistance) < dragThreshold) {
        return;
      }

      isDragging = true;
      scheduleWeekScroller.classList.add("is-dragging");
      scheduleWeekScroller.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
    scheduleWeekScroller.scrollLeft = dragStartScrollLeft - dragDistance;
  }, { passive: false });

  scheduleWeekScroller.addEventListener("pointerleave", (event) => {
    if (event.pointerId === dragPointerId && !isDragging) {
      dragPointerId = null;
    }
  });

  scheduleWeekScroller.addEventListener("pointerup", (event) => {
    finishPointerDrag(event.pointerId);
  });

  scheduleWeekScroller.addEventListener("pointercancel", (event) => {
    finishPointerDrag(event.pointerId);
  });

  scheduleWeekScroller.addEventListener("lostpointercapture", (event) => {
    finishPointerDrag(event.pointerId);
  });

  scheduleWeekScroller.addEventListener("click", (event) => {
    if (!suppressNextPointerClick || event.detail === 0) {
      return;
    }

    suppressNextPointerClick = false;
    window.clearTimeout(clickSuppressionTimer);
    clickSuppressionTimer = 0;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  scheduleWeekScroller.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);

    if (scrollFrame === 0) {
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        updateActiveWeek(getClosestWeek());
      });
    }

    scrollTimer = window.setTimeout(() => {
      commitWeek(getClosestWeek());
    }, 160);
  }, { passive: true });

  scheduleWeekList.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const card = target.closest(".schedule-week-card");

    if (card === null || !scheduleWeekList.contains(card)) {
      return;
    }

    commitWeek(Number(card.dataset.week), { shouldScroll: true });
  });

  scheduleWeekScroller.addEventListener("keydown", (event) => {
    const navigationKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];

    if (!navigationKeys.includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = weekGroups.findIndex((group) => group.week === activeWeek);
    let nextIndex = currentIndex;

    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = weekGroups.length - 1;
    } else {
      const direction = event.key === "ArrowRight" ? 1 : -1;
      nextIndex = Math.min(Math.max(currentIndex + direction, 0), weekGroups.length - 1);
    }

    commitWeek(weekGroups[nextIndex].week, { shouldScroll: true, shouldFocus: true });
  });

  commitWeek(initialWeek);
  window.requestAnimationFrame(() => {
    const initialCard = getWeekCard(initialWeek);

    if (initialCard !== null) {
      scrollToWeekCard(initialCard);
    }
  });
}

initializeClassSchedule();
