function Footer() {
    return (
        <footer className="static bottom-1 left-0 flex w-full justify-center py-4 bg-purple-900 text-pink-200 sm:fixed sm:py-2">
            <span className="text-center">
                Built with{" "}
                <span className="text-pink-500" aria-label="love">
                    ❤️
                </span>{" "}
                by{" "}
                <a
                    href="https://github.com/shaikhsameer18"
                    className="text-pink-400 underline underline-offset-2 transition-colors hover:text-pink-300"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    sahilatahar
                </a>
            </span>
        </footer>
    )
}

export default Footer