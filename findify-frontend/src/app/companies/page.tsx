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
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Edit, Trash2, Plus } from 'lucide-react'
import { DialogTrigger } from '@radix-ui/react-dialog'

// --- CODESPACE CONFIGURATION ---
const BACKEND_URL = "https://supreme-giggle-69rjv4vpgvrj34q7x-8000.app.github.dev"

type Company = {
  id: number
  company_name: string
  career_url: string
  job_class: string
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
    job_class: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDeleteCompany = async (companyId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${BACKEND_URL}/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
    })
    setOpenUpdate(true)
  }

  const handleUpdateCompany = async (companyId: number, updatedData: Partial<Company>) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${BACKEND_URL}/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      job_class: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${BACKEND_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newCompany = await response.json()
        setCompanies(prev => [
          ...prev,
          {
            ...newCompany,
            id: newCompany.company_id,
          },
        ])

        setFormData({
          company_name: '',
          career_url: '',
          job_class: ''
        })
        setOpenAdd(false)
      } else {
        console.error('Failed to create company')
      }
    } catch (error) {
      console.error('Error creating company:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch(`${BACKEND_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = '/login'; 
          throw new Error("Unauthorized: Invalid Token");
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setCompanies(
            data.map((item: any) => ({
              id: item.company_id,
              company_name: item.company_name,
              career_url: item.career_url,
              job_class: item.job_class
            }))
          )
        }
      })
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
              job_class: ''
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

      <Card className="h-fit overflow-hidden">
        <CardContent className="p-0">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-32 font-semibold text-gray-900 py-3">Company</TableHead>
                <TableHead className="w-64 font-semibold text-gray-900 py-3">Career Page URL</TableHead>
                <TableHead className="w-24 font-semibold text-gray-900 py-3">Status</TableHead>
                <TableHead className="w-32 font-semibold text-gray-900 py-3">Job Class</TableHead>
                <TableHead className="w-24 font-semibold text-gray-900 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id ?? company.company_name}>
                  <TableCell className="font-medium text-gray-900 break-words whitespace-normal py-3">
                    {company.company_name}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-600 break-words whitespace-normal py-3">
                    {company.career_url}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-transparent shadow-none font-medium">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 break-words whitespace-normal py-3">
                    {company.job_class}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(company)} className="cursor-pointer h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCompany(company.id)} className="cursor-pointer h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
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