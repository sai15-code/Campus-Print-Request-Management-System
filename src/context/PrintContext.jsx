import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DEMO_STUDENT,
  DEMO_ADMIN,
  INITIAL_SHOPS,
  INITIAL_PRICING_LIST,
  PRICING_RATES,
  INITIAL_PRINT_REQUESTS,
  INITIAL_STUDENTS,
} from '../data/mockData.js';

import api, { PREVIEW_MOCKS_ENABLED } from '../utils/api.js';

const PrintContext = createContext(null);

export const PrintProvider = ({ children }) => {
  // 1. Student Authentication State (Isolated in Tab/Storage)
  const [currentUser, setCurrentUser] = useState(() => {
    if (PREVIEW_MOCKS_ENABLED) return DEMO_STUDENT;
    const token = api.getStudentToken();
    if (!token) return null;
    const saved =
      sessionStorage.getItem('campus_student_user') ||
      localStorage.getItem('campus_student_user') ||
      sessionStorage.getItem('campus_print_user') ||
      localStorage.getItem('campus_print_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // 2. Admin Authentication State (Isolated in Tab/Storage)
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    if (PREVIEW_MOCKS_ENABLED) return DEMO_ADMIN;
    const token = api.getAdminToken();
    if (!token) return null;
    const saved =
      sessionStorage.getItem('campus_admin_user') ||
      localStorage.getItem('campus_admin_user') ||
      sessionStorage.getItem('campus_print_admin') ||
      localStorage.getItem('campus_print_admin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // 3. Print Requests State
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('campus_print_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRINT_REQUESTS;
      }
    }
    return INITIAL_PRINT_REQUESTS;
  });

  // 4. Print Shops State
  const [shops, setShops] = useState(() => {
    const saved = localStorage.getItem('campus_print_shops');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SHOPS;
      }
    }
    return INITIAL_SHOPS;
  });

  // 5. Pricing Records State
  const [pricingList, setPricingList] = useState(() => {
    const saved = localStorage.getItem('campus_print_pricing');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PRICING_LIST;
      }
    }
    return INITIAL_PRICING_LIST;
  });

  // 6. Registered Students State
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('campus_print_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_STUDENTS;
      }
    }
    return INITIAL_STUDENTS;
  });

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Live Student Requests Count State (from MySQL Backend)
  const [studentRequestCount, setStudentRequestCount] = useState(0);

  const refreshStudentRequests = async () => {
    const token = api.getStudentToken();
    if (!token) return;
    try {
      const data = await api.getStudentRequests();
      if (data && Array.isArray(data.requests)) {
        setStudentRequestCount(data.requests.length);
      }
    } catch (e) {
      // Ignore background fetch failure
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshStudentRequests();
    } else {
      setStudentRequestCount(0);
    }
  }, [currentUser]);

  // Sync student states to storage
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('campus_student_user', JSON.stringify(currentUser));
      localStorage.setItem('campus_student_user', JSON.stringify(currentUser));
      localStorage.setItem('campus_print_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('campus_student_user');
      localStorage.removeItem('campus_student_user');
      localStorage.removeItem('campus_print_user');
    }
  }, [currentUser]);

  // Sync admin states to storage
  useEffect(() => {
    if (currentAdmin) {
      sessionStorage.setItem('campus_admin_user', JSON.stringify(currentAdmin));
      localStorage.setItem('campus_admin_user', JSON.stringify(currentAdmin));
      localStorage.setItem('campus_print_admin', JSON.stringify(currentAdmin));
    } else {
      sessionStorage.removeItem('campus_admin_user');
      localStorage.removeItem('campus_admin_user');
      localStorage.removeItem('campus_print_admin');
    }
  }, [currentAdmin]);

  useEffect(() => {
    localStorage.setItem('campus_print_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('campus_print_shops', JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem('campus_print_pricing', JSON.stringify(pricingList));
  }, [pricingList]);

  useEffect(() => {
    localStorage.setItem('campus_print_students', JSON.stringify(students));
  }, [students]);

  // Derive dynamic pricingRates object for calculations
  const dynamicPricingRates = React.useMemo(() => {
    const rates = {
      'B&W': { Single: 2.0, Double: 1.5 },
      Color: { Single: 10.0, Double: 8.0 },
    };

    pricingList.forEach((item) => {
      if (item.shopId === 'shop-main' || !item.shopId) {
        if (rates[item.printType]) {
          rates[item.printType][item.side] = Number(item.pricePerPage);
        }
      }
    });

    return rates;
  }, [pricingList]);

  // ==========================================
  // AUTHENTICATION METHODS (ROLE ISOLATED)
  // ==========================================
  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      if (data && data.user) {
        const user = data.user;
        const role = (user.role || '').toUpperCase();

        if (role === 'ADMIN') {
          setCurrentAdmin(user);
          showToast(`Welcome to Admin Portal, ${user.name || 'Admin'}!`, 'success');
          return { success: true, user, role: 'ADMIN' };
        } else if (role === 'STUDENT') {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name || 'Student'}!`, 'success');
          return { success: true, user, role: 'STUDENT' };
        } else {
          return { success: false, message: 'Unrecognized user role returned from server.' };
        }
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (err) {
      const message = err.message || 'Invalid email or password.';
      return { success: false, message };
    }
  };

  const studentLogin = async (email, password) => {
    try {
      const data = await api.studentLogin(email, password);
      if (data && data.user) {
        setCurrentUser(data.user);
        showToast(`Welcome back, ${data.user.name || 'Student'}!`, 'success');
        return { success: true, user: data.user, role: 'STUDENT' };
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Invalid student credentials.' };
    }
  };

  const adminLogin = async (email, password) => {
    try {
      const data = await api.adminLogin(email, password);
      const adminObj = data?.admin || data?.user;
      if (adminObj) {
        setCurrentAdmin(adminObj);
        showToast(`Welcome to Admin Portal, ${adminObj.name || 'Admin'}!`, 'success');
        return { success: true, admin: adminObj, role: 'ADMIN' };
      }
      return { success: false, message: 'Invalid response from server.' };
    } catch (err) {
      return { success: false, message: err?.message || 'Invalid admin credentials.' };
    }
  };

  const logout = () => {
    api.removeStudentToken();
    setCurrentUser(null);
    showToast('Student signed out successfully.', 'info');
  };

  const adminLogout = () => {
    api.removeAdminToken();
    setCurrentAdmin(null);
    showToast('Admin signed out successfully.', 'info');
  };

  const updateProfile = (updatedFields) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
    showToast('Profile updated successfully!', 'success');
    return { success: true };
  };

  const updateAdminProfile = async (updatedFields) => {
    try {
      const updated = await api.updateAdminProfile(updatedFields);
      const newAdmin = { ...(currentAdmin || {}), ...(updated || updatedFields) };
      setCurrentAdmin(newAdmin);
      localStorage.setItem('campus_print_admin', JSON.stringify(newAdmin));
      showToast('Admin profile updated successfully!', 'success');
      return { success: true, admin: newAdmin };
    } catch (err) {
      showToast(err?.message || 'Failed to update admin profile.', 'error');
      return { success: false, message: err?.message };
    }
  };

  // ==========================================
  // PRINT REQUESTS METHODS & TRANSITIONS
  // ==========================================
  const addRequest = (newRequestData) => {
    const selectedShop =
      shops.find((s) => s.name === newRequestData.printShop) || shops[0] || INITIAL_SHOPS[0];

    const printType = newRequestData.printType || 'B&W';
    const side = newRequestData.side || 'Single';
    const pricePerPage = dynamicPricingRates[printType]?.[side] ?? 2.0;
    const pages = Number(newRequestData.pages) || 1;
    const copies = Number(newRequestData.copies) || 1;
    const calculatedAmount = Number((pages * copies * pricePerPage).toFixed(2));

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const nextIdNumber = requests.length + 1;
    const newId = `REQ-2026-${String(nextIdNumber).padStart(3, '0')}`;

    const studentInfo = currentUser || DEMO_STUDENT;

    const newRequest = {
      id: newId,
      studentId: studentInfo.id || 'STU-8924',
      studentName: studentInfo.name || 'Student One',
      studentEmail: studentInfo.email || 'student1@campus.edu',
      studentRoll: studentInfo.rollNumber || '21CS042',
      studentDepartment: studentInfo.department || 'Computer Science & Engineering',
      studentPhone: studentInfo.phone || '+91 98765 43210',
      documentName: newRequestData.documentName || 'Document.pdf',
      fileSize: newRequestData.fileSize || '1.5 MB',
      pages,
      copies,
      printType,
      side,
      shopId: selectedShop.id,
      printShop: selectedShop.name,
      shopLocation: selectedShop.location,
      pricePerPage,
      amount: calculatedAmount,
      status: 'PENDING',
      paymentStatus: 'PAID',
      paymentMethod: 'Campus Smart Pay / UPI',
      specialInstructions: newRequestData.specialInstructions || 'Standard printing requested.',
      date: formattedDate,
      timeline: [
        {
          status: 'Submitted',
          timestamp: formattedDate,
          note: 'Request placed by student. Awaiting shop operator confirmation.',
          completed: true,
        },
        {
          status: 'Accepted',
          timestamp: 'Pending queue',
          note: 'Operator will verify paper and spool to machine.',
          completed: false,
        },
        {
          status: 'Printing',
          timestamp: 'Queued',
          note: 'In printer queue.',
          completed: false,
        },
        {
          status: 'Ready',
          timestamp: 'Pending',
          note: 'Document ready for collection at shop counter.',
          completed: false,
        },
        {
          status: 'Collected',
          timestamp: 'Pending pickup',
          note: 'Awaiting student pickup.',
          completed: false,
        },
      ],
    };

    setRequests((prev) => [newRequest, ...prev]);
    showToast(`Print Request ${newId} submitted successfully!`, 'success');
    return newRequest;
  };

  const getRequestById = (id) => {
    return requests.find((r) => r.id === id);
  };

  /**
   * Allowed Status Workflow:
   * PENDING -> ACCEPTED or REJECTED
   * ACCEPTED -> PRINTING
   * PRINTING -> READY
   * READY -> COLLECTED
   */
  const getAllowedNextStatuses = (currentStatus) => {
    const norm = (currentStatus || '').toUpperCase();
    switch (norm) {
      case 'PENDING':
        return ['ACCEPTED', 'REJECTED'];
      case 'ACCEPTED':
        return ['PRINTING'];
      case 'PRINTING':
        return ['READY'];
      case 'READY':
        return ['COLLECTED'];
      case 'COLLECTED':
      case 'REJECTED':
      default:
        return []; // Terminal states
    }
  };

  const updateRequestStatus = (requestId, nextStatus, operatorNote = '') => {
    const targetRequest = requests.find((r) => r.id === requestId);
    if (!targetRequest) {
      return { success: false, message: 'Request not found.' };
    }

    const normNext = (nextStatus || '').toUpperCase();
    const allowed = getAllowedNextStatuses(targetRequest.status);

    if (!allowed.includes(normNext)) {
      return {
        success: false,
        message: `Invalid status transition from ${targetRequest.status} to ${normNext}. Allowed: ${
          allowed.join(', ') || 'None'
        }`,
      };
    }

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const defaultNotes = {
      ACCEPTED: 'Request accepted by admin. Added to print batch spooler.',
      REJECTED: operatorNote || 'Request rejected due to formatting/paper stock limits.',
      PRINTING: 'Document spooled and active on high-speed digital printer.',
      READY: 'Print job completed and placed in pickup holding rack.',
      COLLECTED: 'Document collected and verified at counter.',
    };

    const newTimelineEntry = {
      status:
        normNext === 'ACCEPTED'
          ? 'Accepted'
          : normNext === 'PRINTING'
          ? 'Printing'
          : normNext === 'READY'
          ? 'Ready'
          : normNext === 'COLLECTED'
          ? 'Collected'
          : 'Rejected',
      timestamp: formattedTimestamp,
      note: operatorNote || defaultNotes[normNext] || `Status updated to ${normNext}`,
      completed: true,
    };

    const updatedTimeline = targetRequest.timeline.map((entry) => {
      if (entry.status.toUpperCase() === normNext) {
        return {
          ...entry,
          timestamp: formattedTimestamp,
          note: operatorNote || defaultNotes[normNext] || entry.note,
          completed: true,
        };
      }
      return entry;
    });

    // If status wasn't already in the standard timeline steps (like REJECTED)
    const hasStatus = updatedTimeline.some((e) => e.status.toUpperCase() === normNext);
    const finalTimeline = hasStatus ? updatedTimeline : [...updatedTimeline, newTimelineEntry];

    const updatedRequest = {
      ...targetRequest,
      status: normNext,
      paymentStatus: normNext === 'REJECTED' ? 'REFUNDED' : targetRequest.paymentStatus,
      timeline: finalTimeline,
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));
    showToast(`Request ${requestId} status changed to ${normNext}`, 'success');

    return { success: true, updatedRequest };
  };

  // ==========================================
  // PRINT SHOPS CRUD
  // ==========================================
  const addShop = (shopData) => {
    const newId = `shop-${Date.now().toString().slice(-4)}`;
    const newShop = {
      id: newId,
      name: shopData.name,
      shortName: shopData.shortName || shopData.name,
      location: shopData.location,
      timing: shopData.timing || '8:30 AM - 6:00 PM (Mon - Sat)',
      contact: shopData.contact || '+91 98765 00000',
      email: shopData.email || 'shop@campus.edu',
      rating: 4.8,
      status: shopData.status || 'ACTIVE',
      services: shopData.services || ['B&W Laser', 'Color Printing', 'Binding'],
    };

    setShops((prev) => [...prev, newShop]);
    showToast(`Shop "${newShop.name}" added successfully!`, 'success');
    return newShop;
  };

  const updateShop = (shopId, updatedFields) => {
    setShops((prev) =>
      prev.map((s) => (s.id === shopId ? { ...s, ...updatedFields } : s))
    );
    showToast('Shop details updated successfully!', 'success');
    return { success: true };
  };

  const toggleShopStatus = (shopId) => {
    let nextStatus = 'ACTIVE';
    setShops((prev) =>
      prev.map((s) => {
        if (s.id === shopId) {
          nextStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
    showToast(`Shop status toggled to ${nextStatus}`, 'info');
  };

  // ==========================================
  // PRICING MANAGEMENT CRUD
  // ==========================================
  const addPricing = (pricingData) => {
    const newId = `PRC-${Date.now().toString().slice(-4)}`;
    const newRecord = {
      id: newId,
      shopId: pricingData.shopId || 'shop-main',
      shopName: pricingData.shopName || 'Campus Central Xerox & Reprographics Center',
      printType: pricingData.printType || 'B&W',
      side: pricingData.side || 'Single',
      pricePerPage: Number(pricingData.pricePerPage) || 2.0,
      unit: '₹ / page',
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setPricingList((prev) => [...prev, newRecord]);
    showToast('Pricing rule added successfully!', 'success');
    return newRecord;
  };

  const updatePricing = (pricingId, updatedFields) => {
    setPricingList((prev) =>
      prev.map((item) =>
        item.id === pricingId
          ? {
              ...item,
              ...updatedFields,
              pricePerPage: Number(updatedFields.pricePerPage ?? item.pricePerPage),
              lastUpdated: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            }
          : item
      )
    );
    showToast('Pricing updated successfully!', 'success');
  };

  const deletePricing = (pricingId) => {
    setPricingList((prev) => prev.filter((p) => p.id !== pricingId));
    showToast('Pricing rule removed', 'info');
  };

  // ==========================================
  // STUDENTS MANAGEMENT
  // ==========================================
  const toggleStudentStatus = (studentId) => {
    let nextStatus = 'ACTIVE';
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id === studentId) {
          nextStatus = stu.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          return { ...stu, status: nextStatus };
        }
        return stu;
      })
    );
    showToast(`Student status changed to ${nextStatus}`, 'info');
  };

  return (
    <PrintContext.Provider
      value={{
        // Student Auth & Profile
        currentUser,
        login,
        studentLogin,
        logout,
        updateProfile,

        // Admin Auth & Profile
        currentAdmin,
        adminLogin,
        adminLogout,
        updateAdminProfile,

        // Print Requests & Transitions
        requests,
        studentRequestCount,
        setStudentRequestCount,
        refreshStudentRequests,
        addRequest,
        getRequestById,
        getAllowedNextStatuses,
        updateRequestStatus,

        // Shops CRUD
        shops,
        addShop,
        updateShop,
        toggleShopStatus,

        // Pricing CRUD & Dynamic Matrix
        pricingList,
        pricingRates: dynamicPricingRates,
        addPricing,
        updatePricing,
        deletePricing,

        // Students Management
        students,
        toggleStudentStatus,

        // Global Toast
        toast,
        showToast,
      }}
    >
      {children}
    </PrintContext.Provider>
  );
};

export const usePrintContext = () => {
  const context = useContext(PrintContext);
  if (!context) {
    throw new Error('usePrintContext must be used within a PrintProvider');
  }
  return context;
};

export default PrintContext;
