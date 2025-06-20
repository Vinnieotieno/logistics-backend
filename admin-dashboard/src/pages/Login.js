"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material"
import { Email, Lock, Visibility, VisibilityOff, LoginOutlined } from "@mui/icons-material"
import { toast } from "react-hot-toast"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      toast.success("Login successful!")
      navigate("/")
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper
            elevation={24}
            sx={{
              padding: { xs: 3, sm: 5 },
              width: "100%",
              maxWidth: 450,
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 25px 45px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 35px 55px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            {/* Header Section */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 10px 30px rgba(134, 197, 23, 0.3)",
                }}
              >
                <LoginOutlined sx={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontWeight: 400,
                }}
              >
                Sign in to your admin account
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: 20,
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Form Section */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                      boxShadow: "0 0 0 3px rgba(134, 197, 23, 0.1)",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#86c517",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#86c517",
                    borderWidth: 2,
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{ color: "action.active" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "white",
                      boxShadow: "0 0 0 3px rgba(134, 197, 23, 0.1)",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#86c517",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#86c517",
                    borderWidth: 2,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  background: "linear-gradient(135deg, #86c517 0%, #68a80d 100%)",
                  boxShadow: "0 8px 25px rgba(134, 197, 23, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #7ab515 0%, #5c950b 100%)",
                    boxShadow: "0 12px 35px rgba(134, 197, 23, 0.4)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    background: "linear-gradient(135deg, #ccc 0%, #999 100%)",
                    boxShadow: "none",
                    transform: "none",
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: "white" }} />
                    <span>Signing In...</span>
                  </Box>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Box>

            {/* Footer Section */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                }}
              >
                Secure admin access • Protected by encryption
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  )
}

export default Login
