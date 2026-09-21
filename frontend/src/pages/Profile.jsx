import React, { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ fullName: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)
  const [passwordMessage, setPasswordMessage] = useState(null)

  useEffect(() => {
    axiosClient.get('/users/me').then((res) => {
      setProfile(res.data)
      setForm({ fullName: res.data.fullName, phone: res.data.phone || '' })
    })
  }, [])

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMessage(null)
    try {
      const { data } = await axiosClient.put('/users/me', form)
      setProfile(data)
      if (setUser) setUser((prev) => ({ ...prev, fullName: data.fullName }))
      setProfileMessage({ type: 'success', text: 'Profile updated.' })
    } catch (err) {
      setProfileMessage({ type: 'error', text: err?.response?.data?.message || 'Could not update profile.' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordMessage(null)
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    setSavingPassword(true)
    try {
      await axiosClient.put('/users/me/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' })
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err?.response?.data?.message || 'Could not change password.' })
    } finally {
      setSavingPassword(false)
    }
  }

  if (!profile) return <div className="max-w-lg mx-auto px-4 py-16 text-center text-ink/50">Loading profile…</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink mb-1">My profile</h1>
        <p className="text-ink/60 text-sm">{profile.role === 'ROLE_ADMIN' ? 'Administrator account' : 'Patient account'}</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="bg-white border border-primary-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-semibold">Personal details</h2>

        {profileMessage && (
          <div className={`text-sm rounded-lg p-3 border ${profileMessage.type === 'success' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
            {profileMessage.text}
          </div>
        )}

        <div>
          <label className="text-xs text-ink/60 block mb-1">Email (cannot be changed)</label>
          <input disabled value={profile.email} className="w-full border border-primary-100 bg-primary-50/50 rounded-lg px-3 py-2 text-sm text-ink/50" />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Full name</label>
          <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button disabled={savingProfile} type="submit" className="w-full bg-primary-500 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-600 disabled:opacity-60">
          {savingProfile ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="bg-white border border-primary-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-semibold">Change password</h2>

        {passwordMessage && (
          <div className={`text-sm rounded-lg p-3 border ${passwordMessage.type === 'success' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
            {passwordMessage.text}
          </div>
        )}

        <div>
          <label className="text-xs text-ink/60 block mb-1">Current password</label>
          <input required type="password" value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">New password (min. 8 characters)</label>
          <input required minLength={8} type="password" value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink/60 block mb-1">Confirm new password</label>
          <input required type="password" value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full border border-primary-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button disabled={savingPassword} type="submit" className="w-full border border-primary-500 text-primary-500 font-semibold py-2.5 rounded-lg hover:bg-primary-50 disabled:opacity-60">
          {savingPassword ? 'Updating…' : 'Change password'}
        </button>
      </form>
    </div>
  )
}
