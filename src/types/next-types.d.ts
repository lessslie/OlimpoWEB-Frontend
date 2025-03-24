// Declaraciones de tipos para los módulos de Next.js

// Para next/link
declare module 'next/link' {
  import { ComponentType, MouseEventHandler, ReactNode } from 'react';

  export interface LinkProps {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
    onTouchStart?: MouseEventHandler<HTMLAnchorElement>;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    children?: ReactNode;
    className?: string;
  }

  const Link: ComponentType<LinkProps>;
  export default Link;
}

// Para next/image
declare module 'next/image' {
  import { ComponentType, ImgHTMLAttributes } from 'react';

  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
    src: string | { src: string; height: number; width: number; blurDataURL?: string };
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
    loader?: (resolverProps: ImageLoaderProps) => string;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
    objectPosition?: string;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    lazyBoundary?: string;
    lazyRoot?: React.RefObject<HTMLElement>;
  }

  interface ImageLoaderProps {
    src: string;
    width: number;
    quality?: number | string;
  }

  const Image: ComponentType<ImageProps>;
  export default Image;
}

// Para next/navigation
declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string, options?: { shallow?: boolean; scroll?: boolean; locale?: string | false }) => void;
    replace: (url: string, options?: { shallow?: boolean; scroll?: boolean; locale?: string | false }) => void;
    prefetch: (url: string, options?: { priority?: boolean }) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    pathname: string;
    query: Record<string, string | string[]>;
    asPath: string;
    isFallback: boolean;
    basePath: string;
    locale: string;
    locales: string[];
    defaultLocale: string;
    isReady: boolean;
    isPreview: boolean;
  };

  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams<T = Record<string, string | string[]>>(): T;
}
