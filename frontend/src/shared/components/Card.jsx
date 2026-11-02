/** The rounded white surface used for panels across the app. */
export function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 ${className}`} {...props}>
      {children}
    </Tag>
  )
}
