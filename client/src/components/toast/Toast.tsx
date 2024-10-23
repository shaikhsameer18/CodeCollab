import { Toaster, ToasterProps } from "react-hot-toast"

export default function Toast({ position = "top-right", ...props }: ToasterProps) {
    return <Toaster position={position} {...props} />
}