import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def serve(project_dir: str, port: int = 8000) -> None:
    project_path = Path(project_dir).resolve()
    if not project_path.exists():
        raise FileNotFoundError(f"Project directory not found: {project_path}")

    os.chdir(project_path)
    handler = partial(SimpleHTTPRequestHandler, directory=str(project_path))
    server = ThreadingHTTPServer(("0.0.0.0", port), handler)
    print(f"Serving {project_path} on http://127.0.0.1:{port}")
    print("Open the address in your browser to view the project.")
    server.serve_forever()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python colab_cpu_project.py <project_dir> [port]")
        sys.exit(1)

    project_dir = sys.argv[1]
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8000
    serve(project_dir, port)
