'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Edit, Play, Trash2, Plus } from 'lucide-react'
import { DialogTrigger } from '@radix-ui/react-dialog'

type Company = {
    id: number
    company_name: string
    career_url: string
    job_class: string
    location_class: string
}

export default function RunPage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [selectedCompany, setSelectedCompany] = useState<string>('all')
    const [loading, setLoading] = useState(false)

    const handleRunScraper = async () => {
        setLoading(true)
        try {
            const response = await fetch('http://localhost:8000/run-scraper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedCompany)
            })
            const data = await response.json()
            toast.success(data.message)
        } catch (error) {
            toast.error("Error", {
                description: "Failed to run scraper."
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetch('http://localhost:8000/companies')
            .then((res) => res.json())
            .then((data) =>
                setCompanies(
                    data.map((item: any) => ({
                        id: item.company_id,
                        company_name: item.company_name,
                        career_url: item.career_url,
                        job_class: item.job_class,
                        location_class: item.location_class,
                    }))
                ))
            .catch((error) => console.error('Fetch error:', error))
    }, [])

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <Toaster />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Run</h1>
                    <p className="text-gray-600">Execute scraping operations manually</p>
                </div>
            </div>

            <Card className="gap-4">
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="max-w-xs flex flex-col gap-2">
                        <Label className="text-sm font-medium text-gray-700 mb-1">Target Company</Label>
                        <div className="flex flex-row gap-2">
                            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Companies</SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.company_name}>
                                            {company.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                disabled={loading}
                                onClick={() => handleRunScraper()}
                                className="cursor-pointer"
                            >
                                <Play className="mr-2 h-4 w-4" />
                                {loading ? "Running..." : "Run Scraper"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
