import { Employee, AttendanceRecord } from "./types";

/**
 * In-memory fixture used whenever GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY /
 * GOOGLE_SHEET_ID are not configured. Lets the whole app run and be demoed without
 * live Google credentials. State lives for the life of the server process only.
 */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20250722);
const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];

export const mockEmployees: Employee[] = [
  {
    employeeId: "SBX-VT-2103-01",
    employeeName: "Adaeze Umeh",
    phoneNumber: "0803 214 7710",
    email: "adaeze.umeh@safebox.co",
    jobTitle: "Vault Custodian",
    department: "Vault Operations",
    departmentCode: "VT",
    joiningDate: "2021-03-15",
    supervisorName: "Kelechi Obasi",
    address: "14 Marina Road, Lagos",
  },
  {
    employeeId: "SBX-CL-2007-01",
    employeeName: "Tunde Bakare",
    phoneNumber: "0805 662 9981",
    email: "tunde.bakare@safebox.co",
    jobTitle: "Cash-in-Transit Officer",
    department: "Cash Logistics",
    departmentCode: "CL",
    joiningDate: "2020-07-01",
    supervisorName: "Grace Ihenacho",
    address: "22 Allen Avenue, Ikeja",
  },
  {
    employeeId: "SBX-CS-2201-01",
    employeeName: "Ifeoma Chukwu",
    phoneNumber: "0701 338 2204",
    email: "ifeoma.chukwu@safebox.co",
    jobTitle: "Client Services Lead",
    department: "Client Services",
    departmentCode: "CS",
    joiningDate: "2022-01-10",
    supervisorName: "Grace Ihenacho",
    address: "5 Awolowo Way, Ikoyi",
  },
  {
    employeeId: "SBX-IT-1911-01",
    employeeName: "Segun Adewale",
    phoneNumber: "0906 447 1123",
    email: "segun.adewale@safebox.co",
    jobTitle: "Security Systems Engineer",
    department: "IT & Security Systems",
    departmentCode: "IT",
    joiningDate: "2019-11-20",
    supervisorName: "Kelechi Obasi",
    address: "9 Herbert Macaulay Way, Yaba",
  },
  {
    employeeId: "SBX-FC-2302-01",
    employeeName: "Ngozi Eze",
    phoneNumber: "0812 990 3345",
    email: "ngozi.eze@safebox.co",
    jobTitle: "Facilities Coordinator",
    department: "Facilities",
    departmentCode: "FC",
    joiningDate: "2023-02-06",
    supervisorName: "Grace Ihenacho",
    address: "3 Adeola Odeku Street, VI",
  },
  {
    employeeId: "SBX-VT-2109-01",
    employeeName: "Chidi Obi",
    phoneNumber: "0803 771 6650",
    email: "chidi.obi@safebox.co",
    jobTitle: "Vault Custodian",
    department: "Vault Operations",
    departmentCode: "VT",
    joiningDate: "2021-09-12",
    supervisorName: "Kelechi Obasi",
    address: "17 Opebi Road, Ikeja",
  },
  {
    employeeId: "SBX-CL-2205-01",
    employeeName: "Blessing Okoro",
    phoneNumber: "0708 224 5567",
    email: "blessing.okoro@safebox.co",
    jobTitle: "Cash-in-Transit Officer",
    department: "Cash Logistics",
    departmentCode: "CL",
    joiningDate: "2022-05-30",
    supervisorName: "Grace Ihenacho",
    address: "40 Bode Thomas Street, Surulere",
  },
  {
    employeeId: "SBX-CS-2308-01",
    employeeName: "Emeka Nwosu",
    phoneNumber: "0813 556 8802",
    email: "emeka.nwosu@safebox.co",
    jobTitle: "Client Services Officer",
    department: "Client Services",
    departmentCode: "CS",
    joiningDate: "2023-08-01",
    supervisorName: "Ifeoma Chukwu",
    address: "61 Ozumba Mbadiwe, VI",
  },
];

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function dayName(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long" });
}
function randomTime(hour: number, minSpread: number) {
  const h = hour;
  const m = Math.floor(rand() * minSpread);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(displayHour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function buildHistory(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let daysAgo = 30; daysAgo >= 1; daysAgo--) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    if (d.getDay() === 0) continue; // skip Sunday

    for (const emp of mockEmployees) {
      if (d.getDay() === 6 && emp.department !== "Cash Logistics") continue;

      const roll = rand();
      let statusIn: string = "Early";
      if (roll < 0.08) statusIn = "Leave";
      else if (roll < 0.11) statusIn = "Holiday";
      else if (roll < 0.16) statusIn = "Work from Home";
      else if (roll < 0.2) statusIn = "Site Work";
      else if (roll < 0.32) statusIn = "Tardy(Late Arrival)";
      else if (roll < 0.4) statusIn = "Late(On Official Duty)";
      else statusIn = "Early";

      if (statusIn === "Leave" || statusIn === "Holiday") {
        records.push({
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          department: emp.department,
          date: fmtDate(d),
          day: dayName(d),
          inTime: "",
          attendanceStatusIn: statusIn,
          breakStart: "",
          breakEnd: "",
          outTime: "",
          attendanceStatusOut: "",
        });
        continue;
      }

      const inTime =
        statusIn === "Tardy(Late Arrival)" ? randomTime(9, 45) : randomTime(8, 30);
      const outStatus = rand() < 0.12 ? "Left Early" : rand() < 0.2 ? "Early(On Official Duty)" : "On Time";
      const outTime = outStatus === "Left Early" ? randomTime(15, 40) : randomTime(17, 30);

      records.push({
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        department: emp.department,
        date: fmtDate(d),
        day: dayName(d),
        inTime,
        attendanceStatusIn: statusIn,
        breakStart: "12:00 PM",
        breakEnd: "12:40 PM",
        outTime,
        attendanceStatusOut: outStatus,
      });
    }
  }

  const todayStr = fmtDate(today);
  const todayName = dayName(today);

  records.push({
    employeeId: "SBX-CL-2007-01",
    employeeName: "Tunde Bakare",
    department: "Cash Logistics",
    date: todayStr,
    day: todayName,
    inTime: randomTime(8, 20),
    attendanceStatusIn: "Early",
    breakStart: "12:00 PM",
    breakEnd: "12:40 PM",
    outTime: "",
    attendanceStatusOut: "",
  });

  records.push({
    employeeId: "SBX-CS-2201-01",
    employeeName: "Ifeoma Chukwu",
    department: "Client Services",
    date: todayStr,
    day: todayName,
    inTime: randomTime(8, 40),
    attendanceStatusIn: "Early",
    breakStart: "12:00 PM",
    breakEnd: "12:40 PM",
    outTime: randomTime(17, 15),
    attendanceStatusOut: "On Time",
  });

  records.push({
    employeeId: "SBX-FC-2302-01",
    employeeName: "Ngozi Eze",
    department: "Facilities",
    date: todayStr,
    day: todayName,
    inTime: randomTime(9, 50),
    attendanceStatusIn: "Tardy(Late Arrival)",
    breakStart: "12:00 PM",
    breakEnd: "12:40 PM",
    outTime: "",
    attendanceStatusOut: "",
  });

  records.push({
    employeeId: "SBX-CS-2308-01",
    employeeName: "Emeka Nwosu",
    department: "Client Services",
    date: todayStr,
    day: todayName,
    inTime: "",
    attendanceStatusIn: "Holiday",
    breakStart: "",
    breakEnd: "",
    outTime: "",
    attendanceStatusOut: "",
  });

  return records;
}

export const mockAttendance: AttendanceRecord[] = buildHistory();

export function isSheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_SHEET_ID
  );
}
