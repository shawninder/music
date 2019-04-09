import React from 'react'
function SvgSkeleton (props) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      version='1.1'
      style={{
        clipRule: 'evenodd',
        fillRule: 'evenodd',
        imageRendering: 'optimizeQuality',
        shapeRendering: 'geometricPrecision',
        textRendering: 'geometricPrecision'
      }}
      {...props}
    >
      {props.children}
    </svg>
  )
}

export default SvgSkeleton
