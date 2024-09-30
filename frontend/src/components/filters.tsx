"use client"

import { useState, useEffect } from 'react'
import { ChevronDownIcon, SearchIcon, FilterIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'

type FilterKey =
  | 'minPrice'
  | 'maxPrice'
  | 'createdAtStart'
  | 'createdAtEnd'
  | 'publishedAtStart'
  | 'publishedAtEnd'
  | 'updatedAtStart'
  | 'updatedAtEnd'
  | 'status'
  | 'text';

type SortKey = 'createdAt' | 'publishedAt' | 'updatedAt' | 'price_range.min' | 'price_range.max';

type Filters = {
  [key in FilterKey]?: string
}

type Sorts = {
  [key in SortKey]?: 'asc' | 'desc'
}

const availableSorts: { label: string, key: SortKey }[] = [
  {
    label: 'Data de criação',
    key: 'createdAt'
  },
  {
    label: 'Data de publicação',
    key: 'publishedAt'
  },
  {
    label: 'Data de atualização',
    key: 'updatedAt'
  },
  {
    label: 'Preço',
    key: 'price_range.min'
  }
]

export default function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({})
  const [sorts, setSorts] = useState<Sorts>({})

  useEffect(() => {
    const newFilters: Filters = {}
    const newSorts: Sorts = {}

    searchParams.forEach((value, key) => {
      if (key.startsWith('filter[')) {
        const filterKey = key.slice(7, -1) as FilterKey
        newFilters[filterKey] = value
      } else if (key.startsWith('sort[')) {
        const sortKey = key.slice(5, -1) as SortKey
        newSorts[sortKey] = value as 'asc' | 'desc'
      }
    })

    setFilters(newFilters)
    setSorts(newSorts)
  }, [searchParams])

  const updateQueryParams = () => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(`filter[${key}]`, value)
    })

    Object.entries(sorts).forEach(([key, value]) => {
      if (value) params.append(`sort[${key}]`, value)
    })

    setShowFilters(false)

    router.push(`?${params.toString()}`)
  }

  const handleFilterChange = (key: FilterKey, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSortChange = (key: SortKey) => {
    setSorts(prev => {
      const currentValue = prev[key]
      if (!currentValue) return { ...prev, [key]: 'asc' }
      if (currentValue === 'asc') return { ...prev, [key]: 'desc' }
      return { ...prev, [key]: undefined }
    })
  }

  const clearFilters = () => {
    setFilters({})
    setSorts({})
    router.push('/')
  }

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-10 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="mt-4 flex">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Pesquise termos, produtos, palavras-chave etc"
                className="bg-secondary rounded-full px-6 py-3 w-full pr-16 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                value={filters['text'] || ''}
                onChange={(e) => handleFilterChange('text', e.target.value)}
              />
              <button
                className="absolute right-1 top-1 bottom-1 bg-primary px-4 rounded-full flex items-center justify-center hover:bg-primary/90 transition-all duration-300"
                onClick={updateQueryParams}
              >
                <SearchIcon className="w-5 h-5 stroke-white" />
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-2 bg-secondary px-4 rounded-full flex items-center justify-center hover:bg-secondary/80 transition-all duration-300"
            >
              <FilterIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Filtros</h2>
              <button
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground flex items-center bg-secondary px-4 py-2 rounded-full"
              >
                Limpar filtros
                <XIcon className="ml-2 w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Preço Mínimo', key: 'minPrice' },
                { label: 'Preço Máximo', key: 'maxPrice' },
                { label: 'Criado De', key: 'createdAtStart' },
                { label: 'Criado Até', key: 'createdAtEnd' },
                { label: 'Publicado De', key: 'publishedAtStart' },
                { label: 'Publicado Até', key: 'publishedAtEnd' },
                { label: 'Atualizado De', key: 'updatedAtStart' },
                { label: 'Atualizado Até', key: 'updatedAtEnd' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-2">{label}</label>
                  <input
                    type={key.includes('Price') ? 'number' : 'date'}
                    value={filters[key as FilterKey] || ''}
                    onChange={(e) => handleFilterChange(key as FilterKey, e.target.value)}
                    className="bg-secondary rounded-full px-4 py-2 w-full"
                  />
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Status</label>
              <div className="relative">
                <select
                  className="bg-secondary rounded-full px-4 py-2 w-full appearance-none"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="PUBLISHED" selected>Publicado</option>
                  <option value="DELETED">Excluído</option>
                </select>
                <ChevronDownIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Ordenação</h3>
              <div className="flex flex-wrap gap-2">
                {availableSorts.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleSortChange(key)}
                    className={`px-4 py-2 rounded-full flex items-center ${sorts[key] ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                      }`}
                  >
                    {label}
                    {sorts[key] === 'asc' && <ArrowUpIcon className="ml-2 w-4 h-4" />}
                    {sorts[key] === 'desc' && <ArrowDownIcon className="ml-2 w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-full w-full flex items-center justify-center transition duration-300 ease-in-out"
              onClick={updateQueryParams}
            >
              <FilterIcon className="mr-2 w-5 h-5" />
              Aplicar filtros e ordenação
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}