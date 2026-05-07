import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { SidebarProvider } from '../../context/SidebarContext'

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="dashboard-layout">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
