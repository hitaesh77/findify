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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
}
  from '@/components/ui/dialog'
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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [openAdd, setOpenAdd] = useState(false)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    company_name: '',
    career_url: '',
    job_class: '',
    location_class: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDeleteCompany = async (companyId: number) => {
    console.log(companies)
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/companies/${companyId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setCompanies(prev => prev.filter(c => c.id !== companyId))
      } else {
        console.error('Failed to delete company')
      }
    } catch (error) {
      console.error('Error deleting company:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      company_name: company.company_name,
      career_url: company.career_url,
      job_class: company.job_class,
      location_class: company.location_class
    })
    setOpenUpdate(true)
  }

  const handleUpdateCompany = async (companyId: number, updatedData: Partial<Company>) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })
      if (response.ok) {
        const updatedCompany = await response.json()
        setCompanies(prev =>
          prev.map(c =>
            c.id === companyId
              ? { ...updatedCompany, id: updatedCompany.company_id }
              : c
          )
        )
      } else {
        console.error('Failed to update company')
      }
    } catch (error) {
      console.error('Error updating company:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCompany) return
    await handleUpdateCompany(editingCompany.id, formData)
    setOpenUpdate(false)
    setEditingCompany(null)
    setFormData({
      company_name: '',
      career_url: '',
      job_class: '',
      location_class: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newCompany = await response.json()
        // Add the new company to the list
        setCompanies(prev => [
          ...prev,
          {
            ...newCompany,
            id: newCompany.company_id,
          },
        ])

        // Reset form and close dialog
        setFormData({
          company_name: '',
          career_url: '',
          job_class: '',
          location_class: ''
        })
        setOpenAdd(false)
      } else {
        console.error('Failed to create company')
        // You could add error handling here (toast notification, etc.)
      }
    } catch (error) {
      console.error('Error creating company:', error)
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Companies</h1>
          <p className="text-gray-600">Manage tracked companies and career pages</p>
        </div>

        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          {/* <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8"> */}
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>New Company</DialogTitle>
                <DialogDescription>
                  Add a new company to scrape
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 mt-3">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  placeholder="Company Name"
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3 mt-3">
                <Label>Career Url</Label>
                <Input
                  placeholder="https://company.com/careers"
                  id="career_url"
                  value={formData.career_url}
                  onChange={(e) => handleInputChange('career_url', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3 mt-3">
                <Label>Job Class</Label>
                <Input
                  placeholder="hrt-card-title"
                  id="job_class"
                  value={formData.job_class}
                  onChange={(e) => handleInputChange('job_class', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3 mt-3">
                <Label>Location Class</Label>
                <Input
                  placeholder="job-location-name"
                  id="location_class"
                  value={formData.location_class}
                  onChange={(e) => handleInputChange('location_class', e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="mt-3">
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Company'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={openUpdate} onOpenChange={(open) => {
          setOpenUpdate(open)
          if (!open) {
            setEditingCompany(null)
            setFormData({
              company_name: '',
              career_url: '',
              job_class: '',
              location_class: ''
            })
          }
        }}>
          <DialogContent className="max-w-2xl w-full">
            <form onSubmit={handleUpdateSubmit}>
              <DialogHeader>
                <DialogTitle>Update Company</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 mt-3">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  placeholder="Company Name"
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3 mt-3">
                <Label>Career Url</Label>
                <Input
                  placeholder="https://company.com/careers"
                  id="career_url"
                  value={formData.career_url}
                  onChange={(e) => handleInputChange('career_url', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3 mt-3">
                <Label>Job Class</Label>
                <Input
                  placeholder="hrt-card-title"
                  id="job_class"
                  value={formData.job_class}
                  onChange={(e) => handleInputChange('job_class', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3 mt-3">
                <Label>Location Class</Label>
                <Input
                  placeholder="job-location-name"
                  id="location_class"
                  value={formData.location_class}
                  onChange={(e) => handleInputChange('location_class', e.target.value)}
                  required
                />
              </div>
              <DialogFooter className="mt-3">
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Company'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <Card>
        <CardContent className="p-0">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 font-semibold text-gray-900">Company</TableHead>
                <TableHead className="w-64 font-semibold text-gray-900">Career Page URL</TableHead>
                <TableHead className="w-16 font-semibold text-gray-900">Status</TableHead>
                <TableHead className="w-32 font-semibold text-gray-900">Job Class</TableHead>
                <TableHead className="w-16 font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id ?? company.company_name}>
                  <TableCell className="font-medium text-gray-900 break-words whitespace-normal">{company.company_name}</TableCell>
                  <TableCell className="font-mono text-sm text-gray-600 break-words whitespace-normal">
                    {company.career_url}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 break-words whitespace-normal">{company.job_class}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(company)} className="cursor-pointer">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCompany(company.id)} className="cursor-pointer">
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
