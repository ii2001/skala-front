import { classSchedule, classScheduleMeta } from "./classScheduleData.js";

const scheduleWeekSelect = document.getElementById("schedule-week");
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
  const today = getLocalDateString(new Date());
  const currentSchedule = classSchedule.find((schedule) => schedule.date === today);

  if (currentSchedule !== undefined) {
    return String(currentSchedule.week);
  }

  const nextSchedule = classSchedule.find((schedule) => schedule.date > today);

  if (nextSchedule !== undefined) {
    return String(nextSchedule.week);
  }

  return "all";
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
  const selectedSchedules = selectedWeek === "all"
    ? classSchedule
    : classSchedule.filter((schedule) => schedule.week === Number(selectedWeek));
  const selectedLabel = selectedWeek === "all" ? "전체 일정" : `${selectedWeek}주차`;

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
  scheduleStatus.textContent = `${classScheduleMeta.className} · ${classScheduleMeta.room} · ${selectedLabel} ${selectedSchedules.length}개 일정을 표시하고 있습니다.`;
}

function initializeClassSchedule() {
  if (
    scheduleWeekSelect === null
    || scheduleStatus === null
    || scheduleCaption === null
    || scheduleBody === null
  ) {
    return;
  }

  const initialWeek = getInitialWeek();
  const initialOption = scheduleWeekSelect.querySelector(`option[value="${initialWeek}"]`);
  scheduleWeekSelect.value = initialOption === null ? "all" : initialWeek;
  renderSchedule(scheduleWeekSelect.value);

  scheduleWeekSelect.addEventListener("change", () => {
    renderSchedule(scheduleWeekSelect.value);
  });
}

initializeClassSchedule();
