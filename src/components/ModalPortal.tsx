// components/ModalPortal.tsx - NO REACT-DOM NEEDED
import { ReactNode } from 'react';

interface ModalPortalProps {
  children: ReactNode;
}

export function ModalPortal({ children }: ModalPortalProps) {
  // Just return the children directly - no portal needed
  return <>{children}</>;
}
