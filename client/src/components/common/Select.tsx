import { ChangeEvent } from "react"
import { PiCaretDownBold } from "react-icons/pi"

interface SelectProps {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    value: string
    options: string[]
    title: string
    className?: string
}

function Select({ onChange, value, options, title, className = "" }: SelectProps) {
    return (
        <div className={`relative w-full ${className}`}>
            <label className="mb-2 block text-pink-200 font-medium">{title}</label>
            <div className="relative">
                <select
                    className="w-full rounded-md border-2 border-purple-600 bg-purple-800 px-4 py-2 text-pink-100 outline-none appearance-none cursor-pointer transition-colors hover:bg-purple-700 focus:border-pink-500"
                    value={value}
                    onChange={onChange}
                >
                    {options.sort().map((option) => {
                        const value = option
                        const name = option.charAt(0).toUpperCase() + option.slice(1)

                        return (
                            <option key={name} value={value} className="bg-purple-800">
                                {name}
                            </option>
                        )
                    })}
                </select>
                <PiCaretDownBold
                    size={16}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-pink-300 pointer-events-none"
                />
            </div>
        </div>
    )
}

export default Select