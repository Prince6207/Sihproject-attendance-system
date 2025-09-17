import React from 'react'

function Button({children, 
    type='button',
    bgColor = 'bg-blue-600',
    textColor = 'text-white',
    className ='',
    ...props
}) {
  return (
    <button type={type} className={`px-8 py-3 font-semibold border rounded dark:border-gray-800 dark:text-white-800 ${bgColor} ${textColor} ${className}`} {...props}>{children}</button>
  )
}

export default Button



