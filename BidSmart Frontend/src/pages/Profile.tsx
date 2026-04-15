import { useState, useEffect, useRef, useCallback } from 'react';
import { MdOutlinePerson as User, MdOutlineEmail as Mail, MdOutlineLock as Lock, MdOutlineNotifications as Bell, MdOutlineSecurity as Shield, MdOutlineCameraAlt as Camera, MdOutlineSave as Save, MdOutlineVisibility as Eye, MdOutlineVisibilityOff as EyeOff } from 'react-icons/md';
import { useApp } from '@/context/AppContext';
import { userApi, type ApiNotifPrefs, type ApiUserProfile } from '@/lib/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const defaultPrefs: ApiNotifPrefs = {
  emailBids: true,
  emailAuctions: true,
  emailNewsletter: false,
  pushBids: true,
  pushEnding: true,
};

const Profile = () => {
  const { currentUser, currentRole, updateCurrentUser } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState<ApiNotifPrefs>(defaultPrefs);
  const [savedPrefs, setSavedPrefs] = useState<ApiNotifPrefs>(defaultPrefs);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingNotifs, setSavingNotifs] = useState(false);

  // Dirty state detection for unsaved notification changes
  const notifsDirty = JSON.stringify(notifPrefs) !== JSON.stringify(savedPrefs);

  // Warn on page unload if unsaved notification prefs
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (notifsDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [notifsDirty]);

  // Load profile and notification preferences from backend
  useEffect(() => {
    userApi.getProfile()
      .then(profile => {
        setName(profile.fullName || '');
        setEmail(profile.email || '');
        setPhone(profile.phone || '');
        setBio(profile.bio || '');
        setLocation(profile.location || '');
      })
      .catch(() => {});
    userApi.getNotifPrefs()
      .then(prefs => {
        setNotifPrefs(prefs);
        setSavedPrefs(prefs);
      })
      .catch(() => {})
      .finally(() => setLoadingPrefs(false));
  }, []);

  if (currentRole === 'guest') {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground text-base">Log in or register to manage your account settings.</p>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    if (!email.trim()) {
      toast.error('Email cannot be empty.');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
      });
      updateCurrentUser({ name: res.fullName, email: res.email });
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const updateNotifPref = useCallback((key: keyof ApiNotifPrefs, value: boolean) => {
    if (savingNotifs) return; // Prevent toggling while saving
    setNotifPrefs(prev => ({ ...prev, [key]: value }));
  }, [savingNotifs]);

  const handleSaveNotifications = async () => {
    setSavingNotifs(true);
    const rollback = { ...notifPrefs }; // snapshot for rollback
    try {
      const saved = await userApi.updateNotifPrefs(notifPrefs);
      setNotifPrefs(saved);
      setSavedPrefs(saved); // mark as clean
      toast.success('Notification preferences saved!');
    } catch (err: any) {
      // Rollback to last saved state on failure
      setNotifPrefs(savedPrefs);
      toast.error(err?.message || 'Failed to save notification preferences.');
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleDiscardNotifChanges = () => {
    setNotifPrefs(savedPrefs);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header with avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <Avatar className="h-20 w-20 text-3xl">
              <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                {currentUser?.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <button className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-5 w-5 text-foreground" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{currentUser?.name}</h1>
            <p className="text-muted-foreground text-base">
              {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} · Member since {currentUser?.joinDate ? new Date(currentUser.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 w-full justify-start">
            <TabsTrigger value="general" className="gap-1.5"><User className="h-3.5 w-3.5" /> General</TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5"><Lock className="h-3.5 w-3.5" /> Security</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update your profile details and public information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. New York, NY" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us a bit about yourself..." />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={savingProfile} className="gradient-gold text-primary-foreground gap-1.5">
                    <Save className="h-4 w-4" /> {savingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-pw">Current Password</Label>
                    <div className="relative">
                      <Input id="current-pw" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-pw">New Password</Label>
                      <div className="relative">
                        <Input id="new-pw" type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-pw">Confirm Password</Label>
                      <Input id="confirm-pw" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleChangePassword} disabled={savingPassword} variant="outline" className="gap-1.5">
                      <Lock className="h-4 w-4" /> {savingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                  <CardDescription>Add an extra layer of security to your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-muted p-2">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-base font-medium">Authenticator App</p>
                        <p className="text-sm text-muted-foreground">Coming soon</p>
                      </div>
                    </div>
                    <Switch checked={false} disabled />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Notification Preferences</CardTitle>
                    <CardDescription>Choose how and when you want to be notified.</CardDescription>
                  </div>
                  {notifsDirty && (
                    <span className="text-xs font-medium text-warning bg-warning/10 border border-warning/20 rounded-full px-2.5 py-1">
                      Unsaved changes
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingPrefs ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted rounded" />
                          <div className="h-3 w-56 bg-muted rounded" />
                        </div>
                        <div className="h-6 w-11 bg-muted rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-base font-semibold mb-3">Email Notifications</h4>
                      <div className="space-y-4">
                        {([
                          { key: 'emailBids' as const, label: 'Bid Updates', desc: "When you're outbid or win an auction" },
                          { key: 'emailAuctions' as const, label: 'Auction Alerts', desc: 'Watchlist items ending soon or new listings' },
                          { key: 'emailNewsletter' as const, label: 'Newsletter', desc: 'Weekly digest with featured auctions and tips' },
                        ]).map(item => (
                          <div key={item.key} className="flex items-center justify-between">
                            <Label htmlFor={`switch-${item.key}`} className="flex-1 cursor-pointer">
                              <p className="text-base font-medium">{item.label}</p>
                              <p className="text-sm text-muted-foreground font-normal">{item.desc}</p>
                            </Label>
                            <Switch
                              id={`switch-${item.key}`}
                              checked={notifPrefs[item.key]}
                              onCheckedChange={v => updateNotifPref(item.key, v)}
                              disabled={savingNotifs}
                              aria-label={item.label}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="text-base font-semibold mb-3">Push Notifications</h4>
                      <div className="space-y-4">
                        {([
                          { key: 'pushBids' as const, label: 'Real-time Bids', desc: 'Instant alerts when someone bids on your items' },
                          { key: 'pushEnding' as const, label: 'Ending Soon', desc: 'Reminders for auctions ending within 1 hour' },
                        ]).map(item => (
                          <div key={item.key} className="flex items-center justify-between">
                            <Label htmlFor={`switch-${item.key}`} className="flex-1 cursor-pointer">
                              <p className="text-base font-medium">{item.label}</p>
                              <p className="text-sm text-muted-foreground font-normal">{item.desc}</p>
                            </Label>
                            <Switch
                              id={`switch-${item.key}`}
                              checked={notifPrefs[item.key]}
                              onCheckedChange={v => updateNotifPref(item.key, v)}
                              disabled={savingNotifs}
                              aria-label={item.label}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      {notifsDirty && (
                        <Button variant="ghost" onClick={handleDiscardNotifChanges} disabled={savingNotifs}>
                          Discard
                        </Button>
                      )}
                      <Button onClick={handleSaveNotifications} disabled={savingNotifs || !notifsDirty} className="gradient-gold text-primary-foreground gap-1.5">
                        <Save className="h-4 w-4" /> {savingNotifs ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
