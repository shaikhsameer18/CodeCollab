import express, { Response, Request } from "express"
import dotenv from "dotenv"
import http from "http"
import cors from "cors"
import session from "express-session"
import rateLimit from "express-rate-limit"
import path from "path"
import { Server } from "socket.io"
import { SocketEvent, SocketId } from "./types/socket"
import { USER_CONNECTION_STATUS, User } from "./types/user"

import authRoutes from "./routes/auth"
import chatbotRoutes from "./routes/chatbot"

dotenv.config()

const app = express()
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

app.set("trust proxy", 1)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
	cors({
		origin: FRONTEND_URL,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Chat-Session"],
	}),
)

app.use(
	session({
		secret: process.env.SESSION_SECRET || "dev-only-insecure-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		},
	}),
)

app.use(express.static(path.join(__dirname, "..", "public")))

// General API rate limit: protects the GitHub proxy + AI endpoint from abuse
const apiLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 60,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many requests, please slow down." },
})

app.get("/health", (_req: Request, res: Response) => {
	res.json({ status: "ok", service: "codecollab-server" })
})

app.use("/api/auth", apiLimiter, authRoutes)
app.use("/api/chatbot", apiLimiter, chatbotRoutes)

app.get("/", (_req: Request, res: Response) => {
	res.sendFile(path.join(__dirname, "..", "public", "index.html"))
})

const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: FRONTEND_URL,
		credentials: true,
	},
	maxHttpBufferSize: 1e8,
	pingTimeout: 60000,
})

let userSocketMap: User[] = []

// Room -> last known file structure, kept only while at least one user is present
const roomFileStructures = new Map<string, any>()

function getUsersInRoom(roomId: string): User[] {
	return userSocketMap.filter((user) => user.roomId == roomId)
}

function getRoomId(socketId: SocketId): string | null {
	const roomId = userSocketMap.find(
		(user) => user.socketId === socketId,
	)?.roomId

	if (!roomId) {
		console.error("Room ID is undefined for socket ID:", socketId)
		return null
	}
	return roomId
}

function getUserBySocketId(socketId: SocketId): User | null {
	const user = userSocketMap.find((user) => user.socketId === socketId)
	if (!user) {
		console.error("User not found for socket ID:", socketId)
		return null
	}
	return user
}

