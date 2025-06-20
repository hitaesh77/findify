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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Play, Trash2, Plus } from 'lucide-react'

type Company = {
  id: number
  company_name: string
  career_url: string
  job_class: string
  location_class: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/companies')
      .then((res) => res.json())
      .then((data) => setCompanies(data))
      .catch((error) => console.error('Fetch error:', error))
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Companies</h1>
          <p className="text-gray-600">Manage tracked companies and career pages</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>
      
        <Card>
            <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="font-semibold text-gray-900">Company</TableHead>
                    <TableHead className="font-semibold text-gray-900">Career Page URL</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Job Class</TableHead>
                    <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {companies.map((company) => (
                    <TableRow key={company.id}>
                        <TableCell className="font-medium text-gray-900">{company.company_name}</TableCell>
                        <TableCell className="font-mono text-sm text-gray-600">
                            {company.career_url}
                        </TableCell>
                        <TableCell>
                            <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">{company.job_class}</TableCell>
                        <TableCell>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}
