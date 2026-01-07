"use client";

import Link from "next/link";
import { LessonLayout } from "../../components/LessonLayout";
import { Heading, Subheading } from "../../components/Typography";
import { Button } from "../../components/Button";
import { colors } from "../../constants/colors";
import Image from "next/image";

export default function Home() {
  return (
    <LessonLayout ariaLabel="Math Basics Coming Soon">
      {/* Decorative corner accents */}
      <div className="pointer-events-none absolute left-4 top-4 h-16 w-16">
        <Image
          src="/assets/image19.webp"
          alt=""
          fill
          className="object-contain"
        />
      </div>
      <div className="pointer-events-none absolute right-6 bottom-6 h-20 w-20">
        <Image
          src="/assets/image11.webp"
          alt=""
          fill
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Heading>
          MATH
          <br />
          BASICS
        </Heading>

        <div className="mt-8 max-w-md">
          <Subheading>
            This module is currently under construction.
            <br />
            Check back soon!
          </Subheading>
        </div>

        <div className="mt-10">
          <Link href="/" passHref>
            <Button>
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: colors.primary }}
              >
                ←
              </span>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </LessonLayout>
  );
}

