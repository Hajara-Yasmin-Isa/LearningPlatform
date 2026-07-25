'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { getUserProfile } from "@/lib/supabase/profile"
import ProfileForm from "@/components/features/profile/ProfileForm"
import LoadingScreen from '@/components/ui/LoadingScreen'

export default function SettingsPage() {
  const [ profile, setProfile] = useState<{
    name: string
    email: string
    bio: string
  } | null>(null)

  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("") // State to hold the user's email
  const [resetSent, setResetSent] = useState(false)

  const handlePasswordReset = async () => {
  setResetLoading(true);
  setResetError(null);

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  setResetLoading(false);

  if (error) {
    setResetError(error.message);
    return;
  }

  setResetSent(true);
};

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const loadUserProfile = async () => {
        const profileData = await getUserProfile();
        if (profileData) {
          setProfile(profileData);
          setEmail(profileData.email); 
        }
        setLoading(false);
      };
    loadUserProfile();
    });
  }, [router])

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-[80vh] flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>

        <div className="space-y-6">
        {profile && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
    <h2 className="text-base font-semibold text-slate-900 mb-4">
      Profile
    </h2>

    <ProfileForm
      initialName={profile.name}
      initialBio={profile.bio}
      email={profile.email}
    />
  </div>
)}
          {/* Password */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Faswad</h2>
            <p className="text-sm text-slate-500 mb-4">
              Zamu tura hanyar sake saita sabon faswad zuwa <span className="font-medium text-slate-700">{email}</span>.
            </p>

            {resetSent ? (
              <p className="text-sm text-green-600 font-medium">
                An aika hanyar sauyawa — duba imel ɗinka.
              </p>
            ) : (
              <>
                {resetError && <p className="text-sm text-red-500 mb-3">{resetError}</p>}
                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  {resetLoading ? 'Ana aika...' : 'Canza faswad'}
                </button>
              </>
            )}
          </div>

          {/* Account */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Account</h2>
            <p className="text-sm text-slate-500 mb-4">
              Imel ɗin account ɗin ka shine <span className="font-medium text-slate-700">{email}</span>.
              Don neman goge account ɗin ka, tuntuɓe mu a{' '}
              <a href="mailto:contact@littafinfasaha.com" className="text-yellow-600 hover:text-yellow-700">
                contact@littafinfasaha.com
              </a>.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
