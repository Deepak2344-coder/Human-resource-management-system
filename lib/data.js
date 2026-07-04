const users = [
  { id: 1, name: "Admin User", email: "admin@company.com", password: "admin123", role: "admin", department: "Management", employeeId: "ADM001" },
  { id: 2, name: "HR Manager", email: "hr@company.com", password: "hr123", role: "hr", department: "Human Resources", employeeId: "HR001" },
  { id: 3, name: "John Employee", email: "john@company.com", password: "john123", role: "employee", department: "Engineering", employeeId: "EMP001" },
  { id: 4, name: "Jane Smith", email: "jane@company.com", password: "jane123", role: "employee", department: "Marketing", employeeId: "EMP002" },
  { id: 5, name: "Bob Wilson", email: "bob@company.com", password: "bob123", role: "employee", department: "Engineering", employeeId: "EMP003" },
];

const payrollRecords = [
  {
    id: 1, userId: 3, basicSalary: 45000,
    allowances: [{ name: "House Rent Allowance", amount: 15000 }, { name: "Dearness Allowance", amount: 5000 }, { name: "Travel Allowance", amount: 3000 }],
    deductions: [{ name: "Provident Fund", amount: 4500 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 3500 }],
    grossPay: 68000, netPay: 59800, status: "paid", paymentDate: "2026-06-30", month: "June 2026", createdAt: "2026-06-30T10:00:00Z",
  },
  {
    id: 2, userId: 3, basicSalary: 45000,
    allowances: [{ name: "House Rent Allowance", amount: 15000 }, { name: "Dearness Allowance", amount: 5000 }, { name: "Travel Allowance", amount: 3000 }],
    deductions: [{ name: "Provident Fund", amount: 4500 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 3500 }],
    grossPay: 68000, netPay: 59800, status: "paid", paymentDate: "2026-05-31", month: "May 2026", createdAt: "2026-05-31T10:00:00Z",
  },
  {
    id: 3, userId: 3, basicSalary: 45000,
    allowances: [{ name: "House Rent Allowance", amount: 15000 }, { name: "Dearness Allowance", amount: 5000 }, { name: "Travel Allowance", amount: 3000 }],
    deductions: [{ name: "Provident Fund", amount: 4500 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 3000 }],
    grossPay: 68000, netPay: 60300, status: "pending", paymentDate: null, month: "July 2026", createdAt: "2026-07-01T10:00:00Z",
  },
  {
    id: 4, userId: 4, basicSalary: 42000,
    allowances: [{ name: "House Rent Allowance", amount: 12000 }, { name: "Dearness Allowance", amount: 4000 }, { name: "Travel Allowance", amount: 3000 }],
    deductions: [{ name: "Provident Fund", amount: 4200 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 3000 }],
    grossPay: 61000, netPay: 53600, status: "paid", paymentDate: "2026-06-30", month: "June 2026", createdAt: "2026-06-30T10:00:00Z",
  },
  {
    id: 5, userId: 5, basicSalary: 48000,
    allowances: [{ name: "House Rent Allowance", amount: 14000 }, { name: "Dearness Allowance", amount: 4800 }, { name: "Travel Allowance", amount: 3000 }],
    deductions: [{ name: "Provident Fund", amount: 4800 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 3800 }],
    grossPay: 69800, netPay: 61000, status: "pending", paymentDate: null, month: "July 2026", createdAt: "2026-07-01T10:00:00Z",
  },
];

const notifications = [
  { id: 1, userId: 3, targetRole: null, title: "Check-in Successful", message: "You successfully checked in at 09:00 AM on July 4, 2026.", type: "attendance", read: false, createdAt: "2026-07-04T09:00:00Z" },
  { id: 2, userId: 3, targetRole: null, title: "Leave Request Submitted", message: "Your leave request for July 10-12 has been submitted successfully.", type: "leave", read: false, createdAt: "2026-07-03T14:30:00Z" },
  { id: 3, userId: 3, targetRole: null, title: "Leave Approved", message: "Your leave request for July 10-12 has been approved.", type: "leave", read: false, createdAt: "2026-07-03T16:00:00Z" },
  { id: 4, userId: 3, targetRole: null, title: "Payroll Available", message: "Your salary for June 2026 is now available. Net pay: ₹59,800.", type: "payroll", read: true, createdAt: "2026-06-30T10:00:00Z" },
  { id: 5, userId: 3, targetRole: null, title: "Profile Updated", message: "Your profile information was updated successfully.", type: "profile", read: true, createdAt: "2026-06-28T11:00:00Z" },
  { id: 6, userId: 4, targetRole: null, title: "Check-in Successful", message: "You successfully checked in at 08:45 AM on July 4, 2026.", type: "attendance", read: false, createdAt: "2026-07-04T08:45:00Z" },
  { id: 7, userId: null, targetRole: "hr", title: "New Leave Request", message: "John Employee has submitted a leave request for July 10-12.", type: "leave", read: false, createdAt: "2026-07-03T14:30:00Z" },
  { id: 8, userId: null, targetRole: "hr", title: "New Employee Registered", message: "A new employee account requires verification.", type: "announcement", read: false, createdAt: "2026-07-02T09:00:00Z" },
  { id: 9, userId: null, targetRole: "admin", title: "Payroll Update Required", message: "Payroll for July 2026 needs to be processed for all employees.", type: "payroll", read: false, createdAt: "2026-07-01T08:00:00Z" },
  { id: 10, userId: null, targetRole: "hr", title: "Attendance Correction Request", message: "John Employee has requested a correction for July 3 attendance.", type: "attendance", read: false, createdAt: "2026-07-04T10:30:00Z" },
  { id: 11, userId: null, targetRole: "all", title: "HR Announcement: Office Holiday", message: "The office will remain closed on August 15 for Independence Day.", type: "announcement", read: false, createdAt: "2026-07-04T08:00:00Z" },
  { id: 12, userId: null, targetRole: "hr", title: "Payroll Generated", message: "Payroll for June 2026 has been processed successfully.", type: "payroll", read: true, createdAt: "2026-06-30T10:30:00Z" },
];

let nextUserId = users.length + 1;
let nextPayrollId = payrollRecords.length + 1;
let nextNotificationId = notifications.length + 1;

export { users, payrollRecords, notifications };
export function getNextUserId() { return nextUserId++; }
export function getNextPayrollId() { return nextPayrollId++; }
export function getNextNotificationId() { return nextNotificationId++; }
