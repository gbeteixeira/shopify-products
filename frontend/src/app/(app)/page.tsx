"use client"

import { useUrlParams } from '../../hooks/use-url-params'
import ProductList from '@/components/product-list'

export default function Page() {
  const searchParams = useUrlParams();

  return (
    <ProductList
      key={searchParams as any}
      searchParams={searchParams}
    />
  )
}