"use client"

import React from "react"
import AppHeader from "@/components/AppHeader"
import NotesSidebar from "@/components/NotesSidebar"
import MainArea from "@/components/MainArea"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  return (
    <div className="flex flex-col h-svh">
      <AppHeader
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        showMenuButton={true}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <div
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-[280px] flex-shrink-0`}
        >
          <NotesSidebar />
        </div>
        <div
          className={`flex-1 overflow-hidden ${
            sidebarOpen ? "hidden md:block" : "block"
          }`}
          onClick={() => {
            if (window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false)
          }}
        >
          <MainArea />
        </div>
      </div>
    </div>
  )
}
