'use client'

import { useEffect, useState } from 'react'
import { Building2, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Supplier {
  id: string
  code: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  country: string | null
  payment_terms: string | null
  is_active: boolean
  notes: string | null
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .order('name')

    if (data) setSuppliers(data)
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading suppliers...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500">{suppliers.length} suppliers in network</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(supplier => (
          <div key={supplier.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-dromeas-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-dromeas-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">{supplier.code}</p>
                </div>
              </div>
              <span className={`status-badge ${supplier.is_active ? 'status-success' : 'status-neutral'}`}>
                {supplier.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              {supplier.contact_name && (
                <p className="text-gray-600">{supplier.contact_name}</p>
              )}
              {supplier.email && (
                <div className="flex items-center text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${supplier.email}`} className="hover:text-dromeas-600">{supplier.email}</a>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  {supplier.phone}
                </div>
              )}
              {supplier.website && (
                <div className="flex items-center text-gray-500">
                  <Globe className="h-4 w-4 mr-2" />
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:text-dromeas-600 truncate">
                    {supplier.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {(supplier.city || supplier.country) && (
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {[supplier.city, supplier.country].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            {supplier.payment_terms && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Payment Terms</p>
                <p className="text-sm text-gray-600">{supplier.payment_terms}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
