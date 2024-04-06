import * as React from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Background from "../../../assets/images/bg2.jpg";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import register from "../../../services/registerService";

const defaultTheme = createTheme();

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function SignUp() {
  const [image, setImage] = React.useState(null);
  const [alert, setAlert] = React.useState({ type: "success", message: "" });
  const [displayAlert, setDisplayAlert] = React.useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      username: data.get("email"),
      password: data.get("password"),
      firstname: data.get("firstName"),
      lastname: data.get("lastName"),
    };

    if (image) {
      payload.profilePic = image;
    }

    const fiedlsMissing =
      !payload.firstname ||
      !payload.lastname ||
      !payload.username ||
      !payload.password;

    if (fiedlsMissing) {
      setDisplayAlert(true);
      setAlert({ type: "error", message: "All fields are required" });
      setTimeout(() => {
        setDisplayAlert(false);
      }, 3000);
      return;
    }
    const response = await register(payload);
    switch (response.status) {
      case 200:
        setDisplayAlert(true);
        setAlert({ type: "success", message: "User registered successfully" });
        break;
      case 400:
        setDisplayAlert(true);
        setAlert({ type: "error", message: "User already exists" });
        break;
      default:
        setDisplayAlert(true);
        setAlert({ type: "error", message: "Internal Server Error" });
    }
    setTimeout(() => {
      setDisplayAlert(false);
    }, 3000);
  };

  const handleFileInputChange = () => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setDisplayAlert(true);
        setAlert({ type: "success", message: "Image uploaded successfully" });
      };
      reader.readAsDataURL(file);
    } else {
      setDisplayAlert(true);
      setAlert({ type: "error", message: "Failed to upload image" });
    }

    setTimeout(() => {
      setDisplayAlert(false);
    }, 3000);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      {displayAlert && (
        <Alert severity={alert.type} onClose={() => setDisplayAlert(false)}>
          {alert.message}
        </Alert>
      )}
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: `url(${Background})`,
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }} src={image}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 3 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    startIcon={<AccountCircle />}
                  >
                    Upload Profile Picture
                    <VisuallyHiddenInput
                      id="profilePic"
                      name="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                    />
                  </Button>
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/login" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
