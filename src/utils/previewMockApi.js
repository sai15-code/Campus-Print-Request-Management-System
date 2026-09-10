import {
  DEMO_STUDENT,
  DEMO_ADMIN,
  INITIAL_PRINT_REQUESTS,
  INITIAL_STUDENTS,
  INITIAL_SHOPS,
  INITIAL_PRICING_LIST,
} from '../data/mockData.js';

let requests = [...INITIAL_PRINT_REQUESTS];
let students = [...INITIAL_STUDENTS];
let shops = [...INITIAL_SHOPS];
let pricing = [...INITIAL_PRICING_LIST];
let student = { ...DEMO_STUDENT };
let admin = { ...DEMO_ADMIN };

const jsonBody = (options) => {
  if (!options?.body) return {};
  try { return typeof options.body === 'string' ? JSON.parse(options.body) : options.body; } catch { return {}; }
};

const response = (data) => ({ data });
const withQuery = (endpoint) => endpoint.split('?')[0];
const studentRequests = () => requests.filter((item) => item.studentId === student.id);
const stats = () => {
  const own = studentRequests();
  return {
    totalRequests: own.length,
    pendingRequests: own.filter((r) => r.status === 'PENDING').length,
    printingRequests: own.filter((r) => ['ACCEPTED', 'PRINTING'].includes(r.status)).length,
    readyRequests: own.filter((r) => r.status === 'READY').length,
    collectedRequests: own.filter((r) => r.status === 'COLLECTED').length,
    totalSpent: own.reduce((sum, r) => sum + Number(r.amount || 0), 0),
  };
};

export function previewRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const path = withQuery(endpoint);
  const body = jsonBody(options);

  if (path === '/health') return response({ status: 'ok', preview: true });
  if (path === '/auth/login' || path === '/auth/student/login') {
    const isAdmin = endpoint.includes('admin') || body.email === DEMO_ADMIN.email;
    return response({ user: isAdmin ? admin : student, admin: isAdmin ? admin : undefined, token: `preview-${isAdmin ? 'admin' : 'student'}-token` });
  }
  if (path === '/auth/admin/login') return response({ admin, user: admin, token: 'preview-admin-token' });
  if (path === '/auth/register') {
    student = { ...student, ...body, id: `STU-${Date.now().toString().slice(-4)}`, role: 'Student' };
    students = [student, ...students];
    return response({ user: student, token: 'preview-student-token' });
  }
  if (path === '/auth/me') return response({ user: student });

  if (path === '/shops') return response({ shops });
  if (path === '/pricing') return response({ pricing });
  if (path === '/student/dashboard-stats') return response({ stats: stats(), recentRequests: studentRequests().slice(0, 4) });
  if (path === '/student/requests' && method === 'GET') return response({ total: studentRequests().length, page: 1, requests: studentRequests() });
  if (path.startsWith('/student/requests/') && method === 'GET') {
    return response({ request: requests.find((item) => item.id === path.split('/').pop()) || requests[0] });
  }
  if (path === '/student/requests' && method === 'POST') {
    const shop = shops.find((item) => item.id === body.shopId) || shops[0];
    const pages = Number(body.pages) || 1;
    const copies = Number(body.copies) || 1;
    const pricePerPage = body.printType === 'Color' ? 10 : 2;
    const created = { ...body, id: `REQ-2026-${String(requests.length + 1).padStart(3, '0')}`, studentId: student.id, studentName: student.name, studentEmail: student.email, printShop: shop.name, shopLocation: shop.location, pricePerPage, amount: pages * copies * pricePerPage, status: 'PENDING', paymentStatus: 'PAID', date: 'Sep 10, 2026 10:30 AM', timeline: [{ status: 'Submitted', timestamp: 'Sep 10, 2026 10:30 AM', note: 'Preview request submitted.', completed: true }] };
    requests = [created, ...requests];
    return response({ request: created });
  }
  if (path === '/student/profile' && method === 'GET') return response({ user: student });
  if (path === '/student/profile' && method === 'PUT') { student = { ...student, ...body }; return response({ user: student }); }

  if (path === '/admin/dashboard-stats') {
    return response({ metrics: { totalRequests: requests.length, pendingCount: requests.filter((r) => r.status === 'PENDING').length, printingCount: requests.filter((r) => r.status === 'PRINTING').length, readyCount: requests.filter((r) => r.status === 'READY').length, totalRevenue: requests.reduce((sum, r) => sum + Number(r.amount || 0), 0), activeStudents: students.filter((s) => s.status === 'ACTIVE').length }, recentRequests: requests.slice(0, 6) });
  }
  if (path === '/admin/requests' && method === 'GET') return response({ total: requests.length, page: 1, requests });
  if (path.startsWith('/admin/requests/') && path.endsWith('/status') && method === 'PATCH') {
    const id = path.split('/')[3];
    requests = requests.map((item) => item.id === id ? { ...item, status: body.status, operatorNote: body.note } : item);
    return response({ request: requests.find((item) => item.id === id) });
  }
  if (path.startsWith('/admin/requests/') && method === 'GET') return response({ request: requests.find((item) => item.id === path.split('/').pop()) || requests[0] });
  if (path === '/admin/students' && method === 'GET') return response({ total: students.length, page: 1, students });
  if (path.startsWith('/admin/students/') && path.endsWith('/status') && method === 'PATCH') { const id = path.split('/')[3]; students = students.map((item) => item.id === id ? { ...item, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : item); return response(students.find((item) => item.id === id)); }
  if (path === '/admin/profile' && method === 'GET') return response({ admin });
  if (path === '/admin/profile' && method === 'PUT') { admin = { ...admin, ...body }; return response({ admin }); }
  if (path === '/admin/profile/password') return response({ success: true, message: 'Preview password updated.' });

  return response({});
}

export const PREVIEW_MOCKS_ENABLED = import.meta.env?.VITE_PREVIEW_MOCKS !== 'false';
export { student, admin };
