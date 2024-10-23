import { useAppContext } from "@/context/AppContext"
import useResponsive from "@/hooks/useResponsive"
import { ACTIVITY_STATE } from "@/types/app"
import DrawingEditor from "../drawing/DrawingEditor"
import EditorComponent from "../editor/EditorComponent"
import { motion } from "framer-motion"

export default function WorkSpace() {
  const { viewHeight } = useResponsive()
  const { activityState } = useAppContext()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute left-0 top-0 w-full max-w-full flex-grow overflow-x-hidden bg-gray-900 bg-opacity-80 backdrop-blur-sm md:static rounded-lg shadow-2xl"
      style={{ height: viewHeight }}
    >
      {activityState === ACTIVITY_STATE.DRAWING ? (
        <DrawingEditor />
      ) : (
        <EditorComponent />
      )}
    </motion.div>
  )
}