io.on("connection", (socket) => {
	socket.on(SocketEvent.JOIN_REQUEST, ({ roomId, username }) => {
		const isUsernameExist = getUsersInRoom(roomId).filter(
			(u) => u.username === username,
		)
		if (isUsernameExist.length > 0) {
			io.to(socket.id).emit(SocketEvent.USERNAME_EXISTS)
			return
		}

		const user = {
			username,
			roomId,
			status: USER_CONNECTION_STATUS.ONLINE,
			cursorPosition: 0,
			typing: false,
			socketId: socket.id,
			currentFile: null,
		}
		userSocketMap.push(user)
		socket.join(roomId)
		socket.broadcast.to(roomId).emit(SocketEvent.USER_JOINED, { user })
		const users = getUsersInRoom(roomId)
		io.to(socket.id).emit(SocketEvent.JOIN_ACCEPTED, { user, users })

		if (roomFileStructures.has(roomId)) {
			io.to(socket.id).emit(
				SocketEvent.SYNC_FILE_STRUCTURE,
				roomFileStructures.get(roomId),
			)
		}
	})

	socket.on("disconnecting", () => {
		const user = getUserBySocketId(socket.id)
		if (!user) return
		const roomId = user.roomId
		socket.broadcast.to(roomId).emit(SocketEvent.USER_DISCONNECTED, { user })
		userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id)

		const usersInRoom = getUsersInRoom(roomId)
		if (usersInRoom.length === 0) {
			roomFileStructures.delete(roomId)
		}

		socket.leave(roomId)
	})

	socket.on(
		SocketEvent.SYNC_FILE_STRUCTURE,
		({ fileStructure, openFiles, activeFile, socketId }) => {
			const roomId = getRoomId(socket.id)
			if (!roomId) return

			const currentStructure = roomFileStructures.get(roomId)
			const shouldUpdate =
				!currentStructure ||
				JSON.stringify(currentStructure.fileStructure) !==
					JSON.stringify(fileStructure)

			if (!shouldUpdate) return

			roomFileStructures.set(roomId, { fileStructure, openFiles, activeFile })

			if (socketId) {
				io.to(socketId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
					fileStructure,
					openFiles,
					activeFile,
				})
			} else {
				socket.broadcast.to(roomId).emit(SocketEvent.SYNC_FILE_STRUCTURE, {
					fileStructure,
					openFiles,
					activeFile,
				})
			}
		},
	)

	socket.on(SocketEvent.DIRECTORY_CREATED, ({ parentDirId, newDirectory }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.DIRECTORY_CREATED, { parentDirId, newDirectory })
	})

	socket.on(SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.DIRECTORY_UPDATED, { dirId, children })
	})

	socket.on(SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.DIRECTORY_RENAMED, { dirId, newName })
	})

	socket.on(SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DIRECTORY_DELETED, { dirId })
	})

	socket.on(SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.FILE_CREATED, { parentDirId, newFile })
	})

	socket.on(SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.FILE_UPDATED, { fileId, newContent })
	})

	socket.on(SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.FILE_RENAMED, { fileId, newName })
	})

	socket.on(SocketEvent.FILE_DELETED, ({ fileId }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.FILE_DELETED, { fileId })
	})

	socket.on(SocketEvent.USER_OFFLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) =>
			user.socketId === socketId
				? { ...user, status: USER_CONNECTION_STATUS.OFFLINE }
				: user,
		)
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.USER_OFFLINE, { socketId })
	})

	socket.on(SocketEvent.USER_ONLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) =>
			user.socketId === socketId
				? { ...user, status: USER_CONNECTION_STATUS.ONLINE }
				: user,
		)
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.USER_ONLINE, { socketId })
	})

	socket.on(SocketEvent.SEND_MESSAGE, ({ message }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.RECEIVE_MESSAGE, { message })
	})

	socket.on(SocketEvent.TYPING_START, ({ cursorPosition }) => {
		userSocketMap = userSocketMap.map((user) =>
			user.socketId === socket.id
				? { ...user, typing: true, cursorPosition }
				: user,
		)
		const user = getUserBySocketId(socket.id)
		if (!user) return
		socket.broadcast.to(user.roomId).emit(SocketEvent.TYPING_START, { user })
	})

	socket.on(SocketEvent.TYPING_PAUSE, () => {
		userSocketMap = userSocketMap.map((user) =>
			user.socketId === socket.id ? { ...user, typing: false } : user,
		)
		const user = getUserBySocketId(socket.id)
		if (!user) return
		socket.broadcast.to(user.roomId).emit(SocketEvent.TYPING_PAUSE, { user })
	})

	socket.on(SocketEvent.REQUEST_DRAWING, () => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(SocketEvent.REQUEST_DRAWING, { socketId: socket.id })
	})

	socket.on(SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }) => {
		socket.broadcast.to(socketId).emit(SocketEvent.SYNC_DRAWING, { drawingData })
	})

	socket.on(SocketEvent.DRAWING_UPDATE, ({ snapshot }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(SocketEvent.DRAWING_UPDATE, { snapshot })
	})
})

const PORT = process.env.PORT || 3000

server
	.listen(PORT, () => {
		console.log(`CodeCollab server listening on port ${PORT}`)
		console.log(`Frontend URL: ${FRONTEND_URL}`)
	})
	.on("error", (err: any) => {
		if (err.code === "EADDRINUSE") {
			console.error(`Port ${PORT} is already in use. Please use a different port.`)
			process.exit(1)
		} else {
			console.error("Server error:", err)
		}
	})
