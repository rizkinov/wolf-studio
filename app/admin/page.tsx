import type { Metadata } from "next"
import AdminDashboardClient from './dashboard-client'

export const metadata: Metadata = {
  title: "Admin Dashboard - Wolf Studio",
  description: "Wolf Studio Content Management System Dashboard",
}

export default function AdminDashboardPage() {
  return <AdminDashboardClient />
} 