import { useNavigate, useParams } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import MainFooter from "./MainFooter";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  CircleAlert,
  Play,
  Settings,
  Share2,
  SquarePlus,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import emptyProject from "../assets/emptyProject.png";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Alert, AlertDescription } from "./ui/alert";
import { Toaster, toast } from "sonner";

import isValidFilename from "valid-filename";
import MonacoEditor from "@monaco-editor/react";
import selectToStart from "../assets/selectToStart.png";

import * as Y from "yjs";
// import { WebrtcProvider } from "y-webrtc";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { VideoConferencePanel } from "./video/VideoConferencePanel";
import { usePresence } from "../hooks/usePresence";

function cleanError(stderr) {
  const firstLine = stderr
    .split("\n")
    .find((line) => line.includes("Error") || line.includes("Exception"));

  const codeLineMatch = stderr.match(/file0\.code:(\d+)/);
  const lineNumber = codeLineMatch ? codeLineMatch[1] : null;

  return {
    message: firstLine || "Unknown error",
    line: lineNumber,
    raw: stderr,
  };
}

function Editor() {
  const { projectId } = useParams();
  const [projectDetails, setProjectDetails] = useState({});
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [IsFileExist, setIsFileExist] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const selectedFileRef = useRef(null);
  const yRef = useRef(null);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [codeOutput, setCodeOutput] = useState(
    "Run the code to see the output"
  );
  const [isError, setIsError] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editorValue, setEditorValue] = useState("");
  const languageExtension = {
    nodejs: ".js",
    python: ".py",
    cpp: ".cpp",
    java: ".java",
  };
  const languageName = {
    nodejs: "javascript",
    python: "python",
    cpp: "cpp",
    java: "java",
  };
  const navigate = useNavigate();
  const [isAccessAllowed, setIsAccessAllowed] = useState(true);
  const [requestedBy, setRequestedBy] = useState("");
  const [requestedProjectId, setRequestedProjectId] = useState("");
  const [user, setUser] = useState("");
  const [aiExplaination, setAiExplaination] = useState("");
  const [roomState, setRoomState] = useState("Initialized");
  const [yjsInstances, setYjsInstances] = useState(null);
  const { onlineUsers } = usePresence(yjsInstances?.provider, yjsInstances?.editor, user, yjsInstances?.ydoc);

  useEffect(() => {
    axios
      .post(
        BACKEND_URL + "/project/get-project-details",
        { id: projectId },
        { withCredentials: true }
      )
      .then((res) => {
        setProjectDetails({
          ...res.data.projectDetails,
          files: [...res.data.projectDetails.files].reverse(),
        });
        document.title = `${res.data.projectDetails.name} - CodeHive`;
        setUser(res.data.user);
      })
      .catch((e) => {
        if (e.response.status === 401) navigate("/");
        if (e.response.status === 403) {
          setIsAccessAllowed(false);
          setProjectDetails({
            ...e.response.data.projectData,
            files: e.response.data.projectData.files.reverse(),
          });
          document.title = `${e.response.data.projectData.name} - CodeHive`;
          setRequestedBy(e.response.data.requestedBy);
          setUser(e.response.data.requestedBy);
        }
      });
  }, [BACKEND_URL, navigate, projectId, selectedFile]);

  //socket coonect
  const socketRef = useRef(null);
  const [socketConnection, setSocketConnection] = useState(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["polling", "websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;
    setSocketConnection(socket);

    socket.on("updated files", (data) => {
      setProjectDetails({
        ...data.projectDetails,
        files: [...data.projectDetails.files].reverse(),
      });
    });

    socket.on("room:state-change", (data) => {
      setRoomState(data.newState);
    });

    socket.on("room:sync-start", () => {
      setRoomState("Synchronizing");
      // Simulate sync confirm after a short delay since y-websocket handles actual sync
      setTimeout(() => {
        socket.emit("room:sync-confirm", { roomId: projectId });
      }, 500);
    });

    // return () => {
    //   socket.disconnect();
    // };
  }, [BACKEND_URL, projectId]);

  useEffect(() => {
    if (socketConnection && projectId && user) {
      socketConnection.emit("room:join", { roomId: projectId, userId: user });
    }
  }, [socketConnection, projectId, user]);

  const accessDeniedPageRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const socket = socketRef.current;

    socket.on(`${user}:access requested`, (data) => {
      toast.custom(
        (t) => (
          <div className="relative bg-zinc-900 text-white p-4 rounded-[1rem] shadow-lg w-[320px]">
            <button
              onClick={() => toast.dismiss(t)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <p className="font-semibold">Access Request</p>
            <p className="text-sm text-gray-400">
              {data.requestedBy} wants access to "{data.projectName}"
            </p>
            <button
              className="mt-2 text-[0.7rem] text-[#aaa8a8] border-1 border-[#555454] px-2 py-1 rounded-[0.4rem] hover:bg-[#222222] hover:border-[#777676] duration-300 cursor-pointer"
              onClick={() => {
                toast.dismiss(t);
                toast.success("Access Granted");
                socket.emit("grant project access", {
                  projectId: data.projectId,
                  requestedBy: data.requestedBy,
                });
              }}
            >
              Allow Access
            </button>
          </div>
        ),
        {
          duration: Infinity,
          style: {
            borderRadius: "1rem",
          },
        }
      );
    });

    socket.on(`${user}:access granted`, (data) => {
      if (!accessDeniedPageRef.current) return;
      accessDeniedPageRef.current.innerText =
        "You have been granted access! Please refresh the page.";
      accessDeniedPageRef.current.style.color = "white";
      accessDeniedPageRef.current.style.fontSize = "1.5rem";
      accessDeniedPageRef.current.style.marginTop = "20rem";
      accessDeniedPageRef.current.style.fontWeight = "600";
      // setIsAccessAllowed(true);
    });
  }, [requestedBy, user]);

  const [isAccessRequested, setIsAccessRequested] = useState(false);
  if (!isAccessAllowed)
    return (
      <div className="flex flex-col bg-[#0F0F10] min-h-screen overflow-hidden items-center justify-center bg-[url('../../grid.svg')]">
        <div className="fixed top-0 w-full">
          <MainNavbar />
          <div
            className="flex flex-col items-center justify-center mt-40 text-center"
            ref={accessDeniedPageRef}
          >
            <h1 className="text-white font-bold text-2xl mt-20">
              Access Denied for {projectDetails.name}
            </h1>
            <p className="text-gray-400 mt-4">
              You do not have permission to access this project.
            </p>
            <button
              className={`bg-[#522DA5] mt-6 text-white px-4 py-[0.3rem] font-semibold rounded-[0.3rem] cursor-pointer hover:bg-[#4c2a97] duration-300 ${
                isAccessRequested ? "bg-gray-600 pointer-events-none" : ""
              } ${
                projectDetails.accessRequests.includes(requestedBy)
                  ? "bg-gray-600 pointer-events-none"
                  : ""
              }`}
              onClick={(e) => {
                setIsAccessRequested(true);
                e.currentTarget.innerText = "Access Requested";
                socketRef.current.emit("request access", {
                  projectId: projectId,
                  requestedBy: requestedBy,
                  projectOwner: projectDetails.owner,
                });
              }}
            >
              {projectDetails.accessRequests.includes(requestedBy)
                ? "Access Requested"
                : "Request Access"}
            </button>
          </div>
        </div>
      </div>
    );
  else
    return (
      <div className="flex flex-col bg-[#0F0F10] min-h-screen overflow-hidden">
        <MainNavbar />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#0f0f10",
              color: "white",
              border: "3px solid #512FA2",
            },
          }}
        />

        <div className="w-full flex-1 p-4 flex flex-col text-white">
          <ResizablePanelGroup
            direction="horizontal"
            className="rounded-lg border-2 border-[#1C1D24] h-full w-full flex-1 max-h-[36.6rem]"
          >
            <ResizablePanel
              defaultSize={10}
              className="flex max-w-[15.5rem] min-w-[2rem]"
            >
              <div className="flex flex-col h-full items-center px-6 py-4 w-[11rem] w-full">
                <div className="text-white font-bold text-[1.1rem] flex flex-col gap-3 justify-start w-full max-w-[12rem]">
                  <p className="text-gray-500 text-[0.84rem]">FILE EXPLORER</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[1.3rem]">{projectDetails.name}</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Share2
                          size={16}
                          className="mt-1 cursor-pointer text-neutral-600"
                          onClick={() => {
                            navigator.clipboard.writeText(document.location.href);
                            toast("Share Link copied to clipboard!");
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Share Link</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Dialog
                    onOpenChange={(e) => {
                      if (e) setIsFileExist(false);
                    }}
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <DialogTrigger asChild>
                        <button className="font-semibold text-[0.9rem] flex items-center gap-2 bg-[#4E29A4] pl-5 py-1 rounded-[0.4rem]  duration-300 hover:opacity-85 cursor-pointer w-[8.4rem]">
                          <SquarePlus size={18} /> <p>New File</p>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-[#0C0E15] border-1 border-[#1C1D24] text-white">
                        <DialogHeader>
                          <DialogTitle>New File</DialogTitle>
                          <DialogDescription>
                            Create a new file here. Just write the file name
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const fileName = e.currentTarget[0].value;
                            if (fileName.trim() === "") {
                              toast("Invalid file name!", {
                                style: {
                                  border: "2px solid red",
                                },
                              });
                              return;
                            }
                            if (
                              !isValidFilename(fileName) ||
                              fileName.includes(".")
                            ) {
                              toast("Invalid file name!", {
                                style: {
                                  border: "2px solid red",
                                },
                              });
                              return;
                            }

                            try {
                              const response = await axios.post(
                                BACKEND_URL + "/project/create-file",
                                {
                                  projectId: projectId,
                                  fileName:
                                    e.currentTarget[0].value +
                                    languageExtension[projectDetails.language],
                                },
                                { withCredentials: true }
                              );
                              // setProjectDetails({
                              //   ...response.data.projectDetails,
                              //   files:
                              //     response.data.projectDetails.files.reverse(),
                              // });
                              toast(
                                `File "${
                                  fileName +
                                  languageExtension[projectDetails.language]
                                }" created`
                              );
                              setIsFileExist(true);
                              // setSelectedFile(
                              //   fileName +
                              //     languageExtension[projectDetails.language]
                              // );
                              // selectedFileRef.current =
                              //   fileName +
                              //   languageExtension[projectDetails.language];
                              // editorRef.current.setValue("");
                            } catch (e) {
                              console.log(e);
                              if (e.response.status === 401) navigate("/");
                            }
                          }}
                        >
                          <div className="grid gap-4">
                            <div className="grid gap-3">
                              <Label htmlFor="name-1">File name</Label>
                              <div className="flex gap-2 items-start">
                                <div className="flex flex-col w-full">
                                  <Input
                                    id="name-1"
                                    name="name"
                                    placeholder="File name"
                                    className="selection:bg-blue-700 w-full"
                                    required
                                    onInput={(e) => {
                                      const fileName =
                                        e.currentTarget.value.trim() +
                                        languageExtension[
                                          projectDetails.language
                                        ];
                                      for (let file of projectDetails.files) {
                                        if (file.name === fileName) {
                                          setIsFileExist(true);
                                          break;
                                        } else {
                                          setIsFileExist(false);
                                        }
                                      }
                                    }}
                                  />
                                  {IsFileExist && (
                                    <Alert
                                      variant="default"
                                      className="bg-transparent border-none p-0"
                                    >
                                      <AlertDescription className="text-[#D1010C] font-semibold ml-1 mt-2 flex">
                                        <CircleAlert
                                          size={17}
                                          className="mt-[0.12rem]"
                                        />
                                        File already exists!
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>

                                <div className="bg-[#5c5b5b] py-[0.4rem] px-4 font-semibold rounded-[0.4rem]">
                                  {languageExtension[projectDetails.language]}
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="mt-5">
                            <DialogClose asChild>
                              <Button
                                variant="outline"
                                className="bg-[#17171D] border-1 border-[#2c2e3f] hover:bg-[#17171D] hover:text-white cursor-pointer"
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              type="submit"
                              className={`bg-[#4E29A4] hover:bg-[#43238d] cursor-pointer px-5 ${
                                IsFileExist
                                  ? "bg-gray-500 pointer-events-none"
                                  : ""
                              }`}
                            >
                              Create
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </form>
                  </Dialog>
                </div>

                <div className="flex flex-col gap-2 w-full mt-3 overflow-y-auto overflow-x-hidden max-h-full scrollbar-thin scrollbar-track-[#000]">
                  {projectDetails?.files?.length === 0 && (
                    <div className="flex flex-col items-center mt-[10rem] text-[]">
                      <img src={emptyProject} className="w-[2rem]" />
                      <p className="text-gray-400 italic text-center">
                        No files to show
                      </p>
                    </div>
                  )}

                  {projectDetails?.files?.map((file, index) => {
                    return (
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <div
                            className={`bg-[#1c1d2d h-fit py-1 rounded-[0.3rem] px-2 text-[0.9rem] flex items-center justify-start w-fit min-w-[12.5rem] cursor-pointer hover:bg-[#1C1D24] ${
                              selectedFile === file.name
                                ? "bg-[#1C1D24] font-bold"
                                : ""
                            }`}
                            key={index}
                            onClick={(e) => {
                              if (yRef.current) {
                                yRef.current.ydoc.destroy();
                                yRef.current.provider.destroy();
                              }
                              yRef.current.ydoc = new Y.Doc();
                              yRef.current.provider = new WebsocketProvider(
                                import.meta.env.VITE_YWS_URL,
                                `${projectId}:${file.name}`,
                                yRef.current.ydoc
                              );
                              yRef.current.type =
                                yRef.current.ydoc.getText("monaco");
                              const monacoBinding = new MonacoBinding(
                                yRef.current.type,
                                editorRef.current.getModel(),
                                new Set([editorRef.current]),
                                yRef.current.provider.awareness
                              );

                              axios
                                .post(
                                  BACKEND_URL + "/project/get-project-details",
                                  { id: projectId },
                                  { withCredentials: true }
                                )
                                .then((res) => {
                                  // setProjectDetails({
                                  //   ...res.data.projectDetails,
                                  //   files:
                                  //     res.data.projectDetails.files.reverse(),
                                  // });
                                  setSelectedFile(file.name);
                                  selectedFileRef.current = file.name;
                                  if (editorRef.current) {
                                    editorRef.current.setValue(file.content);
                                  } else {
                                    setEditorValue(file.content);
                                  }
                                })
                                .catch((e) => {
                                  if (e.response.status === 401) navigate("/");
                                });
                            }}
                          >
                            <div className="mr-1 bg-[#3C210E] text-[#E27311] rounded-[0.2rem] px-1 font-bold">
                              {(projectDetails?.language
                                ? languageExtension[projectDetails.language]
                                : ".txt"
                              )
                                .slice(1)
                                .toUpperCase()}
                            </div>
                            <p className="text-gray-300 ml-1 wrap-anywhere">
                              {file.name}
                            </p>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="bg-[#0C0E15] text-white border-1 border-[#1C1D24]">
                          <Dialog
                            onOpenChange={(e) => {
                              if (e) setIsFileExist(false);
                            }}
                          >
                            <DialogTrigger className="text-[0.9rem] cursor-pointer hover:bg-[#1C1D24] px-2 py-1 rounded-[0.3rem]">
                              Rename "{file.name}"
                            </DialogTrigger>
                            <DialogContent className="bg-[#0C0E15] border-1 border-[#1C1D24] text-white">
                              <DialogHeader>
                                <DialogTitle>Rename "{file.name}"</DialogTitle>
                                <DialogDescription>
                                  Rename the file, make sure to give it a unique
                                  name
                                </DialogDescription>
                              </DialogHeader>
                              <form
                                className="flex flex-col gap-2"
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  const newFileName = e.currentTarget[0].value;
                                  if (newFileName.trim() === "") {
                                    toast("Invalid file name!", {
                                      style: {
                                        border: "2px solid red",
                                      },
                                    });
                                    return;
                                  }
                                  if (
                                    !isValidFilename(newFileName) ||
                                    newFileName.includes(".")
                                  ) {
                                    toast("Invalid file name!", {
                                      style: {
                                        border: "2px solid red",
                                      },
                                    });
                                    return;
                                  }

                                  try {
                                    const response = await axios.post(
                                      BACKEND_URL + "/project/rename-file",
                                      {
                                        projectId: projectId,
                                        newFileName:
                                          newFileName +
                                          languageExtension[
                                            projectDetails.language
                                          ],
                                        oldFileName: file.name,
                                      },
                                      { withCredentials: true }
                                    );
                                    toast(
                                      `File "${file.name}" renamed to "${
                                        newFileName +
                                        languageExtension[
                                          projectDetails?.language
                                        ]
                                      }"`
                                    );
                                    setProjectDetails({
                                      ...response.data.projectDetails,
                                      files:
                                        response.data.projectDetails.files.reverse(),
                                    });
                                    setIsFileExist(true);
                                  } catch (e) {
                                    console.log(e);
                                    if (e.response.status === 401)
                                      navigate("/");
                                  }
                                }}
                              >
                                <label htmlFor="new-file">New name</label>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="File name"
                                    id="new-file"
                                    required
                                    defaultValue={file.name.split(".")[0]}
                                    className="selection:bg-blue-800"
                                    onInput={(e) => {
                                      const fileName =
                                        e.currentTarget.value.trim() +
                                        languageExtension[
                                          projectDetails.language
                                        ];
                                      for (let file of projectDetails.files) {
                                        if (file.name === fileName) {
                                          setIsFileExist(true);
                                          break;
                                        } else {
                                          setIsFileExist(false);
                                        }
                                      }
                                    }}
                                  />
                                  <div className="bg-[#5c5b5b] py-[0.4rem] px-4 font-semibold rounded-[0.4rem]">
                                    {languageExtension[projectDetails.language]}
                                  </div>
                                </div>
                                {IsFileExist && (
                                  <Alert
                                    variant="default"
                                    className="bg-transparent border-none p-0 mt-[-0.6rem] ml-[-0.3rem]"
                                  >
                                    <AlertDescription className="text-[#D1010C] font-semibold ml-1 mt-2 flex">
                                      <CircleAlert
                                        size={17}
                                        className="mt-[0.12rem]"
                                      />
                                      File already exists!
                                    </AlertDescription>
                                  </Alert>
                                )}
                                <DialogFooter className="mt-2">
                                  <DialogClose asChild>
                                    <Button
                                      variant="outline"
                                      className="bg-[#17171D] border-1 border-[#2c2e3f] hover:bg-[#17171D] hover:text-white cursor-pointer"
                                    >
                                      Cancel
                                    </Button>
                                  </DialogClose>
                                  <Button
                                    type="submit"
                                    className={`bg-[#4E29A4] hover:bg-[#43238d] cursor-pointer px-4 ${
                                      IsFileExist
                                        ? "bg-gray-500 pointer-events-none"
                                        : ""
                                    }`}
                                  >
                                    Rename
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <ContextMenuItem
                            className="text-[#D65658] hover:bg-[#0C0E15] cursor-pointer data-[highlighted]:bg-[#1C1D24] data-[highlighted]:text-[#c85153]"
                            onClick={async () => {
                              if (file.name === selectedFileRef.current) {
                                // selectedFileRef.current=null;
                                setSelectedFile(null);
                              }
                              try {
                                const response = await axios.post(
                                  BACKEND_URL + "/project/delete-file",
                                  {
                                    id: projectDetails._id,
                                    fileName: file.name,
                                  },
                                  { withCredentials: true }
                                );
                                setProjectDetails({
                                  ...response.data.projectDetails,
                                  files:
                                    response.data.projectDetails.files.reverse(),
                                });
                              } catch (e) {
                                console.log(e);
                                if (e.response.status === 401) navigate("/");
                              }
                            }}
                          >
                            Delete "{file.name}"
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  })}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle className="bg-[#1C1D24] w-1" />

            <ResizablePanel defaultSize={50} className="">
              <ResizablePanelGroup direction="vertical" className="h-full">
                {selectedFile === null && (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex">
                      <img src={selectToStart} className="w-[17rem]" />
                    </div>
                  </div>
                )}
                {selectedFile !== null && (
                  <div
                    className={`h-[3rem] border-b-1 border-gray-700 flex items-center justify-center gap-2 w-full `}
                  >
                    <div
                      className={`flex items-center gap-2 cursor-pointer bg-[#1E1E1E] px-3 py-1 rounded-[0.3rem] hover:bg-[#323232] ${
                        isCodeRunning ? "bg-neutral-800 pointer-events-none" : ""
                      }`}
                      onClick={async () => {
                        const code = editorRef.current.getValue();
                        setIsCodeRunning(true);
                        if (socketRef.current) {
                           socketRef.current.emit("code_execute", { roomId: projectId });
                        }
                        try {
                          const response = await axios.post(
                            BACKEND_URL + "/project/run-code",
                            {
                              code: code,
                              language: languageName[projectDetails.language],
                            },
                            { withCredentials: true }
                          );
                          const data = response.data.data;

                          if (data.run.stderr !== "") {
                            const err = cleanError(data.run.stderr);
                            setIsError(true);
                            setCodeOutput(
                              `Error on line ${err.line}: ${err.message}`
                            );
                          } else {
                            setIsError(false);
                            setCodeOutput(data.run.output);
                          }
                        } catch (e) {
                          console.log(e);
                          if (e.response.status === 401) navigate("/");
                        }
                        setIsCodeRunning(false);
                      }}
                    >
                      <Play
                        className={`fill-[#4E29A4] stroke-[#4E29A4] mt-[0.1rem] ${
                          isCodeRunning ? "fill-neutral-600 stroke-neutral-600" : ""
                        }`}
                      />
                      <p className="font-bold text-[#dad9d9]">
                        {isCodeRunning ? "Running..." : "Run Code"}
                      </p>
                    </div>
                    {/* <div className="flex cursor-pointer bg-[#1E1E1E] py-[0.45rem] rounded-[0.3rem] px-3">
                      <Dialog>
                        <DialogTrigger>
                          <Settings
                            className="stroke-[#848383] mt-[0.15rem] hover:stroke-white duration-300 cursor-pointer"
                            size={18}
                          />
                        </DialogTrigger>
                        <DialogContent className="bg-[#0C0E15] text-white border-1 border-[#1C1D24]">
                          <DialogHeader>
                            <DialogTitle>Editor Settings</DialogTitle>
                            <DialogDescription>
                              Choose your settings for the IDE
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div> */}
                  </div>
                )}
                <ResizablePanel defaultSize={75} className="flex flex-col">
                  {
                    <MonacoEditor
                      height="90vh"
                      language={languageName[projectDetails.language]}
                      theme="vs-dark"
                      onChange={async (e) => {}}
                      onMount={(editor, monaco) => {
                        monacoRef.current = monaco;
                        const ydoc = new Y.Doc();
                        const provider = new WebsocketProvider(
                          import.meta.env.VITE_YWS_URL,
                          `${projectId}:${selectedFile}`,
                          ydoc
                        );
                        provider.awareness.on("change", () => {
                          const states = Array.from(
                            provider.awareness.getStates().values()
                          );

                          states.forEach((state) => {
                            if (!state.user) return;

                            console.log(
                              state.user.name,
                              state.user.color,
                              state.cursor
                            );
                          });
                        });

                        provider.awareness.setLocalStateField("user", {
                          name: "Ayantik",
                          color: "#ff4d4f",
                        });

                        const type = ydoc.getText("monaco");
                        const binding = new MonacoBinding(
                          type,
                          editor.getModel(),
                          new Set([editor]),
                          provider.awareness
                        );

                        yRef.current = { ydoc, provider, type, binding };

                        editor.updateOptions({
                          mouseWheelZoom: true,
                          automaticLayout: true,
                          quickSuggestions: true,
                          suggestOnTriggerCharacters: true,
                          acceptSuggestionOnEnter: "on",
                          wordBasedSuggestions: "currentDocument",
                          snippetSuggestions: "inline",
                          fontSize: 16,
                          tabSize: 4,
                        });
                        editor.setValue(editorValue);
                        editorRef.current = editor;
                        setYjsInstances({ provider, ydoc, editor });

                        editor.onKeyUp(async (e) => {
                          const code = editor.getValue();
                          const fileName = selectedFileRef.current;
                          try {
                            // Emit code change to backend to track linesWritten
                            if (socketRef.current) {
                               socketRef.current.emit("code_change", { roomId: projectId, linesDelta: 1 }); // Approx 1 change event
                            }

                            const res = await axios.post(
                              BACKEND_URL + "/project/save-file",
                              {
                                code: code,
                                projectId: projectId,
                                fileName: fileName,
                              },
                              { withCredentials: true }
                            );
                            // const files = res.data.files;
                            // // setProjectDetails({
                            //   ...projectDetails,
                            //   files: files,
                            // });
                          } catch (e) {
                            console.log(e);
                            if (e.response.status === 401) navigate("/");
                          }
                        });
                      }}
                    />
                  }
                  <div className="h-[24px] bg-gray-800 flex items-center px-4 text-xs text-gray-300 gap-4 border-t border-gray-700 w-full shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E27311]"></span>
                      <span className="capitalize">{languageName[projectDetails.language] || "Text"}</span>
                    </div>
                    <span className="text-gray-500">|</span>
                    <div className="flex items-center gap-1">
                      <span>👥 {onlineUsers} online</span>
                    </div>
                    <span className="text-gray-500">|</span>
                    <div className="flex items-center gap-2">
                      {(roomState === "Active" || roomState === "Waiting") ? (
                        <><span className="w-2 h-2 rounded-full bg-green-500"></span> Synced</>
                      ) : (
                        <><span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Syncing...</>
                      )}
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle className="bg-[#1C1D24]" />

                <ResizablePanel
                  defaultSize={25}
                  className="max-h-[30rem] min-h-[1rem] flex justify-center"
                >
                  {codeOutput === "Run the code to see the output" && (
                    <div className="mt-[3.5rem] bg-[#323131] h-[2.2rem] px-4 py-1 rounded-[0.3rem] font-bold text-[#8a8989]">
                      {codeOutput}
                    </div>
                  )}
                  {codeOutput !== "Run the code to see the output" && (
                    <div className="text-white bg-whit w-full px-4 py-2 flex flex-col">
                      <div className="bg-[#3a3939] px-2 py-1 rounded-[0.3rem] font-semibold flex justify-between">
                        <p>OUTPUT</p>
                        {isError && (
                          <Dialog
                            onOpenChange={(e) => {
                              if (e) {
                                setAiExplaination("");
                              }
                            }}
                          >
                            <DialogTrigger>
                              <button
                                className="flex items-center gap-1 text-[0.9rem] text-[#b393fd] cursor-pointer mr-3"
                                onClick={async () => {
                                  const wrongCode =
                                    editorRef.current.getValue();
                                  try {
                                    const res = await axios.post(
                                      BACKEND_URL + "/project/ai-explain",
                                      {
                                        code: wrongCode,
                                        language:
                                          languageName[projectDetails.language],
                                      },
                                      { withCredentials: true }
                                    );
                                    const errorAnalysis = res.data.msg;
                                    setAiExplaination(errorAnalysis);
                                  } catch (e) {
                                    console.log(e);
                                  }
                                }}
                              >
                                <WandSparkles size={17} />
                                AI EXPLAIN
                              </button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0C0E15] text-neutral-400 border-1 border-[#1C1D24]">
                              <DialogHeader>
                                <DialogTitle className="text-white">
                                  AI Analysis of the Error
                                </DialogTitle>
                              </DialogHeader>
                              {aiExplaination === "" ? "Analyzing..." : ""}
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {aiExplaination}
                              </ReactMarkdown>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                      <pre
                        className={`mt-2 ml-1 ${
                          isError ? "text-red-600" : "text-white"
                        }`}
                      >
                        {codeOutput}
                      </pre>
                    </div>
                  )}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            {socketConnection && user && (
              <>
                <ResizableHandle className="bg-[#1C1D24] w-1" />
                <ResizablePanel defaultSize={20} className="flex min-w-[20rem] max-w-[25rem] flex-col overflow-hidden p-2">
                  <VideoConferencePanel
                    roomId={projectId}
                    socket={socketConnection}
                    userId={user}
                    userName={user}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>

        <MainFooter />
      </div>
    );
}

export default Editor;
