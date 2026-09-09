import React from 'react';
import {
  Home,
  ScanLine,
  User,
  Shield,
  FileText
} from 'lucide-react';

export default function BottomNav({
  activeTab,
  setActiveTab,
  role,
  theme,
  onOpenScans,
  onOpenProfile,
  onStartScan
}) {

  const isDark =
    theme === 'dark';


  const consumerItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home
    },
    {
      id: 'scans',
      label: 'Scans',
      icon: ScanLine
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User
    }
  ];


  const officerItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home
    },
    {
      id: 'inspections',
      label: 'Inspections',
      icon: Shield
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User
    }
  ];


  const items =
    role === 'officer'
      ? officerItems
      : consumerItems;


  const handleNavigation = (
    itemId
  ) => {

    setActiveTab(itemId);


    if (role === 'consumer') {

      if (itemId === 'home') {

        // Dashboard is already handled
        // by the parent App.

      }

      else if (itemId === 'scans') {

        if (onOpenScans) {
          onOpenScans();
        }

      }

      else if (itemId === 'profile') {

        if (onOpenProfile) {
          onOpenProfile();
        }

      }

    }

  };


  return (

    <div
      className={`fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto border-t backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? 'bg-black/90 border-zinc-800/80 text-white'
          : 'bg-white/90 border-zinc-200 text-black shadow-lg'
      }`}
    >

      <div className="flex items-center justify-around h-16 px-4">

        {items.map((item) => {

          const Icon =
            item.icon;

          const isActive =
            activeTab === item.id;


          return (

            <button
              key={item.id}
              type="button"
              onClick={() =>
                handleNavigation(
                  item.id
                )
              }
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                isActive
                  ? isDark
                    ? 'text-white'
                    : 'text-black font-bold'
                  : isDark
                    ? 'text-zinc-500 hover:text-zinc-300'
                    : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >

              <div
                className={`relative p-1 rounded-xl transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-zinc-900 border border-zinc-700 shadow-sm'
                      : 'bg-zinc-100 border border-zinc-300'
                    : ''
                }`}
              >

                <Icon className="w-5 h-5" />

              </div>


              <span className="text-[10px] font-mono tracking-wider">

                {item.label}

              </span>

            </button>

          );

        })}

      </div>

    </div>

  );
}