import { classSchedule, classScheduleMeta } from "./classScheduleData.js";

const scheduleWeekScroller = document.getElementById("schedule-week-scroller");
const scheduleWeekList = document.getElementById("schedule-week-list");
const scheduleStatus = document.getElementById("schedule-status");
const scheduleCaption = document.getElementById("schedule-caption");
const scheduleBody = document.getElementById("schedule-body");

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

function createWeekDay(schedule) {
  const item = document.createElement("li");
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
  const title = createTextElement("strong", `${group.week}주차`, "schedule-week-card-title");
  const range = document.createElement("p");
  const startDate = createTextElement("time", getMonthDay(group.schedules[0].date));
  const endDate = createTextElement("time", getMonthDay(group.schedules.at(-1).date));
  const days = document.createElement("ol");

  item.id = `schedule-week-${group.week}`;
  item.className = "schedule-week-card";
  item.dataset.week = String(group.week);
  startDate.dateTime = group.schedules[0].date;
  endDate.dateTime = group.schedules.at(-1).date;
  range.className = "schedule-week-range";
  range.append(startDate, " ~ ", endDate);
  days.className = "schedule-week-days";

  for (const schedule of group.schedules) {
    days.append(createWeekDay(schedule));
  }

  if (group.schedules.some((schedule) => schedule.date === currentDate)) {
    item.classList.add("has-today");
  }

  item.append(title, range, days);
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

  const dateCell = document.createElement("td");
  const date = createTextElement("time", schedule.date);
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
  ) {
    return;
  }

  const weekGroups = groupSchedulesByWeek(classSchedule);
  const initialWeek = getInitialWeek();
  let activeWeek = null;
  let scrollFrame = 0;

  scheduleWeekList.replaceChildren(...weekGroups.map(createWeekCard));

  function getWeekCard(week) {
    return scheduleWeekList.querySelector(`[data-week="${week}"]`);
  }

  function activateWeek(week, shouldScroll = false) {
    const targetCard = getWeekCard(week);

    if (targetCard === null) {
      return;
    }

    for (const card of scheduleWeekList.children) {
      const isActive = card === targetCard;
      card.classList.toggle("is-active", isActive);

      if (isActive) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
    }

    if (activeWeek !== week) {
      activeWeek = week;
      renderSchedule(week);
    }

    if (shouldScroll) {
      targetCard.scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" });
    }
  }

  function getClosestWeek() {
    const scrollerBounds = scheduleWeekScroller.getBoundingClientRect();
    let closestWeek = activeWeek;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const card of scheduleWeekList.children) {
      const cardBounds = card.getBoundingClientRect();
      const distance = Math.abs(scrollerBounds.left - cardBounds.left);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestWeek = Number(card.dataset.week);
      }
    }

    return closestWeek;
  }

  scheduleWeekScroller.addEventListener("scroll", () => {
    if (scrollFrame !== 0) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      activateWeek(getClosestWeek());
    });
  }, { passive: true });

  scheduleWeekScroller.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const currentIndex = weekGroups.findIndex((group) => group.week === activeWeek);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), weekGroups.length - 1);
    activateWeek(weekGroups[nextIndex].week, true);
  });

  activateWeek(initialWeek);
  window.requestAnimationFrame(() => {
    getWeekCard(initialWeek)?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" });
  });
}

initializeClassSchedule();
