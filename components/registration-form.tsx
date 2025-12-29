"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type FormConfig = {
  subscribe_form?: Record<string, unknown>
  detailed_registration_form?: Record<string, unknown>
  demo_request_form?: Record<string, unknown>
}

interface RegistrationFormProps {
  campaignId: string
  campaignTitle: string
  campaignUrl: string
  formConfig?: FormConfig
}

export default function RegistrationForm({ campaignId, campaignTitle, campaignUrl, formConfig }: RegistrationFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Determine which form type to render
  const formType = formConfig?.subscribe_form 
    ? 'subscribe' 
    : formConfig?.detailed_registration_form 
    ? 'detailed' 
    : formConfig?.demo_request_form 
    ? 'demo' 
    : 'subscribe' // default

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          campaignId,
          campaignTitle,
          campaignUrl,
          formType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form')
      }

      toast({
        title: "Registration Successful!",
        description: "Check your email for the next steps.",
      })

      setFormData({})
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render subscribe form (simple: name + email)
  if (formType === 'subscribe') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {isSubmitting ? "Registering..." : "Get Instant Access"}
        </Button>

        <p className="text-sm text-muted-foreground">
          By registering, you agree to receive updates and communications. You can unsubscribe at any time.
        </p>
      </form>
    )
  }

  // Render detailed registration form
  if (formType === 'detailed') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
              First Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-card-foreground">
              Last Name *
            </Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Doe"
              value={formData.last_name || ''}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
            Work Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@company.com"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-card-foreground">
              Company Name *
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Corp"
              value={formData.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title" className="text-sm font-medium text-card-foreground">
              Job Title *
            </Label>
            <Input
              id="job_title"
              type="text"
              placeholder="Sales Manager"
              value={formData.job_title || ''}
              onChange={(e) => handleInputChange('job_title', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-card-foreground">
              Contact No.
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_size" className="text-sm font-medium text-card-foreground">
              Company Size *
            </Label>
            <Select
              value={formData.company_size || ''}
              onValueChange={(value) => handleInputChange('company_size', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {isSubmitting ? "Submitting..." : "Download Playbook"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Your information will be kept confidential and used only to deliver your requested content.
        </p>
      </form>
    )
  }

  // Render demo request form (most comprehensive)
  if (formType === 'demo') {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
            Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@company.com"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-card-foreground">
              Company *
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="Acme Corp"
              value={formData.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title" className="text-sm font-medium text-card-foreground">
              Job Title *
            </Label>
            <Input
              id="job_title"
              type="text"
              placeholder="VP of Engineering"
              value={formData.job_title || ''}
              onChange={(e) => handleInputChange('job_title', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-card-foreground">
              Phone *
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_size" className="text-sm font-medium text-card-foreground">
              Company Size *
            </Label>
            <Select
              value={formData.company_size || ''}
              onValueChange={(value) => handleInputChange('company_size', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="501-1000">501-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-sm font-medium text-card-foreground">
              Industry *
            </Label>
            <Select
              value={formData.industry || ''}
              onValueChange={(value) => handleInputChange('industry', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline" className="text-sm font-medium text-card-foreground">
              Implementation Timeline *
            </Label>
            <Select
              value={formData.timeline || ''}
              onValueChange={(value) => handleInputChange('timeline', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (0-30 days)</SelectItem>
                <SelectItem value="1-3months">1-3 months</SelectItem>
                <SelectItem value="3-6months">3-6 months</SelectItem>
                <SelectItem value="6+months">6+ months</SelectItem>
                <SelectItem value="exploring">Just exploring</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="use_case" className="text-sm font-medium text-card-foreground">
            Primary Use Case *
          </Label>
          <Input
            id="use_case"
            type="text"
            placeholder="e.g., Content management, Marketing automation"
            value={formData.use_case || ''}
            onChange={(e) => handleInputChange('use_case', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_notes" className="text-sm font-medium text-card-foreground">
            Tell Us About Your Needs
          </Label>
          <Textarea
            id="additional_notes"
            placeholder="Share any specific requirements, challenges, or questions you'd like us to address during the demo..."
            value={formData.additional_notes || ''}
            onChange={(e) => handleInputChange('additional_notes', e.target.value)}
            rows={4}
            className="w-full resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {isSubmitting ? "Submitting Request..." : "Request Demo"}
        </Button>

        <p className="text-sm text-muted-foreground">
          We'll review your request and reach out within 24 hours to schedule your personalized demo.
        </p>
      </form>
    )
  }

  // Default fallback
  return null
}
