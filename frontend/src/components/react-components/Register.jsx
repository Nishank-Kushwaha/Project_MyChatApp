import { RainbowButton } from "../ui/rainbow-button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function RegistrationPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistration = async (e) => {
    e.preventDefault();

    // console.log("Username:", username);
    // console.log("Email:", email);
    // console.log("Password:", password);

    if (!username || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        {
          username,
          email,
          password,
        },
        { withCredentials: true }
      );

      // console.log("Registration successfull:", response);
      alert(`🎉 ${response.data.message}`);
    } catch (error) {
      console.error("Error in registration process:", error);
      alert(`⚠️ ${error.response?.data?.message}`);
    }

    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Register your account</CardTitle>
          <CardDescription>
            Enter your details below to register your account
          </CardDescription>
          <CardAction>
            <RainbowButton asChild variant="link">
              <Link to="/login">Login</Link>
            </RainbowButton>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegistration} id="registration-form">
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="john snow"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <RainbowButton
            type="submit"
            className="w-full"
            form="registration-form"
          >
            Register
          </RainbowButton>
        </CardFooter>
      </Card>
    </div>
  );
}
