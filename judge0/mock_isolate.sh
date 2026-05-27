#!/bin/bash
# Mock for 'isolate' to bypass kernel sandbox requirements in development

if [[ "$*" == *"--init"* ]]; then
    # Find box ID
    BOX_ID=0
    for i in $(seq 1 $#); do
        arg="${!i}"
        if [ "$arg" == "-b" ] || [ "$arg" == "--box-id" ]; then
            j=$((i+1))
            BOX_ID="${!j}"
        fi
    done
    BOX_DIR="/tmp/judge0-box-$BOX_ID"
    mkdir -p "$BOX_DIR/box" && chmod 777 "$BOX_DIR/box"
    echo "$BOX_DIR"
    exit 0
fi

if [[ "$*" == *"--cleanup"* ]]; then
    # Find box ID
    BOX_ID=0
    for i in $(seq 1 $#); do
        arg="${!i}"
        if [ "$arg" == "-b" ] || [ "$arg" == "--box-id" ]; then
            j=$((i+1))
            BOX_ID="${!j}"
        fi
    done
    rm -rf "/tmp/judge0-box-$BOX_ID"
    exit 0
fi

# Look for --run
if [[ "$*" == *"--run"* ]]; then
    FOUND_RUN=false
    COMMAND=()
    for arg in "$@"; do
        if [ "$arg" == "--run" ]; then
            FOUND_RUN=true
            continue
        fi
        if [ "$FOUND_RUN" == true ]; then
            # Skip the '--' if it immediately follows '--run'
            if [ "$arg" == "--" ] && [ ${#COMMAND[@]} -eq 0 ]; then
                continue
            fi
            COMMAND+=("$arg")
        fi
    done
else
    # Fallback: find first non-flag that isn't a known argument
    COMMAND=()
    SKIP_NEXT=false
    for arg in "$@"; do
        if [ "$SKIP_NEXT" == true ]; then
            SKIP_NEXT=false
            continue
        fi
        case "$arg" in
            -M|--meta|-b|--box-id|-t|--time|-w|--wall-time|-x|--extra-time|-k|--stack|-m|--mem|-f|--fsize|-p|--processes|-D|--dir|-d|--dir|-E|--env|--stdin|--stdout|--stderr)
                SKIP_NEXT=true
                ;;
            -*)
                ;;
            *)
                COMMAND=("$arg")
                break
                ;;
        esac
    done
fi

# Find meta file (needed for output)
META_FILE=""
for i in $(seq 1 $#); do
    arg="${!i}"
    if [ "$arg" == "-M" ] || [ "$arg" == "--meta" ]; then
        j=$((i+1))
        META_FILE="${!j}"
    fi
done

# Find box ID for run
BOX_ID=0
for i in $(seq 1 $#); do
    arg="${!i}"
    if [ "$arg" == "-b" ] || [ "$arg" == "--box-id" ]; then
        j=$((i+1))
        BOX_ID="${!j}"
    fi
done

if [ ${#COMMAND[@]} -gt 0 ]; then
    # Change to box directory
    if [ -d "/tmp/judge0-box-$BOX_ID/box" ]; then
        cd "/tmp/judge0-box-$BOX_ID/box"
    fi
    "${COMMAND[@]}"
    EXIT_CODE=$?
else
    EXIT_CODE=0
fi

if [ -n "$META_FILE" ]; then
    echo "time:0.100" > "$META_FILE"
    echo "time-wall:0.100" >> "$META_FILE"
    echo "max-rss:1024" >> "$META_FILE"
    echo "exitcode:$EXIT_CODE" >> "$META_FILE"
    if [ $EXIT_CODE -ne 0 ]; then
        echo "status:RE" >> "$META_FILE"
    fi
fi

exit $EXIT_CODE
