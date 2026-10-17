const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export const formatPrice = (value) => currency.format(Number(value))
export const formatDate = (value) => date.format(new Date(value))
