"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
    User,
    Mail,
    ShieldCheck,
    CalendarDays,
    Save,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Loader2,
    LockKeyhole,
    ArrowLeft,
} from "lucide-react";

import {
    getProfile,
    updateProfile,
    changePassword,
    type UserProfile,
} from "@/lib/settings";

export default function SettingsPage() {
    const router = useRouter();

    const [user, setUser] = useState<UserProfile | null>(null);

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            try {
                const profile = await getProfile();

                if (!active) return;

                setUser(profile);
                setName(profile.name);
                setEmail(profile.email);
            } catch (err) {
                if (!active) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load profile"
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    const handleProfileUpdate = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setProfileMessage("");
        setPasswordMessage("");

        if (name.trim().length < 2) {
            setError("Name must contain at least 2 characters.");
            return;
        }

        if (name.trim().length > 60) {
            setError("Name cannot exceed 60 characters.");
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        try {
            setSavingProfile(true);

            const updatedUser = await updateProfile({
                name: name.trim(),
                email: email.trim(),
            });

            setUser(updatedUser);
            setName(updatedUser.name);
            setEmail(updatedUser.email);

            setProfileMessage(
                "Profile updated successfully."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update profile"
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordUpdate = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setProfileMessage("");
        setPasswordMessage("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Please fill in all password fields.");
            return;
        }

        if (newPassword.length < 8) {
            setError(
                "New password must contain at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword === currentPassword) {
            setError(
                "New password must be different from current password."
            );
            return;
        }

        try {
            setSavingPassword(true);

            await changePassword({
                currentPassword,
                newPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setPasswordMessage(
                "Password changed successfully."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to change password"
            );
        } finally {
            setSavingPassword(false);
        }
    };

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "Not available";

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
                <Loader2
                    className="animate-spin text-indigo-600 mr-3"
                    size={24}
                />
                <span className="text-slate-600">
                    Loading settings...
                </span>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f7f8fc] text-slate-800">
            <div className="mx-auto max-w-6xl p-5 sm:p-8">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
                    >
                        <ArrowLeft size={17} />
                        Back to Dashboard
                    </button>

                    <p className="text-sm font-semibold text-indigo-600">
                        ACCOUNT MANAGEMENT
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Settings
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Manage your profile and account security.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle size={19} />
                        {error}
                    </div>
                )}

                {/* Success */}
                {profileMessage && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        <CheckCircle2 size={19} />
                        {profileMessage}
                    </div>
                )}

                {passwordMessage && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                        <CheckCircle2 size={19} />
                        {passwordMessage}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Account information */}
                    <section className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                            <User size={27} />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">
                            {user?.name}
                        </h2>

                        <p className="mt-1 break-all text-sm text-slate-500">
                            {user?.email}
                        </p>

                        <div className="mt-7 space-y-5">

                            <InfoItem
                                icon={<ShieldCheck size={19} />}
                                label="Account role"
                                value={user?.role || "User"}
                            />

                            <InfoItem
                                icon={<CheckCircle2 size={19} />}
                                label="Account status"
                                value={
                                    user?.isActive
                                        ? "Active"
                                        : "Inactive"
                                }
                            />

                            <InfoItem
                                icon={<CalendarDays size={19} />}
                                label="Joined on"
                                value={joinedDate}
                            />

                        </div>
                    </section>

                    <div className="space-y-6 lg:col-span-2">

                        {/* Profile */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                    <User size={21} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Profile information
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Update your personal information.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handleProfileUpdate}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Full name
                                    </label>

                                    <div className="relative">
                                        <User
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            minLength={2}
                                            maxLength={60}
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Email address
                                    </label>

                                    <div className="relative">
                                        <Mail
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:bg-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {savingProfile ? (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Save size={17} />
                                    )}

                                    {savingProfile
                                        ? "Saving..."
                                        : "Save changes"}
                                </button>
                            </form>
                        </section>

                        {/* Password */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                                    <LockKeyhole size={21} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Change password
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Protect your TaskFlow account.
                                    </p>
                                </div>
                            </div>

                            <form
                                onSubmit={handlePasswordUpdate}
                                className="space-y-5"
                            >
                                <PasswordField
                                    label="Current password"
                                    value={currentPassword}
                                    onChange={setCurrentPassword}
                                    visible={showCurrent}
                                    toggle={() =>
                                        setShowCurrent(!showCurrent)
                                    }
                                />

                                <PasswordField
                                    label="New password"
                                    value={newPassword}
                                    onChange={setNewPassword}
                                    visible={showNew}
                                    toggle={() =>
                                        setShowNew(!showNew)
                                    }
                                />

                                <PasswordField
                                    label="Confirm new password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    visible={showConfirm}
                                    toggle={() =>
                                        setShowConfirm(!showConfirm)
                                    }
                                />

                                <p className="text-xs text-slate-500">
                                    Password must contain at least 8 characters.
                                </p>

                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                                >
                                    {savingPassword ? (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <ShieldCheck size={17} />
                                    )}

                                    {savingPassword
                                        ? "Updating..."
                                        : "Update password"}
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-indigo-600">{icon}</div>

            <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-semibold capitalize text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    );
}

function PasswordField({
    label,
    value,
    onChange,
    visible,
    toggle,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    visible: boolean;
    toggle: () => void;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className="relative">
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none focus:border-purple-500 focus:bg-white"
                    placeholder={label}
                />

                <button
                    type="button"
                    onClick={toggle}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                    {visible ? (
                        <EyeOff size={19} />
                    ) : (
                        <Eye size={19} />
                    )}
                </button>
            </div>
        </div>
    );
}