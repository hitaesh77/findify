'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Briefcase, BookmarkCheck, Bookmark, ExternalLink, Filter } from 'lucide-react'

type Internship = {
  id: number
  company: string
  title: string
  location: string
  type: string
  status: string
  saved: boolean
  url: string
  dateFound: string // ISO string
}

export default function InternshipsPage() {
  const [internshipsList, setInternshipsList] = useState<Internship[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Example: Fetch internships from API (replace with your endpoint)
  useEffect(() => {
    fetch('http://localhost:8000/internships')
      .then((res) => res.json())
      .then((data) => {
        // If the response is an array
        if (Array.isArray(data)) {
          setInternshipsList(data)
        }
        // If the response is an object with an internships array
        else if (Array.isArray(data.internships)) {
          setInternshipsList(data.internships)
        }
        // Fallback to empty array
        else {
          setInternshipsList([])
        }
      })
      .catch((error) => {
      })
  }, [])

  // Filtering logic
  const filteredInternships = internshipsList.filter((internship) => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || internship.status === statusFilter
    const matchesCompany = companyFilter === "all" || internship.company === companyFilter
    const matchesType = typeFilter === "all" || internship.type === typeFilter

    return matchesSearch && matchesStatus && matchesCompany && matchesType
  })

  // Handlers for status and save
  const updateInternshipStatus = (id: number, status: string) => {
    setInternshipsList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    )
  }

  const toggleSaveInternship = (id: number) => {
    setInternshipsList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i))
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Internships</h1>
          <p className="text-gray-600">Browse and manage discovered internship opportunities</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {filteredInternships.length} results
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search internships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {Array.from(new Set(internshipsList.map((i) => i.company))).map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="On-site">On-site</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Internships Table */}
      <Card className="border border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="font-semibold text-gray-900">Company</TableHead>
                <TableHead className="font-semibold text-gray-900">Position</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Found</TableHead>
                <TableHead className="font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInternships.map((internship) => (
                <TableRow key={internship.id} className="border-gray-200">
                  <TableCell className="font-medium text-gray-900">{internship.company}</TableCell>
                  <TableCell className="text-gray-900">{internship.title}</TableCell>
                  <TableCell className="text-gray-600">{internship.location}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{internship.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={internship.status}
                      onValueChange={(value) => updateInternshipStatus(internship.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {new Date(internship.dateFound).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveInternship(internship.id)}
                        className={internship.saved ? "text-blue-600" : "text-gray-400"}
                      >
                        {internship.saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => window.open(internship.url, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredInternships.length === 0 && (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">Try adjusting your filters or run the scraper to find new opportunities.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}