import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Cpu, LayoutDashboard, Upload, History, Zap } from 'lucide-react'
import { cn } from './ui/cn.js'

const links = [
  { to: '/',        label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload',  label: 'Analyze',   icon: Upload },
  { to: '/history', label: 'History',   icon: History },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16">
      <div className="absolute inset-0 bg-surface-900/80 backdrop-blur-xl border-b border-white/5" />
      <nav className="relative max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center
                          shadow-lg shadow-brand-500/30 group-hover:shadow-brand-400/40
                          transition-shadow duration-200">
            <Cpu className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            ATS<span className="text-brand-400">Ranker</span>
          </span>
        </NavLink>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <NavLink key={to} to={to}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-medium transition-all duration-200',
                    active
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </motion.div>
              </NavLink>
            )
          })}
        </div>

        {/* CTA */}
        <NavLink to="/upload">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            <Zap size={14} />
            New Analysis
          </motion.button>
        </NavLink>
      </nav>
    </header>
  )
}
