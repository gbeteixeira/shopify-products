"use client"

import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import ProductDetail from '@/components/product-detail'
import { api } from '@/lib/api'
import Filters from '@/components/filters'
import { useUrlParams } from '@/hooks/use-url-params'

interface Product {
  id: string
  title: string
  vendor: string
  price_range: {
    min: number
    max: number
    currency: string
  }
  images: Array<{
    id: number
    src: string
    alt: string | null
    width: number
    height: number
  }>
  tags: string
  url: string
  created_at: string
  updated_at: string
  published_at: string
}

interface ApiResponse {
  data: Product[]
  hasMore: boolean 
  limit: number
  page: number 
  total: number
}

const fetchProducts = async ({ pageParam = 1, searchParams }: { pageParam: number,  searchParams: any }) => {
  const { data } = await api.get<ApiResponse>('/products', {
    params: { 
      page: pageParam, 
      ...searchParams
    }
  })
  return data
}

export default function ProductList({ searchParams }: { searchParams: any }) {
  const { ref, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['products', searchParams],
    queryFn: ({ pageParam = 1 }) => fetchProducts({ pageParam, searchParams }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1

      return lastPage.hasMore ? nextPage : undefined
    },
  })

  // Carrega a próxima página quando o último elemento estiver em vista
  if (inView && hasNextPage && !isFetchingNextPage) {
    fetchNextPage()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background shadow-md">
        <div className="container mx-auto py-4">
          <Filters />
        </div>
      </header>

      <main className="container mx-auto py-8">
        {status === 'pending' ? (
          <div className="text-center">Carregando...</div>
        ) : status === 'error' ? (
          <div className="text-center text-red-500">Erro ao carregar produtos</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.pages.map(({ data }) =>
                data.map((product) => (
                  <ProductDetail key={product.id} product={product} />
                ))
              )}
            </div>
            <div ref={ref} className="mt-8 text-center">
              {isFetchingNextPage
                ? 'Carregando mais produtos...'
                : hasNextPage
                ? 'Carregue mais produtos'
                : 'Não há mais produtos para carregar'}
            </div>
          </>
        )}
      </main>
    </div>
  )
}