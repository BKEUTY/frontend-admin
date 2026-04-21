import React, { useState } from 'react';
import { Skeleton } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';

const LazyImage = ({ src, alt, className, style, ...props }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gray-50 ${className}`} style={style}>
      <AnimatePresence mode="wait">
        {!loaded && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <Skeleton.Image active className="w-full h-full" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ 
          opacity: loaded ? 1 : 0, 
          scale: loaded ? 1 : 1.05 
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-full h-full object-cover ${loaded ? 'blur-0' : 'blur-lg'}`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
