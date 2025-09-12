import path from "path";

export const vistaLogin = (req, res) => {
  return res.sendFile(path.join(process.cwd(), "src", "view", "login.html"));
};

export const vistaRegister = (req, res) => {
  return res.sendFile(path.join(process.cwd(), "src", "view", "register.html"));
};