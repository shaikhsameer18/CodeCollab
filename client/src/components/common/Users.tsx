import { useAppContext } from "@/context/AppContext"
import { RemoteUser, USER_CONNECTION_STATUS } from "@/types/user"
import Avatar from "react-avatar"

function Users() {
    const { users } = useAppContext()

    return (
        <div className="flex min-h-[200px] flex-grow justify-center overflow-y-auto py-4 px-2 bg-gray-700 bg-opacity-50 rounded-lg backdrop-blur-sm">
            <div className="flex h-full w-full flex-wrap items-start justify-center gap-x-4 gap-y-6">
                {users.map((user) => (
                    <User key={user.socketId} user={user} />
                ))}
            </div>
        </div>
    )
}

const User = ({ user }: { user: RemoteUser }) => {
    const { username, status } = user
    const title = `${username} - ${status === USER_CONNECTION_STATUS.ONLINE ? "online" : "offline"}`

    return (
        <div
            className="relative flex w-[120px] flex-col items-center gap-2 p-3 bg-purple-800 bg-opacity-70 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:bg-opacity-90"
            title={title}
        >
            <Avatar
                name={username}
                size="60"
                round={true}
                title={title}
                className="border-2 border-pink-400 shadow-md"
                fgColor="#fff"
                color={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
            />
            <p className="line-clamp-2 max-w-full text-ellipsis break-words text-center text-pink-100 font-medium text-sm">
                {username}
            </p>
            <div
                className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-purple-600 ${status === USER_CONNECTION_STATUS.ONLINE
                        ? "bg-green-400"
                        : "bg-pink-500"
                    }`}
            ></div>
        </div>
    )
}

export default Users