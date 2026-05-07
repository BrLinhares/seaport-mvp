import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SidebarContext = createContext({})

const STORAGE_KEY = 'seaport-sidebar-collapsed'
const MOBILE_BREAKPOINT = 768

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= MOBILE_BREAKPOINT)

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (!mobile) setIsMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Bloqueia scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  const openMobile  = useCallback(() => setIsMobileOpen(true),  [])
  const closeMobile = useCallback(() => setIsMobileOpen(false), [])
  const toggleMobile = useCallback(() => setIsMobileOpen(p => !p), [])

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isMobileOpen,
      isMobile,
      toggleCollapse,
      toggleMobile,
      openMobile,
      closeMobile,
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
