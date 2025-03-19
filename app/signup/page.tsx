"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Code, Loader2 } from "lucide-react"
import { createUserAccount } from "@/lib/auth"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    adminCode: "",
    agreeToTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [adminCodeSent, setAdminCodeSent] = useState(false)
  const [error, setError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear password error when user types in password fields
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("")
    }
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
    if (value === "admin" && !adminCodeSent) {
      // In a real app, this would send an email with the admin code
      setAdminCodeSent(true)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeToTerms: checked }))
  }

  const validateForm = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match")
      return false
    }

    // Check if password is strong enough
    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return false
    }

    // Check if terms are agreed to
    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setPasswordError("")

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // In a real app, this would validate the admin code if role is admin
      if (formData.role === "admin" && formData.adminCode !== "123456") {
        throw new Error("Invalid admin code")
      }

      await createUserAccount(formData)
      router.push("/login?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Code className="h-6 w-6" />
              <span>CodeMasters</span>
            </Link>
            <ThemeToggle />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to register for CodeMasters</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword || ""}
                onChange={handleChange}
              />
              {passwordError && <p className="text-sm font-medium text-destructive">{passwordError}</p>}
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <RadioGroup value={formData.role} onValueChange={handleRoleChange} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user">User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>
            {formData.role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="adminCode">Admin Verification Code</Label>
                <Input
                  id="adminCode"
                  name="adminCode"
                  placeholder="Enter 6-digit code sent to your email"
                  required={formData.role === "admin"}
                  value={formData.adminCode}
                  onChange={handleChange}
                />
                {adminCodeSent && (
                  <p className="text-xs text-muted-foreground">
                    A verification code has been sent to your email. Please check and enter it above.
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms || false}
                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary underline">
                  terms and conditions
                </Link>
              </label>
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

