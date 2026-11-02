import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, it, vi } from 'vitest'

import { QuantityStepper } from './QuantityStepper'
import { Select } from './Select'

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price', label: 'Price: low to high' },
  { value: 'name', label: 'Name' },
]

function ControlledSelect(props) {
  const [value, setValue] = useState('')
  return <Select prefix="Sort:" options={SORTS} value={value} onChange={setValue} {...props} />
}

it('select: picks an option with the mouse', async () => {
  render(<ControlledSelect />)
  await userEvent.click(screen.getByRole('button', { name: 'Sort: Newest' }))
  expect(await screen.findByRole('option', { name: 'Newest' })).toHaveAttribute('aria-selected', 'true')
  await userEvent.click(screen.getByRole('option', { name: 'Name' }))
  expect(screen.getByRole('button', { name: 'Sort: Name' })).toBeInTheDocument()
  // The panel fades out, so it leaves the DOM a moment later.
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
})

it('select: works from the keyboard', async () => {
  render(<ControlledSelect />)
  await userEvent.tab()
  expect(screen.getByRole('button')).toHaveFocus()
  await userEvent.keyboard('{ArrowDown}')
  expect(await screen.findByRole('listbox')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole('listbox')).toHaveFocus())
  await userEvent.keyboard('{ArrowDown}{Enter}')
  expect(screen.getByRole('button', { name: 'Sort: Price: low to high' })).toHaveFocus()
})

it('select: shows the placeholder when nothing is chosen', () => {
  render(<Select options={SORTS.slice(1)} value="" onChange={() => {}} placeholder="Choose a category…" />)
  expect(screen.getByRole('button', { name: 'Choose a category…' })).toBeInTheDocument()
})

it('stepper: buttons step within min and max', async () => {
  const onChange = vi.fn()
  render(<QuantityStepper value={3} max={3} onChange={onChange} />)
  expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()
  await userEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }))
  expect(onChange).toHaveBeenCalledWith(2)
})

it('stepper: a typed number is clamped and applied on Enter', async () => {
  const onChange = vi.fn()
  render(<QuantityStepper value={1} max={5} onChange={onChange} />)
  const box = screen.getByRole('spinbutton', { name: 'Quantity' })
  await userEvent.clear(box)
  await userEvent.type(box, '40{Enter}')
  expect(onChange).toHaveBeenCalledTimes(1)
  expect(onChange).toHaveBeenCalledWith(5)
  expect(box).toHaveValue(5)
})
