import { useEffect, useState, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import * as monaco from "monaco-editor";

const CURSOR_COLORS = [
  '#10B981', '#F97316', '#8B5CF6', '#EF4444', '#06B6D4', '#F59E0B'
];

function getColorIndex(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % CURSOR_COLORS.length;
}

export function usePresence(
  provider: WebsocketProvider | null,
  editor: monaco.editor.IStandaloneCodeEditor | null,
  userName: string,
  ydoc: Y.Doc | null
) {
  const [onlineUsers, setOnlineUsers] = useState(1);
  const gutterDecorationsRef = useRef<string[]>([]);
  
  useEffect(() => {
    if (!provider || !editor || !ydoc) return;

    // Assign color
    const colorIndex = getColorIndex(userName || "guest");
    const myColor = CURSOR_COLORS[colorIndex];

    provider.awareness.setLocalStateField("user", {
      name: userName,
      color: myColor,
    });

    const handleAwarenessUpdate = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const activeUsers = states.filter((state: any) => state.user != null);
      setOnlineUsers(activeUsers.length);
      
      // Force refresh moving class on cursors
      setTimeout(() => {
        const heads = document.querySelectorAll('.yRemoteSelectionHead');
        heads.forEach(head => {
          head.classList.add('moving');
          // clear previous timeout if exists
          const existingTimeout = (head as any)._fadeTimeout;
          if (existingTimeout) clearTimeout(existingTimeout);
          
          (head as any)._fadeTimeout = setTimeout(() => {
            head.classList.remove('moving');
          }, 3000);
        });
      }, 50);
    };

    provider.awareness.on("change", handleAwarenessUpdate);
    handleAwarenessUpdate();

    // Heatmap Logic
    let timeoutIds: NodeJS.Timeout[] = [];
    const heatmapMap = new Map<number, { userId: string, color: string, timestamp: number }>();

    const updateGutterDecorations = () => {
      const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
      for (const [line, data] of heatmapMap.entries()) {
        newDecorations.push({
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: false,
            linesDecorationsClassName: `gutter-dot-${data.color.replace('#', '')}`,
          }
        });
      }
      gutterDecorationsRef.current = editor.deltaDecorations(gutterDecorationsRef.current, newDecorations);
    };

    const disposable = editor.onDidChangeModelContent((e) => {
      e.changes.forEach(change => {
        const line = change.range.startLineNumber;
        let changeColor = myColor;
        let changeUser = userName;

        const myPos = editor.getPosition();
        if (myPos && Math.abs(myPos.lineNumber - line) <= 1) {
           changeColor = myColor;
           changeUser = userName;
        } else {
           const remoteStates = Array.from(provider.awareness.getStates().values());
           for (const state of remoteStates as any) {
             if (state.cursor && state.user && state.user.name !== userName) {
               if (Math.abs(state.cursor.anchor.line - line) <= 2) {
                 changeColor = state.user.color;
                 changeUser = state.user.name;
                 break;
               }
             }
           }
        }

        heatmapMap.set(line, { userId: changeUser, color: changeColor, timestamp: Date.now() });

        const className = `gutter-dot-${changeColor.replace('#', '')}`;
        if (!document.getElementById(`style-${className}`)) {
          const style = document.createElement('style');
          style.id = `style-${className}`;
          style.innerHTML = `.${className} { width: 4px !important; height: 100% !important; background-color: ${changeColor} !important; margin-left: 2px; border-radius: 2px; }`;
          document.head.appendChild(style);
        }
        
        updateGutterDecorations();

        const tId = setTimeout(() => {
          const entry = heatmapMap.get(line);
          if (entry && Date.now() - entry.timestamp >= 9900) {
            heatmapMap.delete(line);
            updateGutterDecorations();
          }
        }, 10000);
        timeoutIds.push(tId);
      });
    });

    return () => {
      provider.awareness.setLocalState(null);
      provider.awareness.off("change", handleAwarenessUpdate);
      disposable.dispose();
      timeoutIds.forEach(clearTimeout);
      if (editor) {
        editor.deltaDecorations(gutterDecorationsRef.current, []);
      }
    };
  }, [provider, editor, userName, ydoc]);

  return { onlineUsers };
}
