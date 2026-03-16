'use client'

import { useState, useEffect } from 'react'
import { useClerk, useUser } from '@clerk/nextjs'

const durations = [30, 45, 60] as const

export default function SettingsPage() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const [defaultDuration, setDefaultDuration] = useState<30 | 45 | 60>(45)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.defaultDuration) {
          setDefaultDuration(data.defaultDuration)
        }
      })
      .catch(() => {})
  }, [])

  async function updateDuration(d: 30 | 45 | 60) {
    setDefaultDuration(d)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultDuration: d }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="px-5 pt-14">
      <h1 className="mb-8 text-[28px] font-bold">Settings</h1>

      {/* Default Duration */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-400">
          Default Duration
        </h2>
        <div className="flex gap-3">
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => updateDuration(d)}
              className={`h-[44px] rounded-lg px-6 text-base font-semibold transition-colors active:opacity-70 ${
                defaultDuration === d
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-500'
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
        {saved && (
          <p className="mt-2 text-sm font-medium text-green-600">Saved!</p>
        )}
      </div>

      {/* Account */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-400">
          Account
        </h2>
        {user && (
          <p className="mb-3 text-sm text-gray-600">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        )}
        <button
          onClick={() => signOut()}
          className="h-[44px] rounded-lg border border-red-500 px-6 text-base font-semibold text-red-500 transition-opacity active:opacity-70"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
