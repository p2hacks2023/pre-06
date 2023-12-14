.PHONY: build_wasm
build_wasm:
	wasm-pack build hot-finder --target web --out-dir ../src/engine/wasmpkg
	echo "" > src/engine/wasmpkg/.gitignore