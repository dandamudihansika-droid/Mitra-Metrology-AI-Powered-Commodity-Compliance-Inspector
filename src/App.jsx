import React, { useState, useEffect } from 'react';

import SplashScreen from './pages/SplashScreen';
import RoleSelection from './pages/RoleSelection';
import ConsumerLogin from './pages/ConsumerLogin';
import ConsumerSignUp from './pages/ConsumerSignUp';
import OfficerLogin from './pages/OfficerLogin';
import OfficerSignUp from './pages/OfficerSignUp';

import ConsumerDashboard from './pages/ConsumerDashboard';
import ConsumerProfile from './pages/ConsumerProfile';
import ConsumerScans from './pages/ConsumerScans';
import ConsumerResult from './pages/ConsumerResult';

import OfficerDashboard from './pages/OfficerDashboard';
import OfficerProfile from './pages/OfficerProfile';
import OfficerReport from './pages/OfficerReport';

import ScanProduct from './pages/ScanProduct';
import AdminDashboard from './pages/AdminDashboard';

import ComplaintModal from './components/ComplaintModal';

import { mockRecentInspections } from './data/mockData';

import {
  formatISTDate,
  formatISTTime
} from './utils/dateUtils';

import {
  login,
  registerAccount,
  registerOfficer,
  createComplaint
} from './services/authService';


