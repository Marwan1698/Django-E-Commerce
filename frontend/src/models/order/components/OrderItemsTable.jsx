import { Link } from 'react-router'

import { formatPrice } from '@/shared/format'

export function OrderItemsTable({ order }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs tracking-wide text-slate-400 uppercase">
        <tr>
          <th className="px-5 py-4 font-semibold">Item</th>
          <th className="px-5 py-4 text-right font-semibold">Price</th>
          <th className="px-5 py-4 text-right font-semibold">Qty</th>
          <th className="px-5 py-4 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {order.items.map((item) => (
          <tr key={item.id}>
            <td className="px-5 py-3 font-semibold">
              {item.product ? (
                <Link to={`/products/${item.product}`} className="hover:text-navy-600">{item.product_name}</Link>
              ) : (
                item.product_name
              )}
            </td>
            <td className="px-5 py-3 text-right text-slate-600">{formatPrice(item.unit_price)}</td>
            <td className="px-5 py-3 text-right text-slate-600">{item.quantity}</td>
            <td className="px-5 py-3 text-right font-semibold">{formatPrice(item.line_total)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4} className="p-2">
            <div className="flex justify-between rounded-2xl bg-navy-50 px-4 py-3 text-base">
              <span className="font-bold">Total</span>
              <span className="font-extrabold">{formatPrice(order.total)}</span>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}
