import React, { useState } from 'react';
import { FloatingButton } from './FloatingButton';
import { Drawer } from './Drawer';
import { useShrinkContainer } from '../hooks';

/**
 * Main application component
 */
export function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  useShrinkContainer(isDrawerOpen);

  return (
    <>
      <FloatingButton 
        onClick={() => setIsDrawerOpen(true)} 
        isHidden={isDrawerOpen}
      />
      <Drawer 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}