export default function App() {

  /* =========================================================
     THEME
  ========================================================= */

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mitra_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('mitra_theme', theme);

    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'dark' ? 'light' : 'dark'
    );
  };


  /* =========================================================
     APPLICATION ROUTING
  ========================================================= */

  const [currentPage, setCurrentPage] = useState(() => {
    return (
      localStorage.getItem('mitra_current_page') ||
      'splash'
    );
  });

  const [role, setRole] = useState(() => {
    return (
      localStorage.getItem('mitra_role') ||
      'consumer'
    );
  });

  const [selectedProductId, setSelectedProductId] = useState(
    () => {
      return (
        localStorage.getItem(
          'mitra_selected_product_id'
        ) || ''
      );
    }
  );


  /* =========================================================
     CONSUMER SESSION
     IMPORTANT: PERSIST SESSION SO PROFILE CAN SHOW NAME
  ========================================================= */

  const [userSession, setUserSession] = useState(() => {

    const saved = localStorage.getItem(
      'mitra_consumer_session'
    );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn(
        'Could not restore consumer session:',
        error
      );

      localStorage.removeItem(
        'mitra_consumer_session'
      );

      return null;
    }
  });


  useEffect(() => {

    if (userSession) {

      localStorage.setItem(
        'mitra_consumer_session',
        JSON.stringify(userSession)
      );

    } else {

      localStorage.removeItem(
        'mitra_consumer_session'
      );

    }

  }, [userSession]);


  /* =========================================================
     OFFICER SESSION
  ========================================================= */

  const [officerSession, setOfficerSession] = useState(() => {

    const saved = localStorage.getItem(
      'mitra_officer_session'
    );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch (error) {

      console.warn(
        'Could not restore officer session:',
        error
      );

      localStorage.removeItem(
        'mitra_officer_session'
      );

      return null;
    }
  });


  useEffect(() => {

    if (officerSession) {

      localStorage.setItem(
        'mitra_officer_session',
        JSON.stringify(officerSession)
      );

    } else {

      localStorage.removeItem(
        'mitra_officer_session'
      );

    }

  }, [officerSession]);


  /* =========================================================
     INSPECTIONS / SCAN HISTORY
  ========================================================= */

  const [inspections, setInspections] = useState(() => {

    const saved = localStorage.getItem(
      'mitra_inspections'
    );

    if (saved) {

      try {

        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed;
        }

      } catch (error) {

        console.warn(
          'Failed to parse inspections:',
          error
        );

      }

    }

    return Array.isArray(mockRecentInspections)
      ? mockRecentInspections
      : [];
  });


  useEffect(() => {

    localStorage.setItem(
      'mitra_inspections',
      JSON.stringify(inspections)
    );

  }, [inspections]);


  /* =========================================================
     PERSIST ROUTING STATE
  ========================================================= */

  useEffect(() => {

    localStorage.setItem(
      'mitra_current_page',
      currentPage
    );

  }, [currentPage]);


  useEffect(() => {

    localStorage.setItem(
      'mitra_role',
      role
    );

  }, [role]);


  useEffect(() => {

    if (selectedProductId) {

      localStorage.setItem(
        'mitra_selected_product_id',
        selectedProductId
      );

    }

  }, [selectedProductId]);


  /* =========================================================
     SCAN RESULT
  ========================================================= */

  const [scannedResult, setScannedResult] =
    useState(null);


  /* =========================================================
     COMPLAINT MODAL
  ========================================================= */

  const [isComplaintOpen, setIsComplaintOpen] =
    useState(false);


  /* =========================================================
     START APPLICATION
  ========================================================= */

  const handleStart = () => {

    setCurrentPage('role_selection');

  };


  /* =========================================================
     ROLE SELECTION
  ========================================================= */

  const handleRoleProceed = () => {

    setCurrentPage('login');

  };


  /* =========================================================
     CONSUMER LOGIN
  ========================================================= */

  const handleConsumerLoginSuccess = async (
    identifier,
    password
  ) => {

    try {

      const result = await login(
        identifier,
        password
      );

      if (
        result &&
        result.session
      ) {

        setUserSession(
          result.session
        );

      }

      setRole('consumer');

      setCurrentPage('dashboard');

      return result;

    } catch (error) {

      return {
        success: false,
        error:
          error?.message ||
          'Consumer login failed'
      };

    }

  };


  /* =========================================================
     CONSUMER SIGN UP
  ========================================================= */

  const handleConsumerSignUpSuccess = async (
    userData
  ) => {

    try {

      const result =
        await registerAccount(userData);

      /*
       * Save the session returned by backend.
       * This is what makes the name/email/mobile
       * available on Consumer Profile.
       */

      if (
        result &&
        result.session
      ) {

        setUserSession(
          result.session
        );

      } else {

        /*
         * Fallback:
         * If backend registration doesn't return
         * a session, preserve the entered signup data.
         */

        setUserSession({
          ...userData,
          name:
            userData?.name ||
            userData?.fullName ||
            userData?.full_name ||
            'Consumer',
          email:
            userData?.email ||
            '',
          phone:
            userData?.phone ||
            userData?.mobile ||
            ''
        });

      }

      setRole('consumer');

      setCurrentPage('dashboard');

      return result;

    } catch (error) {

      return {
        success: false,
        error:
          error?.message ||
          'Consumer signup failed'
      };

    }

  };


  /* =========================================================
     OFFICER LOGIN
  ========================================================= */

  const handleOfficerLoginSubmit = async (
    identifier,
    password
  ) => {

    try {

      const result = await login(
        identifier,
        password
      );

      if (
        result &&
        result.session
      ) {

        setOfficerSession(
          result.session
        );

      }

      setRole('officer');

      setCurrentPage('dashboard');

      return result;

    } catch (error) {

      return {
        success: false,
        error:
          error?.message ||
          'Officer login failed'
      };

    }

  };


  /* =========================================================
     OFFICER SIGN UP
  ========================================================= */

  const handleOfficerSignUpSuccess = async (
    officerData
  ) => {

    try {

      const result =
        await registerOfficer(
          officerData
        );

      if (
        result &&
        result.session
      ) {

        setOfficerSession(
          result.session
        );

      }

      setRole('officer');

      setCurrentPage('dashboard');

      return result;

    } catch (error) {

      return {
        success: false,
        error:
          error?.message ||
          'Officer signup failed'
      };

    }

  };


  /* =========================================================
     START SCAN
  ========================================================= */

  const handleStartScan = () => {

    setCurrentPage('scan');

  };


  /* =========================================================
     SCAN COMPLETE
     
     CONSUMER SCAN -> SAVED TO INSPECTIONS
     OFFICER CAN SEE SAME INSPECTION DATA
  ========================================================= */

  const handleScanComplete = (
    backendResult
  ) => {

    if (!backendResult) {

      console.error(
        'Scan completed without result'
      );

      return;

    }

    const serverTimestamp =
      backendResult.timestamp ||
      new Date().toISOString();

    const dateIST =
      formatISTDate(
        serverTimestamp
      );

    const timeIST =
      formatISTTime(
        serverTimestamp
      );


    const resultWithTime = {

      ...backendResult,

      timestamp:
        serverTimestamp,

      date:
        dateIST,

      time:
        timeIST

    };


    setScannedResult(
      resultWithTime
    );


    /* =====================================================
       CREATE COMMON INSPECTION RECORD
       BOTH CONSUMER AND OFFICER USE THIS DATA
    ===================================================== */

    const newAuditRecord = {

      id:
        resultWithTime.id ||
        `INSP-${Date.now()
          .toString()
          .slice(-6)}`,

      productId:
        resultWithTime.productId ||
        resultWithTime.id ||
        '',

      productName:
        resultWithTime.name ||
        resultWithTime.productName ||
        'Packaged Product',

      manufacturer:
        resultWithTime.manufacturer ||
        'Manufacturer not available',

      status:
        resultWithTime.status ||
        (
          Array.isArray(
            resultWithTime.violations
          ) &&
          resultWithTime.violations.length > 0
            ? 'review'
            : 'compliant'
        ),

      violationsCount:
        Array.isArray(
          resultWithTime.violations
        )
          ? resultWithTime.violations.length
          : 0,

      violations:
        Array.isArray(
          resultWithTime.violations
        )
          ? resultWithTime.violations
          : [],

      timestamp:
        serverTimestamp,

      date:
        dateIST,

      time:
        timeIST,

      location:
        resultWithTime.location ||
        'Captured Scanner Site',

      integrityHash:
        resultWithTime.integrityHash ||
        `sha256_${Math.random()
          .toString(36)
          .substring(2, 12)}`,

      /*
       * Keep track of who performed the scan.
       */
      scannedByRole:
        role,

      consumerId:
        userSession?.id ||
        userSession?.userId ||
        null

    };


    /* =====================================================
       SAVE INSPECTION
    ===================================================== */

    setInspections((prev) => {

      const existing =
        Array.isArray(prev)
          ? prev
          : [];

      /*
       * Avoid duplicate records if the same scan
       * is accidentally submitted twice.
       */

      const alreadyExists =
        existing.some(
          (item) =>
            item.id ===
            newAuditRecord.id
        );

      if (alreadyExists) {

        return existing;

      }

      const updated = [
        newAuditRecord,
        ...existing
      ];

      localStorage.setItem(
        'mitra_inspections',
        JSON.stringify(updated)
      );

      return updated;

    });


    /* =====================================================
       SEND USER TO CORRECT RESULT PAGE
    ===================================================== */

    if (role === 'officer') {

      setCurrentPage(
        'officer_report'
      );

    } else {

      setCurrentPage(
        'consumer_result'
      );

    }

  };


  /* =========================================================
     VIEW CONSUMER RESULT
  ========================================================= */

  const handleViewResult = (
    productId
  ) => {

    setSelectedProductId(
      productId || ''
    );

    /*
     * If this is an item from scan history,
     * load its actual information.
     */

    const matchingInspection =
      inspections.find(
        (item) =>
          item.id === productId ||
          item.productId === productId
      );

    if (matchingInspection) {

      setScannedResult(
        matchingInspection
      );

    }

    setCurrentPage(
      'consumer_result'
    );

  };


  /* =========================================================
     VIEW OFFICER REPORT
  ========================================================= */

  const handleViewReport = (
    productId
  ) => {

    setSelectedProductId(
      productId || ''
    );

    const matchingInspection =
      inspections.find(
        (item) =>
          item.id === productId ||
          item.productId === productId
      );

    if (matchingInspection) {

      setScannedResult(
        matchingInspection
      );

    }

    setCurrentPage(
      'officer_report'
    );

  };


  /* =========================================================
     OPEN CONSUMER SCANS
  ========================================================= */

  const handleOpenConsumerScans = () => {

    setCurrentPage(
      'consumer_scans'
    );

  };


  /* =========================================================
     OPEN CONSUMER PROFILE
  ========================================================= */

  const handleOpenConsumerProfile = () => {

    setCurrentPage(
      'consumer_profile'
    );

  };


  /* =========================================================
     OPEN OFFICER PROFILE
  ========================================================= */

  const handleOpenOfficerProfile = () => {

    setCurrentPage(
      'officer_profile'
    );

  };


  /* =========================================================
     CONSUMER LOGOUT
  ========================================================= */

  const handleConsumerLogout = () => {

    setUserSession(null);

    localStorage.removeItem(
      'mitra_consumer_session'
    );

    setRole('consumer');

    setCurrentPage(
      'role_selection'
    );

  };


  /* =========================================================
     OFFICER LOGOUT
  ========================================================= */

  const handleOfficerLogout = () => {

    setOfficerSession(null);

    localStorage.removeItem(
      'mitra_officer_session'
    );

    setRole('officer');

    setCurrentPage(
      'role_selection'
    );

  };


  /* =========================================================
     COMPLAINT
  ========================================================= */

  const handleComplaintSubmit =
    async (payload) => {

      const result =
        await createComplaint({

          ...payload,

          consumer:
            userSession?.name ||
            'Consumer',

          consumerId:
            userSession?.id ||
            userSession?.userId ||
            null,

          product:
            scannedResult?.name ||
            scannedResult?.productName ||
            'Packaged commodity'

        });

      return result;

    };


  /* =========================================================
     UI
  ========================================================= */

  const isDark =
    theme === 'dark';


  return (

    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        isDark
          ? 'bg-black text-white'
          : 'bg-white text-black'
      }`}
    >

      {/* =====================================================
          MOBILE APP CONTAINER
      ===================================================== */}

      <div
        className={`mobile-app-container border-x transition-colors duration-300 ${
          isDark
            ? 'border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-black'
            : 'border-zinc-200 shadow-xl bg-white'
        }`}
      >


        {/* ===================================================
            SPLASH
        =================================================== */}

        {currentPage === 'splash' && (

          <SplashScreen
            onStart={
              handleStart
            }
            theme={
              theme
            }
            toggleTheme={
              toggleTheme
            }
          />

        )}


        {/* ===================================================
            ROLE SELECTION
        =================================================== */}

        {currentPage === 'role_selection' && (

          <RoleSelection
            role={
              role
            }
            setRole={
              setRole
            }
            onProceed={
              handleRoleProceed
            }
            theme={
              theme
            }
            toggleTheme={
              toggleTheme
            }
          />

        )}


        {/* ===================================================
            LOGIN
        =================================================== */}

        {currentPage === 'login' && (

          role === 'officer' ? (

            <OfficerLogin

              onBack={() =>
                setCurrentPage(
                  'role_selection'
                )
              }

              onLoginSubmit={
                handleOfficerLoginSubmit
              }

              onNavigateSignUp={() =>
                setCurrentPage(
                  'officer_signup'
                )
              }

              theme={
                theme
              }

              toggleTheme={
                toggleTheme
              }

            />

          ) : (

            <ConsumerLogin

              onBack={() =>
                setCurrentPage(
                  'role_selection'
                )
              }

              onLoginSuccess={
                handleConsumerLoginSuccess
              }

              onNavigateSignUp={() =>
                setCurrentPage(
                  'signup'
                )
              }

              theme={
                theme
              }

              toggleTheme={
                toggleTheme
              }

            />

          )

        )}


        {/* ===================================================
            CONSUMER SIGNUP
        =================================================== */}

        {currentPage === 'signup' && (

          <ConsumerSignUp

            onBack={() =>
              setCurrentPage(
                'login'
              )
            }

            onSignUpSuccess={
              handleConsumerSignUpSuccess
            }

            onNavigateLogin={() =>
              setCurrentPage(
                'login'
              )
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            OFFICER SIGNUP
        =================================================== */}

        {currentPage === 'officer_signup' && (

          <OfficerSignUp

            onBack={() =>
              setCurrentPage(
                'login'
              )
            }

            onSignUpSuccess={
              handleOfficerSignUpSuccess
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {currentPage === 'dashboard' && (

          role === 'officer' ? (

            <OfficerDashboard

              officerSession={
                officerSession
              }

              onStartScan={
                handleStartScan
              }

              onViewReport={
                handleViewReport
              }

              onOpenAdminSuite={() =>
                setCurrentPage(
                  'admin'
                )
              }

              onNavigateProfile={
                handleOpenOfficerProfile
              }

              inspections={
                inspections
              }

              theme={
                theme
              }

              toggleTheme={
                toggleTheme
              }

            />

          ) : (

            <ConsumerDashboard

              userSession={
                userSession
              }

              onStartScan={
                handleStartScan
              }

              onViewResult={
                handleViewResult
              }

              onOpenRightsModal={() =>
                setIsComplaintOpen(
                  true
                )
              }

              onOpenScans={
                handleOpenConsumerScans
              }

              onOpenProfile={
                handleOpenConsumerProfile
              }

              theme={
                theme
              }

              toggleTheme={
                toggleTheme
              }

            />

          )

        )}


        {/* ===================================================
            SCAN PAGE
        =================================================== */}

        {currentPage === 'scan' && (

          <ScanProduct

            onBack={() =>
              setCurrentPage(
                'dashboard'
              )
            }

            onScanComplete={
              handleScanComplete
            }

            role={
              role
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            CONSUMER SCANS
        =================================================== */}

        {currentPage === 'consumer_scans' && (

          <ConsumerScans

            inspections={
              inspections
            }

            onBack={() =>
              setCurrentPage(
                'dashboard'
              )
            }

            onViewResult={
              handleViewResult
            }

            onStartScan={
              handleStartScan
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            CONSUMER PROFILE
        =================================================== */}

        {currentPage === 'consumer_profile' && (

          <ConsumerProfile

            userSession={
              userSession
            }

            onBack={() =>
              setCurrentPage(
                'dashboard'
              )
            }

            onLogout={
              handleConsumerLogout
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            CONSUMER RESULT
        =================================================== */}

        {currentPage === 'consumer_result' && (

          <ConsumerResult

            scanResult={
              scannedResult
            }

            productId={
              selectedProductId
            }

            onBack={() =>
              setCurrentPage(
                'dashboard'
              )
            }

            onReportConcern={() =>
              setIsComplaintOpen(
                true
              )
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            OFFICER REPORT
        =================================================== */}

        {currentPage === 'officer_report' && (

          <OfficerReport

            scanResult={
              scannedResult
            }

            productId={
              selectedProductId
            }

            onBack={() =>
              setCurrentPage(
                'dashboard'
              )
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            OFFICER PROFILE
        =================================================== */}

        {currentPage === 'officer_profile' && (

          <OfficerProfile

            officerSession={
              officerSession
            }

            onBack={() =>
              setCurrentPage(
                'dashboard'
              )
            }

            onLogout={
              handleOfficerLogout
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            ADMIN
        =================================================== */}

        {currentPage === 'admin' && (

          <AdminDashboard

            onBack={() =>
              setCurrentPage(
                'dashboard'
              )
            }

            theme={
              theme
            }

            toggleTheme={
              toggleTheme
            }

          />

        )}


        {/* ===================================================
            COMPLAINT MODAL
        =================================================== */}

        <ComplaintModal

          isOpen={
            isComplaintOpen
          }

          onClose={() =>
            setIsComplaintOpen(
              false
            )
          }

          onSubmit={
            handleComplaintSubmit
          }

          theme={
            theme
          }

        />

      </div>

    </div>

  );

}