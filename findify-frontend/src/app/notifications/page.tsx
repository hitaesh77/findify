'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch';
import { Search, Briefcase, BookmarkCheck, Bookmark, ExternalLink, Filter } from 'lucide-react'

type Internship = {
    id: number
    company: string
    role: string
    saved: boolean
    dateFound: string // ISO string
}

export default function InternshipsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [smsNotifications, setSmsNotifications] = useState(false)

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">Configure alert preferences and destinations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Alert Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium text-gray-900">Email Alerts</Label>
                                <p className="text-sm text-gray-600">Receive email notifications for new internships</p>
                            </div>
                            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium text-gray-900">SMS Alerts</Label>
                                <p className="text-sm text-gray-600">Receive text message notifications</p>
                            </div>
                            <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="user@company.com"
                                    className="mt-2 border-gray-300"
                                    disabled={!emailNotifications}
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                                <Input
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    className="mt-2 border-gray-300"
                                    disabled={!smsNotifications}
                                />
                            </div>
                        </div>

                        <Button variant="outline" className="w-full border-gray-300">
                            Test Notification
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Message Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                                <div className="text-sm font-medium text-gray-900">Email Format</div>
                                <div className="text-sm text-gray-700 mt-2 font-mono">
                                    Subject: New internship detected — Shopify / Backend Intern
                                    <br />
                                    <br />A new internship has been detected:
                                    <br />
                                    Company: Shopify
                                    <br />
                                    Position: Backend Software Engineer Intern
                                    <br />
                                    Location: Toronto, ON
                                    <br />
                                    Posted: 2024-01-15 14:30:22
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                                <div className="text-sm font-medium text-gray-900">SMS Format</div>
                                <div className="text-sm text-gray-700 mt-2 font-mono">
                                    Findify: New internship at Shopify - Backend Software Engineer Intern. View details in dashboard.
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}