"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Calendar, Clock, Globe, ChevronLeft, ChevronRight } from "lucide-react"
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'

import relativeTime from 'dayjs/plugin/relativeTime'
require('dayjs/locale/pt-br')

dayjs.extend(relativeTime)
dayjs.locale('pt-br') 

interface ProductImage {
  id: number
  src: string
  alt: string | null
  width: number
  height: number
}

interface ProductProps {
  product: {
    images: ProductImage[]
    price_range: {
      min: number
      max: number
      currency: string
    }
    title: string
    vendor: string
    tags: string
    url: string
    created_at: string
    updated_at: string
    published_at: string
  }
}

function formatDate(date: string) {
  const now = dayjs()
  const dateObj = dayjs(date)
  const diffInMonths = now.diff(dateObj, 'month')

  if (diffInMonths >= 1) {
    return dateObj.format('DD/MM/YYYY')
  } else {
    return now.from(dateObj, true)
  }
}

function formatPrice({ min, max, currency }: ProductProps['product']['price_range']) {
  let currencyFormat = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  });

  if (min === max) {
    return `${currencyFormat.format(min)}`
  }

  return `${currencyFormat.format(min)} - ${currencyFormat.format(max)}`
}

export default function ProductDetail({ product }: ProductProps) {
  const { images, price_range, title, vendor, tags, url, created_at, updated_at, published_at } = product
  const tagList = tags.split(', ').filter(val => val.length > 0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const tagScrollRef = useRef<HTMLDivElement>(null)

  const nextImage = () => {
    setIsImageLoading(true)
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setIsImageLoading(true)
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const handlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    trackMouse: true
  })

  useEffect(() => {
    const scrollContainer = tagScrollRef.current
    if (scrollContainer) {
      let scrollAmount = 0
      const step = 1
      const scrollSpeed = 50

      const scroll = () => {
        scrollContainer.scrollLeft += step
        scrollAmount += Math.abs(step)
        if (scrollAmount >= scrollContainer.scrollWidth) {
          scrollContainer.scrollLeft = 0
          scrollAmount = 0
        }
        scrollContainer.scrollLeft %= scrollContainer.scrollWidth
      }

      const scrollInterval = setInterval(scroll, scrollSpeed)

      return () => clearInterval(scrollInterval)
    }
  }, [])

  return (
    <Card className="w-full overflow-hidden flex flex-col">
      <div className="relative w-full pb-[100%]" {...handlers}>
        <div className="absolute top-2 right-2 z-[1] bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs flex items-center space-x-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>Atualizado: {formatDate(updated_at)}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt || title}
              layout="fill"
              objectFit="contain"
              className="rounded-t-lg"
              onLoadingComplete={() => setIsImageLoading(false)}
            />
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="overflow-x-auto whitespace-nowrap p-2 bg-muted">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setCurrentImageIndex(index)}
              className={`inline-block w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 mr-2 ${
                index === currentImageIndex ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt || `Product image ${index + 1}`}
                width={64}
                height={64}
                objectFit="cover"
                className='w-full h-full'
              />
            </button>
          ))}
        </div>
      <CardContent className="p-6 flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-2">Vendido por: {vendor}</p>
          <p className="text-2xl font-bold">
            {formatPrice(price_range)}
          </p>
        </div>
        <div className="mb-4 overflow-hidden" ref={tagScrollRef}>
          <div className="flex space-x-2 animate-scroll">
            {tagList.concat(tagList).map((tag, index) => (
              <Badge key={index} variant="secondary" className="whitespace-nowrap">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Criado: {formatDate(created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>Publicado: {formatDate(published_at)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6">
        <Button variant="outline" onClick={() => window.open(url.replace('.json', ''), '_blank')} className="w-full">
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  )
}