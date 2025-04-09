"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CBREButton } from "@/components/cbre-button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function CarouselExamplePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="py-10 px-4 md:px-10 max-w-5xl mx-auto">
        <h1 className="text-6xl font-financier text-cbre-green mb-6">Carousel Component</h1>
        <p className="text-dark-grey font-calibre mb-10 max-w-3xl">
          A carousel component built with Embla Carousel, providing smooth sliding functionality
          with support for multiple items, autoplay, and custom navigation controls.
        </p>

        {/* Basic Carousel */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Basic Carousel</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto space-y-6">
              <div className="space-y-2">
                <p className="text-dark-grey font-calibre mb-2">Single Item Carousel</p>
                <Carousel className="w-full max-w-xs mx-auto">
                  <CarouselContent>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <CarouselItem key={index}>
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-4xl font-semibold">{index + 1}</span>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<Carousel>
  <CarouselContent>
    {items.map((item, index) => (
      <CarouselItem key={index}>
        <Card>
          <CardContent>
            {item}
          </CardContent>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
            </pre>
          </div>
        </div>

        {/* Multiple Items Carousel */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Multiple Items</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto space-y-6">
              <div className="space-y-2">
                <p className="text-dark-grey font-calibre mb-2">Three Items Per View</p>
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/3">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-3xl font-semibold">{index + 1}</span>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<Carousel
  opts={{
    align: "start",
    loop: true,
  }}
>
  <CarouselContent className="-ml-4">
    {items.map((item, index) => (
      <CarouselItem key={index} className="pl-4 basis-1/3">
        <Card>
          <CardContent>
            {item}
          </CardContent>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
            </pre>
          </div>
        </div>

        {/* Autoplay Carousel */}
        <div className="mb-16">
          <h2 className="text-4xl font-financier text-cbre-green mb-5">Autoplay Carousel</h2>
          <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
            <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto space-y-6">
              <div className="space-y-2">
                <p className="text-dark-grey font-calibre mb-2">Automatically Advancing Slides</p>
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  plugins={[
                    Autoplay({
                      delay: 2000,
                    }),
                  ]}
                  className="w-full max-w-xs mx-auto"
                >
                  <CarouselContent>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <CarouselItem key={index}>
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <span className="text-4xl font-semibold">{index + 1}</span>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-light-grey mt-6">
            <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`<Carousel
  opts={{
    align: "start",
    loop: true,
  }}
  plugins={[
    Autoplay({
      delay: 2000,
    }),
  ]}
>
  <CarouselContent>
    {items.map((item, index) => (
      <CarouselItem key={index}>
        <Card>
          <CardContent>
            {item}
          </CardContent>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
            </pre>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link href="/elements-example">
            <CBREButton variant="outline">Back to UI Elements</CBREButton>
          </Link>
        </div>
      </div>
    </div>
  );
} 