import React, {
  useState
} from 'react';

import {
  motion
} from 'framer-motion';

import {
  Bell,
  Search,
  Scan,
  FileText,
  Info,
  HelpCircle,
  PhoneCall,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';


export default function ConsumerDashboard({
  userSession,
  onStartScan,
  onViewResult,
  onOpenRightsModal,
  onOpenScans,
  onOpenProfile,
  theme,
  toggleTheme
}) {

  const isDark =
    theme === 'dark';


  const [
    activeTab,
    setActiveTab
  ] = useState('home');


  const [
    searchQuery,
    setSearchQuery
  ] = useState('');


  const handleScans = () => {

    setActiveTab('scans');

    if (onOpenScans) {
      onOpenScans();
    }

  };


  const handleProfile = () => {

    setActiveTab('profile');

    if (onOpenProfile) {
      onOpenProfile();
    }

  };


  return (

    <div
      className={`min-h-screen pb-24 transition-colors duration-300 ${
        isDark
          ? 'bg-black text-white'
          : 'bg-white text-black'
      }`}
    >

      {/* HEADER */}

      <div className="p-6 pb-2 flex justify-between items-center">

        <div>

          <h2
            className={`text-xs font-mono tracking-widest uppercase ${
              isDark
                ? 'text-zinc-500'
                : 'text-zinc-400'
            }`}
          >
            Hello,
          </h2>


          <h1
            className={`text-2xl font-extrabold tracking-tight ${
              isDark
                ? 'text-white'
                : 'text-black'
            }`}
          >
            {userSession?.name || 'User'}
          </h1>

        </div>


        <div className="flex items-center space-x-3">

          <button
            type="button"
            className={`p-2.5 rounded-full border ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 text-white'
                : 'bg-zinc-100 border-zinc-300 text-black'
            }`}
          >

            <Bell className="w-4 h-4" />

          </button>


          <ThemeToggle
            theme={theme}
            toggleTheme={toggleTheme}
          />

        </div>

      </div>


      {/* SEARCH */}

      <div className="px-6 py-3">

        <div
          className={`relative flex items-center rounded-2xl border ${
            isDark
              ? 'bg-zinc-950 border-zinc-800 text-white'
              : 'bg-zinc-100 border-zinc-300 text-black'
          }`}
        >

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            placeholder="Search products or scan..."
            className="w-full bg-transparent px-4 py-3.5 text-sm focus:outline-none placeholder:text-zinc-500"
          />

          <Search className="w-4 h-4 mr-4 text-zinc-400" />

        </div>

      </div>


      <div className="px-6 space-y-6 mt-2">


        {/* SCAN CARD */}

        <motion.div
          whileHover={{
            scale: 1.01
          }}
          whileTap={{
            scale: 0.99
          }}
          onClick={onStartScan}
          className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-zinc-800 hover:border-zinc-600 shadow-[0_4px_25px_rgba(0,0,0,0.8)]'
              : 'bg-gradient-to-b from-zinc-100 to-zinc-50 border-zinc-300 hover:border-zinc-400 shadow-md'
          }`}
        >

          <div className="flex flex-col items-start space-y-4">

            <div
              className={`p-3.5 rounded-2xl border ${
                isDark
                  ? 'bg-black border-zinc-700 text-white'
                  : 'bg-white border-zinc-300 text-black'
              }`}
            >

              <Scan className="w-8 h-8" />

            </div>


            <div>

              <h3
                className={`text-xl font-bold ${
                  isDark
                    ? 'text-white'
                    : 'text-black'
                }`}
              >
                Scan a Product
              </h3>


              <p
                className={`text-xs ${
                  isDark
                    ? 'text-zinc-400'
                    : 'text-zinc-600'
                }`}
              >
                Scan the back of the product to get instant details.
              </p>

            </div>


            <div className="w-full flex justify-end">

              <div
                className={`p-2.5 rounded-full border ${
                  isDark
                    ? 'bg-white text-black border-white'
                    : 'bg-black text-white border-black'
                }`}
              >

                <ArrowRight className="w-4 h-4" />

              </div>

            </div>

          </div>

        </motion.div>


        {/* QUICK ACTIONS */}

        <div className="grid grid-cols-2 gap-3">


          <button
            type="button"
            onClick={handleScans}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 ${
              isDark
                ? 'bg-zinc-950 border-zinc-800'
                : 'bg-zinc-100 border-zinc-300'
            }`}
          >

            <FileText className="w-5 h-5" />

            <span className="text-xs font-semibold">
              My Scans
            </span>

          </button>


          <button
            type="button"
            onClick={() =>
              onViewResult?.(
                'prod-001'
              )
            }
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 ${
              isDark
                ? 'bg-zinc-950 border-zinc-800'
                : 'bg-zinc-100 border-zinc-300'
            }`}
          >

            <Info className="w-5 h-5" />

            <span className="text-xs font-semibold">
              Product Info
            </span>

          </button>


          <button
            type="button"
            onClick={onOpenRightsModal}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 ${
              isDark
                ? 'bg-zinc-950 border-zinc-800'
                : 'bg-zinc-100 border-zinc-300'
            }`}
          >

            <HelpCircle className="w-5 h-5" />

            <span className="text-xs font-semibold">
              Know Your Rights
            </span>

          </button>


          <button
            type="button"
            onClick={() =>
              alert(
                'National Consumer Helpline: 1915 / Legal Metrology Toll-Free: 1800-11-4000'
              )
            }
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 ${
              isDark
                ? 'bg-zinc-950 border-zinc-800'
                : 'bg-zinc-100 border-zinc-300'
            }`}
          >

            <PhoneCall className="w-5 h-5" />

            <span className="text-xs font-semibold">
              Helpline
            </span>

          </button>

        </div>


        {/* RECENT SCANS */}

        <div className="space-y-3 pt-2">

          <div className="flex justify-between items-center">

            <h3
              className={`text-xs font-mono uppercase ${
                isDark
                  ? 'text-zinc-400'
                  : 'text-zinc-600'
              }`}
            >
              Recent Scans
            </h3>


            <button
              type="button"
              onClick={handleScans}
              className="text-xs font-semibold hover:underline"
            >
              View All
            </button>

          </div>


          <div className="space-y-2.5">


            <div
              onClick={() =>
                onViewResult?.(
                  'prod-001'
                )
              }
              className={`cursor-pointer p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >

              <div className="flex items-center space-x-3">

                <div className="p-2 rounded-xl border">

                  <CheckCircle className="w-4 h-4 text-emerald-500" />

                </div>


                <div>

                  <h4 className="text-xs font-bold">
                    Britannia Good Day
                  </h4>

                  <p className="text-[10px] text-zinc-500">
                    100 g • ₹50.00
                  </p>

                </div>

              </div>


              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                Compliant
              </span>

            </div>


            <div
              onClick={() =>
                onViewResult?.(
                  'prod-002'
                )
              }
              className={`cursor-pointer p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >

              <div className="flex items-center space-x-3">

                <div className="p-2 rounded-xl border">

                  <AlertTriangle className="w-4 h-4 text-red-500" />

                </div>


                <div>

                  <h4 className="text-xs font-bold">
                    Maggi 2-Min Noodles
                  </h4>

                  <p className="text-[10px] text-zinc-500">
                    70 g • ₹14.00
                  </p>

                </div>

              </div>


              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-500">
                2 Issues
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* BOTTOM NAV */}

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role="consumer"
        theme={theme}
        onOpenScans={onOpenScans}
        onOpenProfile={handleProfile}
        onStartScan={onStartScan}
      />

    </div>

  );
}