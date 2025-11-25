"use client";

import React, { useState } from 'react'
import Image from 'next/image'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, width, height, ...rest } = props

  // For error state, use regular img since it's a data URI
  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  // Use Next.js Image for the main image
  // If width/height are provided, use them; otherwise use fill for container-based sizing
  if (width && height) {
    return (
      <Image
        src={src || ''}
        alt={alt || ''}
        className={className}
        style={style}
        width={width as number}
        height={height as number}
        onError={handleError}
        unoptimized={src?.startsWith('data:')}
        {...(rest as any)}
      />
    )
  }

  // Use fill for container-based sizing (parent must be relative)
  return (
    <Image
      src={src || ''}
      alt={alt || ''}
      className={className}
      fill
      onError={handleError}
      unoptimized={src?.startsWith('data:')}
      style={style}
      sizes="100vw"
      {...(rest as any)}
    />
  )
}

