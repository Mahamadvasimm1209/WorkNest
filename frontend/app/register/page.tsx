
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        // Frontend validation
        if (name.trim().length < 2) {
            setError("Name must contain at least 2 characters.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/v1/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                const errorMessage =
                    result.message ||
                    result.errors?.[0]?.message ||
                    "Registration failed. Please try again.";

                setError(errorMessage);
                return;
            }

            setSuccess(
                "Account created successfully! Redirecting to login..."
            );

            setTimeout(() => {
                router.push("/");
            }, 1200);

        } catch (err) {
            console.error("Registration error:", err);

            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen grid lg:grid-cols-2 bg-white">

            {/* Branding */}
            <section className="hidden lg:flex flex-col justify-between bg-[#17172f] p-12 text-white">

                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7167ff] text-xl font-bold">
                        T
                    </div>

                    <span className="text-2xl font-bold">
                        TaskFlow
                    </span>
                </Link>

                <div className="max-w-lg">
                    <h1 className="text-5xl font-bold leading-tight">
                        Make teamwork feel effortless.
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-slate-300">
                        Create your workspace, organize your projects,
                        and bring your team together with TaskFlow.
                    </p>
                </div>

                <p className="text-sm text-slate-400">
                    © 2026 TaskFlow. Built for better teamwork.
                </p>

            </section>

            {/* Registration form */}
            <section className="flex min-h-screen items-center justify-center px-6 py-12">

                <div className="w-full max-w-md">

                    <Link
                        href="/"
                        className="mb-10 flex items-center gap-3 lg:hidden"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635bff] text-xl font-bold text-white">
                            T
                        </div>

                        <span className="text-2xl font-bold">
                            TaskFlow
                        </span>
                    </Link>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Create your account
                        </h2>

                        <p className="mt-3 text-slate-500">
                            Get started with TaskFlow today.
                        </p>
                    </div>

                    <form
                        className="space-y-5"
                        onSubmit={handleRegister}
                    >

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Full name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Your name"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                                maxLength={60}
                                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="At least 8 characters"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    maxLength={72}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 pr-20 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-indigo-600"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Confirm password
                            </label>

                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 pr-20 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-indigo-600"
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <p
                                role="alert"
                                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                            >
                                {error}
                            </p>
                        )}

                        {/* Success message */}
                        {success && (
                            <p
                                role="status"
                                className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
                            >
                                {success}
                            </p>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-[#635bff] py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}
                        </button>

                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{" "}

                        <Link
                            href="/"
                            className="font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                            Sign in
                        </Link>
                    </p>

                </div>
            </section>
        </main>
    );
}
