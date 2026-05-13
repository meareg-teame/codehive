import HeroNavbar from "./HeroNavbar.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const enterApp = () => {
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col bg-[url('../../grid.svg')]">
      <HeroNavbar />
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

      <div className=" flex flex-col items-center m-[5rem]">
        <Tabs
          defaultValue="account"
          className="w-[400px] [@media(max-width:425px)]:w-[335px]"
        >
          <TabsList className="w-full bg-[#18191A] flex gap-2 h-[2.5rem] mb-[2rem]">
            <TabsTrigger
              value="account"
              className="bg-[#18191A] text-white data-[state=active]:bg-[#0f0f10] cursor-pointer text-[1.1rem]"
            >
              Log in
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="bg-[#18191A] text-white data-[state=active]:bg-[#0F0F10] cursor-pointer text-[1.1rem]"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="text-white flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enterApp();
              }}
            >
              <label htmlFor="login-email">Email</label>
              <Input
                id="login-email"
                placeholder="Email"
                type="email"
                className="border-2 border-[#262829] selection:bg-blue-800"
              />
              <label htmlFor="login-password">Password</label>
              <Input
                id="login-password"
                placeholder="Password"
                type="password"
                className="border-2 border-[#262829] selection:bg-blue-800"
              />
              <button
                className={`bg-[#512FA2] rounded-[0.5rem] py-2 font-semibold mt-3 cursor-pointer hover:bg-[#4a2a93] duration-300 flex items-center justify-center gap-2 ${
                  isLoading ? "pointer-events-none bg-gray-600" : ""
                }`}
                type="submit"
              >
                {isLoading && <Spinner />}
                <p>{isLoading ? "Please wait..." : "Log in"}</p>
              </button>
              <p className="text-gray-500 text-center mt-5">
                Local demo mode: login is bypassed for now.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="password" className="text-white flex flex-col gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enterApp();
              }}
            >
              <label htmlFor="signup-name">Name</label>
              <Input
                id="signup-name"
                placeholder="Name"
                type="text"
                className="border-2 border-[#262829] selection:bg-blue-800"
              />
              <label htmlFor="signup-email">Email</label>
              <Input
                id="signup-email"
                placeholder="Email"
                type="email"
                className="border-2 border-[#262829] selection:bg-blue-800"
              />
              <label htmlFor="signup-password">Password</label>
              <Input
                id="signup-password"
                placeholder="Password"
                type="password"
                className="border-2 border-[#262829] selection:bg-blue-800"
              />
              <button
                className={`bg-[#512FA2] rounded-[0.5rem] py-2 font-semibold mt-3 cursor-pointer hover:bg-[#4a2a93] duration-300 flex items-center justify-center gap-2 ${
                  isLoading ? "pointer-events-none bg-gray-600" : ""
                }`}
                type="submit"
              >
                {isLoading && <Spinner />}
                <p>{isLoading ? "Please wait..." : "Sign up"}</p>
              </button>
              <p className="text-gray-500 text-center mt-5">
                Local demo mode: account creation is bypassed for now.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Auth;